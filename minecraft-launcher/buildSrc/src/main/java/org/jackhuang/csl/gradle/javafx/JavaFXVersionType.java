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
package org.jackhuang.csl.gradle.javafx;

/**
 * @author Glavo
 */
public enum JavaFXVersionType {
    // 使用经典 JavaFX 版本，适用于 Java 17
    CLASSIC("classic", 17),
    // 使用现代 JavaFX 版本，适用于 Java 23 及更高版本
    MODERN("modern", 23);

    private final String name;  // 版本类别名称
    private final int javaVersion;  // 对应的最低 Java 版本要求

    JavaFXVersionType(String name, int javaVersion) {
        this.name = name;
        this.javaVersion = javaVersion;
    }

    // 返回版本类别名称
    public String getName() {
        return name;
    }

    // 返回所需的 Java 版本
    public int getJavaVersion() {
        return javaVersion;
    }
}
