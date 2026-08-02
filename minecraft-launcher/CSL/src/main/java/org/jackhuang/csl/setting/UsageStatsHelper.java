/*
 * CSL - Craft Something Launcher
 * Copyright (C) 2026 huangyuhui <huanghongxun2008@126.com> and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package org.jackhuang.csl.setting;


/// Convenience helper for recording usage statistics from anywhere in the codebase.
///
/// All methods silently ignore failures when the statistics store has not been loaded yet.
///
/// @author Glavo
public final class UsageStatsHelper {

    private UsageStatsHelper() {
    }

    /// Records a game launch attempt.
    public static void recordLaunch() {
        try {
            SettingsManager.usageStats().incrementLaunchCount();
        } catch (IllegalStateException ignored) {
        }
    }

    /// Records a successful game launch (game window opened).
    public static void recordLaunchSuccess() {
        try {
            SettingsManager.usageStats().incrementLaunchSuccessCount();
        } catch (IllegalStateException ignored) {
        }
    }

    /// Records a game launch failure.
    public static void recordLaunchFailure() {
        try {
            SettingsManager.usageStats().incrementLaunchFailureCount();
        } catch (IllegalStateException ignored) {
        }
    }

    /// Records game play time in milliseconds.
    public static void recordGameTime(long ms) {
        try {
            SettingsManager.usageStats().addGameTimeMs(ms);
        } catch (IllegalStateException ignored) {
        }
    }

    /// Records a file download with the given byte count.
    public static void recordDownload(long bytes) {
        try {
            SettingsManager.usageStats().recordDownload(bytes);
        } catch (IllegalStateException ignored) {
        }
    }

    /// Records a game instance deletion.
    public static void recordDelete() {
        try {
            SettingsManager.usageStats().incrementDeleteCount();
        } catch (IllegalStateException ignored) {
        }
    }

    /// Records an error occurrence.
    public static void recordError() {
        try {
            SettingsManager.usageStats().incrementErrorCount();
        } catch (IllegalStateException ignored) {
        }
    }

    /// Records a multiplayer session.
    public static void recordMultiplayer() {
        try {
            SettingsManager.usageStats().incrementMultiplayerCount();
        } catch (IllegalStateException ignored) {
        }
    }

    /// Records a modpack installation.
    public static void recordModpackInstall() {
        try {
            SettingsManager.usageStats().incrementModpackInstallCount();
        } catch (IllegalStateException ignored) {
        }
    }

    /// Records a game instance creation.
    public static void recordInstanceCreate() {
        try {
            SettingsManager.usageStats().incrementInstanceCreateCount();
        } catch (IllegalStateException ignored) {
        }
    }

    /// Records launcher runtime in milliseconds.
    public static void recordLauncherRuntime(long ms) {
        try {
            SettingsManager.usageStats().addLauncherRuntimeMs(ms);
        } catch (IllegalStateException ignored) {
        }
    }

    private static long launcherStartTimeMs;

    /// Marks the start of the launcher session for runtime tracking.
    public static void startLauncherTimer() {
        launcherStartTimeMs = System.currentTimeMillis();
    }

    /// Records the launcher runtime since startLauncherTimer() was called.
    public static void stopLauncherTimer() {
        if (launcherStartTimeMs > 0) {
            long elapsed = System.currentTimeMillis() - launcherStartTimeMs;
            recordLauncherRuntime(elapsed);
            launcherStartTimeMs = 0;
        }
    }
}