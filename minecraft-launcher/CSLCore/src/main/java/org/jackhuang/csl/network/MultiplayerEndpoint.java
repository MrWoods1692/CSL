/*
 * CSL - Craft Something Launcher
 * Copyright (C) 2026 CSL contributors
 */
package org.jackhuang.csl.network;

import org.jetbrains.annotations.NotNullByDefault;

import java.util.Objects;

/// Immutable endpoint used by the launcher multiplayer control plane.
@NotNullByDefault
public record MultiplayerEndpoint(String host, int port) {
    /// Creates an endpoint and validates its host and TCP/UDP port.
    public MultiplayerEndpoint {
        Objects.requireNonNull(host, "host");
        if (host.isBlank()) throw new IllegalArgumentException("host must not be blank");
        if (port < 1 || port > 65535) throw new IllegalArgumentException("port out of range: " + port);
    }
}
