/*
 * CSL - Craft Something Launcher
 * Copyright (C) 2024 huangyuhui <huanghongxun2008@126.com> and contributors
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
package org.jackhuang.csl.game;

import org.jackhuang.csl.util.Log4jLevel;
import org.jetbrains.annotations.NotNullByDefault;
import org.jetbrains.annotations.Nullable;

import static org.jackhuang.csl.setting.SettingsManager.settings;

/// Represents a single line of game output log, with an optional pre-classified
/// [Log4jLevel]. When the level is absent, it is lazily guessed from the log text
/// on first access to [getLevel].
///
/// @author huangyuhui
@NotNullByDefault
public final class GameLog {
    /// Default upper bound on the number of log lines retained in memory when the
    /// user has not configured a custom value (see [getLogLines]).
    public static final int DEFAULT_LOG_LINES = 2000;

    /// Returns the number of game log lines to retain, as configured by the user.
    /// Falls back to [DEFAULT_LOG_LINES] when the setting is absent or non-positive.
    public static int getLogLines() {
        Integer lines = settings().logLinesProperty().get();
        return lines != null && lines > 0 ? lines : DEFAULT_LOG_LINES;
    }

    private final @Nullable String log;
    private @Nullable Log4jLevel level;

    /// Constructs a game log line whose level will be guessed lazily from `log`.
    public GameLog(@Nullable String log) {
        this.log = log;
    }

    /// Constructs a game log line with an explicitly classified `level`.
    public GameLog(@Nullable String log, @Nullable Log4jLevel level) {
        this.log = log;
        this.level = level;
    }

    /// Returns the raw log text.
    public @Nullable String getLog() {
        return log;
    }

    /// Returns the [Log4jLevel] of this log line. When no level was supplied at
    /// construction, it is guessed from the log text and cached; a guess that
    /// fails falls back to [Log4jLevel#INFO].
    public Log4jLevel getLevel() {
        Log4jLevel level = this.level;
        if (level == null) {
            level = Log4jLevel.guessLevel(log);
            if (level == null)
                level = Log4jLevel.INFO;
            this.level = level;
        }
        return level;
    }

    @Override
    public String toString() {
        return log;
    }
}
