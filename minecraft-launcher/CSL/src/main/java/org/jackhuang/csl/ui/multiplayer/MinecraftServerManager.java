/*
 * CSL - Craft Something Launcher
 * Copyright (C) 2026 CSL contributors
 */
package org.jackhuang.csl.ui.multiplayer;

import org.jackhuang.csl.game.CSLGameRepository;
import org.jackhuang.csl.game.DownloadInfo;
import org.jackhuang.csl.game.DownloadType;
import org.jackhuang.csl.game.GameInstanceID;
import org.jackhuang.csl.game.GameInstanceManifest;
import org.jackhuang.csl.java.JavaManager;
import org.jackhuang.csl.java.JavaRuntime;
import org.jackhuang.csl.setting.GameDirectoryManager;
import org.jackhuang.csl.setting.UsageStatsHelper;
import org.jetbrains.annotations.NotNullByDefault;
import org.jetbrains.annotations.Nullable;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CompletableFuture;
import java.util.zip.ZipFile;

/// Downloads and owns the local Minecraft server process for multiplayer startup.
@NotNullByDefault
public final class MinecraftServerManager implements AutoCloseable {
    private static final String SERVER_JAR = "server.jar";
    private static final Duration DOWNLOAD_TIMEOUT = Duration.ofMinutes(10);
    private static final Duration START_TIMEOUT = Duration.ofSeconds(30);

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();
            private final List<String> logLines = new CopyOnWriteArrayList<>();
            private final List<java.util.function.Consumer<String>> logListeners = new CopyOnWriteArrayList<>();
    private @Nullable Process process;
    private static volatile boolean serverRunning;

    public static boolean isServerRunning() {
        return serverRunning;
    }

    /// Adds a listener that receives each newly captured server log line.
    void addLogListener(java.util.function.Consumer<String> listener) {
        logListeners.add(listener);
    }

    /// Removes a previously registered server log listener.
    void removeLogListener(java.util.function.Consumer<String> listener) {
        logListeners.remove(listener);
    }

    /// Returns a snapshot of the most recent server log lines.
    synchronized List<String> getLogLines() {
        return List.copyOf(logLines);
    }

    /// Ensures the selected instance has a server jar and a listening server process.
    /// Concurrent callers share this manager's serialized startup operation.
    CompletableFuture<Void> ensureRunning(int port, Set<String> ops) {
        return CompletableFuture.runAsync(() -> {
            if (isListening(port)) return;
            try {
                synchronized (this) {
                    if (!isListening(port)) startBlocking(port, ops);
                }
            } catch (IOException exception) {
                throw new IllegalStateException(exception.getMessage(), exception);
            }
        });
    }

    /// Stops the server process started by this manager.
    @Override
    public synchronized void close() {
        if (process != null && process.isAlive()) {
            process.destroy();
            try {
                if (!process.waitFor(2, java.util.concurrent.TimeUnit.SECONDS)) {
                    process.destroyForcibly();
                }
            } catch (InterruptedException exception) {
                Thread.currentThread().interrupt();
                process.destroyForcibly();
            }
            process = null;
        }
        serverRunning = false;
    }

