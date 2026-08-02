/*
 * CSL - Craft Something Launcher
 * Copyright (C) 2026 CSL contributors
 */
package org.jackhuang.csl.network.frp;

import org.jackhuang.csl.util.platform.ManagedProcess;
import org.jackhuang.csl.util.platform.Platform;
import org.jackhuang.csl.util.tree.TarFileTree;
import kala.compress.archivers.tar.TarArchiveEntry;
import org.jetbrains.annotations.NotNullByDefault;
import org.jetbrains.annotations.Nullable;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.TimeUnit;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import static org.jackhuang.csl.util.logging.Logger.LOG;

/// Extracts and manages the bundled FRP client for the current operating system.
@NotNullByDefault
public final class FrpcManager implements AutoCloseable {
    private static final String RESOURCE_ROOT = "/assets/frp/";
    private static final AtomicLong CONFIG_COUNTER = new AtomicLong();
    private final FrpPlatform platform;
    private final Path installDirectory;
    private final Path configurationFile;
    private @Nullable ManagedProcess process;

    /// Returns the bundled FRP platform for the current system when available.
    public static Optional<FrpPlatform> currentPlatform() {
        return Optional.ofNullable(FrpPlatform.forPlatform(Platform.SYSTEM_PLATFORM));
    }

    /// Creates a manager that selects an exact binary for the current system.
    public FrpcManager() {
        this.platform = Objects.requireNonNull(FrpPlatform.forPlatform(Platform.SYSTEM_PLATFORM),
                "FRP is not available for platform " + Platform.SYSTEM_PLATFORM);
        Path dependencies = Path.of(System.getProperty("csl.dependencies.dir",
            Path.of(System.getProperty("user.dir"), ".csl", "dependencies").toString()));
        this.installDirectory = dependencies.resolve("frp/0.70.1/" + platform.name().toLowerCase());
        this.configurationFile = installDirectory.resolve("frpc-" + CONFIG_COUNTER.incrementAndGet() + ".ini");
    }

    /// Starts frpc with an INI-compatible configuration file.
    public synchronized void start(String configuration) throws IOException {
        stop();
        Path executable = install();
        Files.writeString(configurationFile, configuration);
        ManagedProcess managed = new ManagedProcess(new ProcessBuilder(List.of(executable.toString(), "-c", configurationFile.toString()))
                .directory(installDirectory.toFile()));
        managed.pumpInputStream(line -> LOG.info("[frpc] " + line));
        managed.pumpErrorStream(line -> LOG.warning("[frpc] " + line));
        process = managed;
        LOG.info("Started bundled frpc for " + platform.name());
        if (!managed.isRunning()) {
            process = null;
            throw new IOException("内置 frpc 启动后立即退出，请检查 FRP 配置和日志。");
        }
    }

    /// Returns whether the bundled frpc process is currently running.
    public synchronized boolean isRunning() {
        return process != null && process.isRunning();
    }

    /// Stops frpc gracefully, escalating only when it does not exit promptly.
    public synchronized void stop() {
        ManagedProcess managed = process;
        process = null;
        if (managed == null) return;
        managed.getProcess().destroy();
        try {
            if (!managed.getProcess().waitFor(2, TimeUnit.SECONDS)) managed.getProcess().destroyForcibly();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            managed.getProcess().destroyForcibly();
        } finally {
            managed.destroyRelatedThreads();
        }
    }

    @Override
    public void close() {
        stop();
    }

    private Path install() throws IOException {
        Files.createDirectories(installDirectory);
        Path executable = installDirectory.resolve(platform.executableName());
        if (Files.isExecutable(executable)) return executable;

        Path archive = installDirectory.resolve(platform.archiveName());
        try (InputStream source = FrpcManager.class.getResourceAsStream(RESOURCE_ROOT + platform.archiveName())) {
            if (source == null) throw new IOException("Bundled FRP resource is missing: " + platform.archiveName());
            Files.copy(source, archive, StandardCopyOption.REPLACE_EXISTING);
        }
        if (platform.archiveName().endsWith(".zip")) extractZip(archive, executable);
        else extractTarGz(archive, executable);
        Files.deleteIfExists(archive);
        if (!isWindows()) executable.toFile().setExecutable(true, true);
        return executable;
    }

    private void extractZip(Path archive, Path target) throws IOException {
        try (ZipFile zip = new ZipFile(archive.toFile())) {
            ZipEntry entry = zip.stream().filter(item -> item.getName().endsWith("/" + platform.executableName()))
                    .findFirst().orElseThrow(() -> new IOException("FRP archive does not contain frpc"));
            copyChecked(zip.getInputStream(entry), target);
        }
    }

    private void extractTarGz(Path archive, Path target) throws IOException {
        try (TarFileTree tree = TarFileTree.open(archive)) {
            TarArchiveEntry entry = findTarEntry(tree.getRoot());
            copyChecked(tree.getInputStream(entry), target);
        }
    }

    private TarArchiveEntry findTarEntry(org.jackhuang.csl.util.tree.ArchiveFileTree.Dir<TarArchiveEntry> directory)
            throws IOException {
        for (TarArchiveEntry entry : directory.getFiles().values()) {
            if (entry.getName().endsWith("/" + platform.executableName())
                    || entry.getName().equals(platform.executableName())) return entry;
        }
        for (org.jackhuang.csl.util.tree.ArchiveFileTree.Dir<TarArchiveEntry> child : directory.getSubDirs().values()) {
            try {
                return findTarEntry(child);
            } catch (IOException ignored) {
            }
        }
        throw new IOException("FRP tar archive does not contain frpc");
    }

    private static void copyChecked(InputStream input, Path target) throws IOException {
        try (input) {
            Files.copy(input, target, StandardCopyOption.REPLACE_EXISTING);
        }
    }

    private static boolean isWindows() {
        return System.getProperty("os.name").toLowerCase().contains("win");
    }
}
