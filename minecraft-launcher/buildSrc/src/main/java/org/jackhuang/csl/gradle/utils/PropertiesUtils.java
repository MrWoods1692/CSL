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
package org.jackhuang.csl.gradle.utils;

import org.jetbrains.annotations.NotNull;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;

/// @author Glavo
/// 属性文件工具类
/// @author Glavo
public final class PropertiesUtils {
    // 从路径加载 Properties 文件
    public static @NotNull Properties load(Path path) throws IOException {
        Properties properties = new Properties();  // 创建 Properties 对象
        try (var reader = Files.newBufferedReader(path)) {  // 使用 UTF-8 读取
            properties.load(reader);  // 加载属性
        }
        return properties;  // 返回加载的属性
    }

    // 私有构造函数，防止实例化
    private PropertiesUtils() {
    }
}
