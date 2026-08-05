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
package org.jackhuang.csl;

import org.jackhuang.csl.util.StringUtils;
import org.jackhuang.csl.util.io.JarUtils;
import org.jackhuang.csl.util.platform.Architecture;
import org.jackhuang.csl.util.platform.OperatingSystem;
import org.jetbrains.annotations.Nullable;

import java.nio.file.Path;
import java.util.EnumSet;

/**
 * Stores metadata about this application.
 */
public final class Metadata {
    private Metadata() {
    }

    public static final String NAME = "CSL";
    public static final String FULL_NAME = "Craft Something Launcher";
    public static final String VERSION = System.getProperty("csl.version.override", JarUtils.getAttribute("csl.version", "@develop@"));

    public static final String TITLE = NAME + " " + VERSION;
    public static final String FULL_TITLE = FULL_NAME + " v" + VERSION;

    public static final int MINIMUM_REQUIRED_JAVA_VERSION = 17;
    public static final int MINIMUM_SUPPORTED_JAVA_VERSION = 17;
    public static final int RECOMMENDED_JAVA_VERSION = 21;

    public static final String PUBLISH_URL = "https://csl.huangyuhui.net";
    public static final String DOWNLOAD_URL = PUBLISH_URL + "/download";
    public static final String CSL_UPDATE_URL = System.getProperty("csl.update_source.override", PUBLISH_URL + "/api/update_link");
    public static final String MANUAL_UPDATE_URL = "https://github.com/MrWoods1692/CSL/releases";

    public static final String DOCS_URL = "https://docs.csl.net";
    public static final String CONTACT_URL = DOCS_URL + "/help.html";
    public static final String CHANGELOG_URL = DOCS_URL + "/changelog/";
    public static final String EULA_URL = DOCS_URL + "/eula/csl.html";
    public static final String GROUPS_URL = "https://www.bilibili.com/opus/905435541874409529";

    public static final String BUILD_CHANNEL = JarUtils.getAttribute("csl.version.type", "nightly");
    public static final String GITHUB_SHA = JarUtils.getAttribute("csl.version.hash", null);

    public static final Path CURRENT_DIRECTORY = Path.of(System.getProperty("user.dir")).toAbsolutePath().normalize();
    public static final Path MINECRAFT_DIRECTORY = OperatingSystem.getWorkingDirectory("minecraft");
    public static final Path CSL_USER_HOME;
    public static final Path CSL_LOCAL_HOME;
    public static final Path DEPENDENCIES_DIRECTORY;

    static {
        String cslHome = System.getProperty("csl.home", System.getenv("CSL_USER_HOME"));
        if (StringUtils.isBlank(cslHome)) {
            if (OperatingSystem.CURRENT_OS.isLinuxOrBSD()) {
                String xdgData = System.getenv("XDG_DATA_HOME");
                if (StringUtils.isNotBlank(xdgData)) {
                    CSL_USER_HOME = Path.of(xdgData, "csl").toAbsolutePath().normalize();
                } else {
                    CSL_USER_HOME = Path.of(System.getProperty("user.home"), ".local", "share", "csl").toAbsolutePath().normalize();
                }
            } else {
                CSL_USER_HOME = OperatingSystem.getWorkingDirectory("csl");
            }
        } else {
            CSL_USER_HOME = Path.of(cslHome).toAbsolutePath().normalize();
        }

        String cslCurrentDir = System.getProperty("csl.dir", System.getenv("CSL_LOCAL_HOME"));
        CSL_LOCAL_HOME = StringUtils.isNotBlank(cslCurrentDir)
                ? Path.of(cslCurrentDir).toAbsolutePath().normalize()
                : CSL_USER_HOME;

        String cslDependencies = System.getProperty("csl.dependencies.dir", System.getenv("CSL_DEPENDENCIES_DIR"));
        DEPENDENCIES_DIRECTORY = StringUtils.isNotBlank(cslDependencies)
                ? Path.of(cslDependencies).toAbsolutePath().normalize()
                : CSL_LOCAL_HOME.resolve("dependencies");
    }

    public static boolean isStable() {
        return "stable".equals(BUILD_CHANNEL);
    }

    public static boolean isDev() {
        return "dev".equals(BUILD_CHANNEL);
    }

    public static boolean isNightly() {
        return !isStable() && !isDev();
    }

    public static @Nullable String getSuggestedJavaDownloadLink() {
        if (OperatingSystem.CURRENT_OS == OperatingSystem.LINUX && Architecture.SYSTEM_ARCH == Architecture.LOONGARCH64_OW)
            return "https://www.loongnix.cn/zh/api/java/downloads-jdk21/index.html";
        else {
            EnumSet<Architecture> supportedArchitectures;
            if (OperatingSystem.CURRENT_OS == OperatingSystem.WINDOWS)
                supportedArchitectures = EnumSet.of(Architecture.X86_64, Architecture.X86, Architecture.ARM64);
            else if (OperatingSystem.CURRENT_OS == OperatingSystem.LINUX)
                supportedArchitectures = EnumSet.of(
                        Architecture.X86_64, Architecture.X86,
                        Architecture.ARM64, Architecture.ARM32,
                        Architecture.RISCV64, Architecture.LOONGARCH64
                );
            else if (OperatingSystem.CURRENT_OS == OperatingSystem.MACOS)
                supportedArchitectures = EnumSet.of(Architecture.X86_64, Architecture.ARM64);
            else
                supportedArchitectures = EnumSet.noneOf(Architecture.class);
            if (supportedArchitectures.contains(Architecture.SYSTEM_ARCH))
                return String.format("https://docs.csl.net/downloads/%s/%s.html",
                        OperatingSystem.CURRENT_OS.getCheckedName(),
                        Architecture.SYSTEM_ARCH.getCheckedName()
                );
            else
                return null;
        }
    }
}
