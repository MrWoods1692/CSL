/*
 * CSL - Craft Something Launcher
 * Copyright (C) 2021  huangyuhui <huanghongxun2008@126.com> and contributors
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
package org.jackhuang.csl.ui;

import javafx.scene.Cursor;
import javafx.scene.ImageCursor;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import org.jetbrains.annotations.NotNullByDefault;
import org.jetbrains.annotations.Nullable;

import java.util.Map;

/// Manages applying the user-selected mouse cursor style to the application scene.
@NotNullByDefault
public final class CursorManager {
    /// Maps cursor style keys to their built-in image resource paths.
    private static final Map<String, String> CURSOR_IMAGE_PATHS = Map.ofEntries(
            Map.entry("cursor_1", "/assets/img/cursors/cursor_1.png"),
            Map.entry("cursor_2", "/assets/img/cursors/cursor_2.png"),
            Map.entry("cursor_3", "/assets/img/cursors/cursor_3.png"),
            Map.entry("cursor_4", "/assets/img/cursors/cursor_4.png"),
            Map.entry("cursor_5", "/assets/img/cursors/cursor_5.png"),
            Map.entry("cursor_6", "/assets/img/cursors/cursor_6.png"),
            Map.entry("cursor_7", "/assets/img/cursors/cursor_7.png"),
            Map.entry("cursor_8", "/assets/img/cursors/cursor_8.png"),
            Map.entry("cursor_9", "/assets/img/cursors/cursor_9.png"),
            Map.entry("cursor_10", "/assets/img/cursors/cursor_10.png"),
            Map.entry("cursor_11", "/assets/img/cursors/cursor_11.png"),
            Map.entry("cursor_12", "/assets/img/cursors/cursor_12.png")
    );

    private CursorManager() {
    }

    /// Applies the cursor style with the given key to the current scene.
    /// A `null` or unrecognised key resets the cursor to the system default.
    ///
    /// @param cursorStyle the cursor style key, or `null` for the default cursor
    public static void applyCursor(@Nullable String cursorStyle) {
        Scene scene = Controllers.getStage() != null ? Controllers.getStage().getScene() : null;
        if (scene == null) {
            return;
        }

        if (cursorStyle == null || cursorStyle.isBlank()) {
            scene.setCursor(Cursor.DEFAULT);
            return;
        }

        String imagePath = CURSOR_IMAGE_PATHS.get(cursorStyle);
        if (imagePath == null) {
            scene.setCursor(Cursor.DEFAULT);
            return;
        }

        try {
            Image image = FXUtils.newBuiltinImage(imagePath);
            scene.setCursor(new ImageCursor(image, 0, 0));
        } catch (Exception e) {
            scene.setCursor(Cursor.DEFAULT);
        }
    }
}
