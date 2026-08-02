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
package org.jackhuang.csl.gradle.pack;

/// Debian packaging metadata for one CSL release type.
///
/// The package name, installed command, desktop file, and alternatives
/// priority are intentionally centralized here so `CreateDeb` can stay focused
/// on archive layout instead of duplicating channel-specific branching.
/// Debian 打包的发布类型元数据
///
/// 包名、安装命令、桌面文件和 alternatives 优先级集中在此定义
public enum ReleaseType {
    STABLE("stable", "csl", "CSL", 100),  // 稳定版
    DEVELOPMENT("beta", "csl-beta", "CSL (Beta)", 200),  // 开发版
    NIGHTLY("nightly", "csl-nightly", "CSL (Nightly)", 300);  // 每夜构建版

    private final String name;  // 发布类型名称
    private final String packageName;  // Debian 包名
    private final String displayName;  // 显示名称
    private final int alternativesPriority;  // alternatives 优先级

    ReleaseType(String name, String packageName, String displayName, int alternativesPriority) {
        this.name = name;
        this.packageName = packageName;
        this.displayName = displayName;
        this.alternativesPriority = alternativesPriority;
    }

    // 返回发布类型名称
    public String getName() {
        return name;
    }

    /// Debian 包名，写入 control 文件并用于输出文件名
    public String getPackageName() {
        return packageName;
    }

    // 返回显示名称
    public String getDisplayName() {
        return displayName;
    }

    /// 注册通用 csl 别名时使用的优先级
    public int getAlternativesPriority() {
        return alternativesPriority;
    }
}
