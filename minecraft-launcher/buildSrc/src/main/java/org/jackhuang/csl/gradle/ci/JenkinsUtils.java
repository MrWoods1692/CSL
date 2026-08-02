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
package org.jackhuang.csl.gradle.ci;

/// @author Glavo
/// 提供 Jenkins CI 环境相关的工具方法
/// @author Glavo
public final class JenkinsUtils {

    // 判断当前是否在 CI 环境中运行
    // 通过检查 CSL_CI 环境变量是否为 "1" 来判断
    public static final boolean IS_ON_CI = "1".equals(System.getenv("CSL_CI"));

    // 私有构造函数，防止实例化工具类
    private JenkinsUtils() {
    }
}
