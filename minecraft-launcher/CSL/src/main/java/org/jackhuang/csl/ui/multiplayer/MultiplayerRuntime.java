/*
 * CSL - Craft Something Launcher
 * Copyright (C) 2026 CSL contributors
 */
package org.jackhuang.csl.ui.multiplayer;

import org.jackhuang.csl.network.MultiplayerMode;
import org.jackhuang.csl.network.frp.FrpcManager;
import org.jetbrains.annotations.NotNullByDefault;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/// Owns independently running multiplayer profile processes.
@NotNullByDefault
final class MultiplayerRuntime implements AutoCloseable {
    private final Map<String, FrpcManager> running = new HashMap<>();

    /// Starts one FRP profile without stopping other running profiles.
    synchronized void start(MultiplayerProfileStore.Profile profile) throws IOException {
        if (profile.mode() != MultiplayerMode.FRP) {
            throw new IOException("只有 FRP 配置支持同时运行。");
        }
        int localPort = requiredPort(profile.configuration(), "local_port");
        if (profile.port() != localPort) {
            throw new IOException("配置“" + profile.name() + "”端口不一致：本地端口 "
                    + profile.port() + "，FRP local_port " + localPort + "。");
        }
        String localHost = value(profile.configuration(), "local_ip", "127.0.0.1");
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(localHost, localPort), 1500);
        } catch (IOException exception) {
            throw new IOException("配置“" + profile.name() + "”的本地服务端未在 "
                    + localHost + ":" + localPort + " 监听。", exception);
        }
        stop(profile.name());
        FrpcManager manager = new FrpcManager();
        try {
            manager.start(profile.configuration());
            running.put(profile.name(), manager);
        } catch (IOException exception) {
            manager.stop();
            throw exception;
        }
    }

    /// Stops one running profile.
    synchronized void stop(String profileName) {
        FrpcManager manager = running.remove(profileName);
        if (manager != null) manager.stop();
    }

    /// Stops all running profiles.
    synchronized void stopAll() {
        running.values().forEach(FrpcManager::stop);
        running.clear();
    }

    /// Returns a snapshot of currently running profile names.
    synchronized Set<String> runningNames() {
        return Set.copyOf(running.keySet());
    }

    @Override
    public void close() {
        stopAll();
    }

    private static String value(String configuration, String key, String fallback) {
        for (String line : configuration.split("\\R")) {
            String trimmed = line.trim();
            if (trimmed.startsWith(key) && trimmed.contains("=")) {
                return trimmed.substring(trimmed.indexOf('=') + 1).trim();
            }
        }
        return fallback;
    }

    private static int requiredPort(String configuration, String key) throws IOException {
        try {
            int port = Integer.parseInt(value(configuration, key, ""));
            if (port < 1 || port > 65535) throw new NumberFormatException();
            return port;
        } catch (NumberFormatException exception) {
            throw new IOException("配置中的 " + key + " 必须是 1 到 65535 之间的数字。", exception);
        }
    }
}
