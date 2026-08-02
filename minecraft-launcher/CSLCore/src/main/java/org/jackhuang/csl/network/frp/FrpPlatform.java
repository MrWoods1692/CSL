/*
 * CSL - Craft Something Launcher
 * Copyright (C) 2026 CSL contributors
 */
package org.jackhuang.csl.network.frp;

import org.jackhuang.csl.util.platform.Platform;
import org.jetbrains.annotations.NotNullByDefault;
import org.jetbrains.annotations.Nullable;

/// Maps CSL runtime platforms to the FRP distribution names shipped with CSL.
@NotNullByDefault
public enum FrpPlatform {
    WINDOWS_X86_64(Platform.WINDOWS_X86_64, "frp_0.70.1_windows_amd64.zip", "frpc.exe"),
    LINUX_X86_64(Platform.LINUX_X86_64, "frp_0.70.1_linux_amd64.tar.gz", "frpc"),
    LINUX_ARM64(Platform.LINUX_ARM64, "frp_0.70.1_linux_arm64.tar.gz", "frpc"),
    LINUX_ARM32(Platform.LINUX_ARM32, "frp_0.70.1_linux_arm.tar.gz", "frpc"),
    LINUX_LOONGARCH64(Platform.LINUX_LOONGARCH64, "frp_0.70.1_linux_loong64.tar.gz", "frpc"),
    LINUX_MIPS64EL(Platform.LINUX_MIPS64EL, "frp_0.70.1_linux_mips.tar.gz", "frpc"),
    MACOS_X86_64(Platform.MACOS_X86_64, "frp_0.70.1_darwin_amd64.tar.gz", "frpc"),
    FREEBSD_X86_64(Platform.FREEBSD_X86_64, "frp_0.70.1_freebsd_amd64.tar.gz", "frpc");

    private final Platform platform;
    private final String archiveName;
    private final String executableName;

    FrpPlatform(Platform platform, String archiveName, String executableName) {
        this.platform = platform;
        this.archiveName = archiveName;
        this.executableName = executableName;
    }

    /// Returns the matching FRP package, or `null` when the platform is not shipped.
    public static @Nullable FrpPlatform forPlatform(Platform platform) {
        for (FrpPlatform value : values()) {
            if (value.platform.equals(platform)) return value;
        }
        return null;
    }

    public String archiveName() {
        return archiveName;
    }

    public String executableName() {
        return executableName;
    }
}