    private void startBlocking(int port, Set<String> ops) throws IOException {
        CSLGameRepository repository = GameDirectoryManager.getSelectedRepository();
        @Nullable GameInstanceID instanceId = repository.getSelectedInstance();
        if (instanceId == null || !repository.isLoaded() || !repository.hasInstance(instanceId)) {
            throw new IOException("未选择 Minecraft 配置，请先下载并选择一个游戏实例。 ");
        }

        GameInstanceManifest manifest = repository.getResolvedInstanceManifest(instanceId).launchManifest();
        DownloadInfo download = manifest.getDownloads().get(DownloadType.SERVER);
        if (download == null || download.getUrl().isBlank()) {
            throw new IOException("当前 Minecraft 配置没有可用的服务端下载文件，请先在下载页面安装服务端。 ");
        }

        Path runDirectory = repository.getRunDirectory(instanceId).toAbsolutePath().normalize();
        Files.createDirectories(runDirectory);
        Path serverJar = runDirectory.resolve(SERVER_JAR).toAbsolutePath().normalize();
        if (Files.notExists(serverJar) || Files.size(serverJar) == 0L) {
            download(download.getUrl(), serverJar);
        }

        Path eula = runDirectory.resolve("eula.txt");
        if (Files.notExists(eula)) {
            Files.writeString(eula, "# Generated by CSL for automatic server startup.\neula=true\n");
        }
        ensureServerProperties(runDirectory, port);
        writeOps(runDirectory, ops);

        synchronized (this) {
            if (isListening(port)) {
                serverRunning = true;
                return;
            }
                    logLines.clear();
                    process = new ProcessBuilder(javaCommand(serverJar), "-jar", serverJar.toString(), "nogui")
                    .directory(runDirectory.toFile())
                    .redirectErrorStream(true)
                    .start();
                    Process started = process;
                    Thread logger = new Thread(() -> captureLogs(started), "CSL-Minecraft-Server-Log");
                    logger.setDaemon(true);
                    logger.start();
        }

        long deadline = System.nanoTime() + START_TIMEOUT.toNanos();
        while (System.nanoTime() < deadline) {
            if (isListening(port)) {
                synchronized (this) {
                    serverRunning = true;
                    UsageStatsHelper.recordMultiplayer();
                    Process started = process;
                    if (started != null) {
                        started.onExit().thenRun(() -> {
                            synchronized (MinecraftServerManager.this) {
                                if (process == started) {
                                    process = null;
                                    serverRunning = false;
                                }
                            }
                        });
                    }
                }
                return;
            }
            synchronized (this) {
                if (process != null && !process.isAlive()) {
                    throw new IOException("Minecraft 服务端启动后立即退出，请检查服务端日志。 ");
                }
            }
            try {
                Thread.sleep(250L);
            } catch (InterruptedException exception) {
                Thread.currentThread().interrupt();
                throw new IOException("等待 Minecraft 服务端启动时被中断。", exception);
            }
        }
        synchronized (this) {
            Process timedOut = process;
            if (timedOut != null && timedOut.isAlive()) {
                timedOut.destroy();
                try {
                    if (!timedOut.waitFor(2, java.util.concurrent.TimeUnit.SECONDS)) {
                        timedOut.destroyForcibly();
                    }
                } catch (InterruptedException exception) {
                    Thread.currentThread().interrupt();
                    timedOut.destroyForcibly();
                }
            }
            process = null;
            serverRunning = false;
        }
        throw new IOException("Minecraft 服务端启动超时，未在 127.0.0.1:" + port + " 监听。 ");
    }

