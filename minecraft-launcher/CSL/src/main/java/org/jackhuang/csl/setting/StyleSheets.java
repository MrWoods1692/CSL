/*
 * CSL - Craft Something Launcher
 * Copyright (C) 2025 huangyuhui <huanghongxun2008@126.com> and contributors
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

import javafx.beans.binding.Bindings;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.scene.Scene;
import javafx.scene.paint.Color;
import org.glavo.monetfx.Brightness;
import org.glavo.monetfx.ColorRole;
import org.glavo.monetfx.ColorScheme;
import org.jackhuang.csl.theme.ResolvedTheme;
import org.jackhuang.csl.theme.ThemeColor;
import org.jackhuang.csl.theme.Themes;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Base64;

/**
 * @author Glavo
 */
public final class StyleSheets {
    private static final int THEME_STYLE_SHEET_INDEX = 1;
    private static final int BRIGHTNESS_SHEET_INDEX = 2;

    private static final ObservableList<String> stylesheets;

    static {
        String[] array = new String[]{
                getFontStyleSheet(),
                getThemeStyleSheet(),
                getBrightnessStyleSheet(),
                "/assets/css/root.css"
        };
        stylesheets = FXCollections.observableList(Arrays.asList(array));

        Themes.colorSchemeProperty().addListener(o -> {
            stylesheets.set(THEME_STYLE_SHEET_INDEX, getThemeStyleSheet());
            stylesheets.set(BRIGHTNESS_SHEET_INDEX, getBrightnessStyleSheet());
        });
    }

    private static String toStyleSheetUri(String styleSheet) {
        return "data:text/css;charset=UTF-8;base64," + Base64.getEncoder().encodeToString(styleSheet.getBytes(StandardCharsets.UTF_8));
    }

    private static String getFontStyleSheet() {
        // Always use the default font.css with CJK fallbacks.
        // Dynamic font loading is disabled because it loads fonts without CJK glyphs
        // (e.g. Liberation Sans) and breaks Chinese character rendering.
        return "/assets/css/font.css";
    }

    private static String getBrightnessStyleSheet() {
        return Themes.getColorScheme().getBrightness() == Brightness.LIGHT
                ? "/assets/css/brightness-light.css"
                : "/assets/css/brightness-dark.css";
    }

    private static void addColor(StringBuilder builder, String name, Color color) {
        builder.append("  ").append(name)
                .append(": ").append(ThemeColor.getColorDisplayName(color)).append(";\n");
    }

    private static void addColor(StringBuilder builder, ColorScheme scheme, ColorRole role, double opacity) {
        builder.append("  ").append(role.getVariableName()).append("-transparent-%02d".formatted((int) (100 * opacity)))
                .append(": ").append(ThemeColor.getColorDisplayNameWithOpacity(scheme.getColor(role), opacity))
                .append(";\n");
    }

    private static String getThemeStyleSheet() {
        final String blueCss = "/assets/css/blue.css";

        if (ResolvedTheme.DEFAULT.equals(Themes.getTheme()))
            return blueCss;

        ColorScheme scheme = Themes.getColorScheme();

        StringBuilder builder = new StringBuilder();
        builder.append("* {\n");
        for (ColorRole colorRole : ColorRole.ALL) {
            addColor(builder, colorRole.getVariableName(), scheme.getColor(colorRole));
        }

        addColor(builder, "-monet-primary-seed", scheme.getPrimaryColorSeed());

        addColor(builder, scheme, ColorRole.PRIMARY, 0.5);
        addColor(builder, scheme, ColorRole.SECONDARY_CONTAINER, 0.5);
        addColor(builder, scheme, ColorRole.SURFACE, 0.5);
        addColor(builder, scheme, ColorRole.SURFACE, 0.8);
        addColor(builder, scheme, ColorRole.ON_SURFACE_VARIANT, 0.38);
        addColor(builder, scheme, ColorRole.SURFACE_CONTAINER_LOW, 0.8);
        addColor(builder, scheme, ColorRole.SECONDARY_CONTAINER, 0.8);
        addColor(builder, scheme, ColorRole.INVERSE_SURFACE, 0.8);

        builder.append("}\n");
        return toStyleSheetUri(builder.toString());
    }

    public static void init(Scene scene) {
        Bindings.bindContent(scene.getStylesheets(), stylesheets);
    }

    private StyleSheets() {
    }
}
