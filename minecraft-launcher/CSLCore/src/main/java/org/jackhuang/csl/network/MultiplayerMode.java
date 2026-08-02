/*
 * CSL - Craft Something Launcher
 * Copyright (C) 2026 CSL contributors
 */
package org.jackhuang.csl.network;

import org.jetbrains.annotations.NotNullByDefault;

/// Transport modes supported by the launcher-owned multiplayer control plane.
@NotNullByDefault
public enum MultiplayerMode {
    /// Direct connection to a reachable Minecraft server endpoint.
    DIRECT,
    /// A bundled frpc client exposes a local Minecraft server through FRP.
    FRP,
    /// Peer-to-peer transport configuration; signalling is supplied by the endpoint.
    P2P,
    /// LAN multiplayer: auto-detects local IP, no public address required.
    LAN
}