    private void captureLogs(Process serverProcess) {
        try (java.io.BufferedReader reader = serverProcess.inputReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                String capturedLine = line;
                synchronized (this) {
                    logLines.add(capturedLine);
                    if (logLines.size() > 500) logLines.remove(0);
                }
                logListeners.forEach(listener -> listener.accept(capturedLine));
            }
        } catch (IOException ignored) {
            // The stream is closed during normal process shutdown.
        }
    }

    private static void ensureServerProperties(Path runDirectory, int port) throws IOException {
        Path propertiesFile = runDirectory.resolve("server.properties");
        String content = Files.exists(propertiesFile) ? Files.readString(propertiesFile) : "";
        String[] lines = content.split("\\R", -1);
        StringBuilder result = new StringBuilder(content.length() + 128);
        boolean portConfigured = false;
        boolean onlineModeConfigured = false;
        boolean secureProfileConfigured = false;
        boolean proxyConnectionsConfigured = false;
        for (String line : lines) {
            if (line.startsWith("server-port=")) {
                result.append("server-port=").append(port);
                portConfigured = true;
            } else if (line.trim().startsWith("online-mode=")) {
                result.append("online-mode=false");
                onlineModeConfigured = true;
            } else if (line.trim().startsWith("enforce-secure-profile=")) {
                result.append("enforce-secure-profile=false");
                secureProfileConfigured = true;
            } else if (line.trim().startsWith("prevent-proxy-connections=")) {
                result.append("prevent-proxy-connections=false");
                proxyConnectionsConfigured = true;
            } else {
                result.append(line);
            }
            result.append(System.lineSeparator());
        }
        if (!portConfigured) {
            result.append("server-port=").append(port).append(System.lineSeparator());
        }
        if (!onlineModeConfigured) {
            result.append("online-mode=false").append(System.lineSeparator());
        }
        if (!secureProfileConfigured) {
            result.append("enforce-secure-profile=false").append(System.lineSeparator());
        }
        if (!proxyConnectionsConfigured) {
            result.append("prevent-proxy-connections=false").append(System.lineSeparator());
        }
        Files.writeString(propertiesFile, result.toString());
    }

    /// Writes the Minecraft ops.json file with the given operator names.
    /// Each entry grants level-4 (full) operator permissions and bypasses player limit.
    private static void writeOps(Path runDirectory, Set<String> ops) throws IOException {
        if (ops.isEmpty()) {
            // Write an empty array so the file exists but has no ops.
            Files.writeString(runDirectory.resolve("ops.json"), "[]");
            return;
        }
        StringBuilder json = new StringBuilder("[\n");
        int i = 0;
        for (String name : ops) {
            if (i > 0) json.append(",\n");
            json.append("  {\n");
            json.append("    \"uuid\": \"").append(offlineUuid(name)).append("\",\n");
            json.append("    \"name\": \"").append(escapeJson(name)).append("\",\n");
            json.append("    \"level\": 4,\n");
            json.append("    \"bypassesPlayerLimit\": true\n");
            json.append("  }");
            i++;
        }
        json.append("\n]");
        Files.writeString(runDirectory.resolve("ops.json"), json.toString());
    }

    /// Generates a deterministic offline-mode UUID from a player name.
    private static String offlineUuid(String name) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(("OfflinePlayer:" + name).getBytes(java.nio.charset.StandardCharsets.UTF_8));
            digest[6] = (byte) ((digest[6] & 0x0f) | 0x30);
            digest[8] = (byte) ((digest[8] & 0x3f) | 0x80);
            StringBuilder hex = new StringBuilder(36);
            for (int i = 0; i < 16; i++) {
                if (i == 4 || i == 6 || i == 8 || i == 10) hex.append('-');
                hex.append(String.format("%02x", digest[i]));
            }
            return hex.toString();
        } catch (java.security.NoSuchAlgorithmException ignored) {
            return "00000000-0000-0000-0000-000000000000";
        }
    }

    private static String escapeJson(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private void download(String url, Path target) throws IOException {
        Path temporary = target.resolveSibling(target.getFileName() + ".part");
        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                .timeout(DOWNLOAD_TIMEOUT)
                .header("User-Agent", "CSL Minecraft Launcher")
                .GET()
                .build();
        try {
            HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                response.body().close();
                throw new IOException("服务端下载失败，HTTP " + response.statusCode() + "。 ");
            }
            try (InputStream input = response.body()) {
                Files.copy(input, temporary, StandardCopyOption.REPLACE_EXISTING);
            }
            Files.move(temporary, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IOException("服务端下载被中断。", exception);
        } finally {
            Files.deleteIfExists(temporary);
        }
    }

    private static boolean isListening(int port) {
        try (java.net.Socket socket = new java.net.Socket()) {
            socket.connect(new java.net.InetSocketAddress("127.0.0.1", port), 500);
            return true;
        } catch (IOException ignored) {
            return false;
        }
    }

    private static String javaCommand(Path serverJar) throws IOException {
        int requiredJavaVersion = getRequiredJavaVersion(serverJar);
        if (requiredJavaVersion > 0) {
            try {
                @Nullable JavaRuntime runtime = JavaManager.getAllJava().stream()
                        .filter(java -> java.getParsedVersion() >= requiredJavaVersion)
                        .max(Comparator.comparingInt(JavaRuntime::getParsedVersion))
                        .orElse(null);
                if (runtime != null) {
                    return runtime.getBinary().toString();
                }
            } catch (InterruptedException exception) {
                Thread.currentThread().interrupt();
                throw new IOException("查找可用 Java 运行时被中断。", exception);
            }
            throw new IOException("服务端需要 Java " + requiredJavaVersion
                    + " 或更高版本，但本机未找到兼容的 Java。请在 Java 管理页面安装对应版本。 ");
        }

        return Path.of(System.getProperty("java.home"), "bin",
                System.getProperty("os.name").startsWith("Windows") ? "java.exe" : "java").toString();
    }

    private static int getRequiredJavaVersion(Path serverJar) throws IOException {
        try (ZipFile zip = new ZipFile(serverJar.toFile())) {
            var entry = zip.getEntry("net/minecraft/bundler/Main.class");
            if (entry == null) return 0;
            try (InputStream input = zip.getInputStream(entry)) {
                byte[] header = input.readNBytes(8);
                if (header.length < 8 || header[0] != (byte) 0xCA || header[1] != (byte) 0xFE
                        || header[2] != (byte) 0xBA || header[3] != (byte) 0xBE) return 0;
                int majorVersion = ((header[6] & 0xFF) << 8) | (header[7] & 0xFF);
                return Math.max(1, majorVersion - 44);
            }
        }
    }
}
