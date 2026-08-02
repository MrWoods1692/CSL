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

import java.util.Objects;

/// @author Glavo
/// 提供 GitHub Actions CI 环境相关的工具方法
/// @author Glavo
public final class GitHubActionUtils {
    // 官方组织的 GitHub 名称
    private static final String OFFICIAL_ORGANIZATION = "MrWoods1692";

    // 判断当前是否在官方仓库的 GitHub Actions 中运行
    // 检查 GITHUB_REPOSITORY_OWNER 环境变量是否匹配官方组织名
    // 且 GITHUB_BASE_REF 为空（非 PR 触发）
    public static final boolean IS_ON_OFFICIAL_REPO =
            OFFICIAL_ORGANIZATION.equalsIgnoreCase(System.getenv("GITHUB_REPOSITORY_OWNER"))
                    && Objects.requireNonNullElse(System.getenv("GITHUB_BASE_REF"), "").isBlank();

    // 私有构造函数，防止实例化工具类
    private GitHubActionUtils() {
    }
}
