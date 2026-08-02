/*
 * CSL - Craft Something Launcher
 * Copyright (C) 2026 CSL contributors
 */
package org.jackhuang.csl.network;

import org.jetbrains.annotations.NotNullByDefault;
import org.jetbrains.annotations.Nullable;

import java.util.concurrent.atomic.AtomicReference;

/// Small lifecycle state machine shared by the desktop multiplayer UI and transports.
@NotNullByDefault
public final class MultiplayerSession implements AutoCloseable {
    /// Current session state.
    public enum State { IDLE, STARTING, RUNNING, FAILED, STOPPED }

    private final AtomicReference<State> state = new AtomicReference<>(State.IDLE);
    private @Nullable String error;

    /// Transitions the session to a new state and records an optional failure message.
    public synchronized void transition(State next, @Nullable String failure) {
        state.set(next);
        error = failure;
    }

    /// Returns the current state.
    public State state() {
        return state.get();
    }

    /// Returns the last failure message, or `null` when no failure was recorded.
    public synchronized @Nullable String error() {
        return error;
    }

    /// Marks the session stopped.
    @Override
    public void close() {
        transition(State.STOPPED, null);
    }
}
