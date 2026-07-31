# 贡献指南

<!-- #BEGIN LANGUAGE_SWITCHER -->
[English](Contributing.md) | **中文** (**简体**, [繁體](Contributing_zh_Hant.md))
<!-- #END LANGUAGE_SWITCHER -->

## 构建 CSL

### 环境需求

构建 CSL 启动器需要安装 JDK 17 (或更高版本)。你可以从此处下载它: [Download Liberica JDK](https://bell-sw.com/pages/downloads/#jdk-25-lts)。

在安装 JDK 后，请确保 `JAVA_HOME` 环境变量指向符合需求的 JDK 目录。
你可以这样查看 `JAVA_HOME` 指向的 JDK 版本:

<details>
<summary>Windows</summary>

PowerShell:
```
PS > & "$env:JAVA_HOME/bin/java.exe" -version
openjdk version "25" 2025-09-16 LTS
OpenJDK Runtime Environment (build 25+37-LTS)
OpenJDK 64-Bit Server VM (build 25+37-LTS, mixed mode, sharing)
```

</details>

<details>
<summary>Linux/FreeBSD</summary>

```
> $JAVA_HOME/bin/java -version
openjdk version "25" 2025-09-16 LTS
OpenJDK Runtime Environment (build 25+37-LTS)
OpenJDK 64-Bit Server VM (build 25+37-LTS, mixed mode, sharing)
```

</details>

<details>
<summary>macOS</summary>

```
> /usr/libexec/java_home --exec java -version
openjdk version "25" 2025-09-16 LTS
OpenJDK Runtime Environment (build 25+37-LTS)
OpenJDK 64-Bit Server VM (build 25+37-LTS, mixed mode, sharing)
```

</details>

### 获取 CSL 源码

- 通过 [Git](https://git-scm.com/downloads) 可以获取最新源码:
  ```shell
  git clone https://github.com/MrWoods1692/CSL.git
  cd CSL
  ```
- 从 [GitHub Release 页面](https://github.com/MrWoods1692/CSL/releases)可以手动下载特定版本的源码。

### 构建 CSL

想要构建 CSL，请切换到 CSL 项目的根目录下，并执行以下命令:

```shell
./gradlew clean makeExecutables
```

构建出的 CSL 程序文件位于根目录下的 `CSL/build/libs` 子目录中。

## 调试选项

> [!WARNING]
> 本文介绍的是 CSL 的内部功能，我们不保证这些功能的稳定性，并且随时可能修改或删除这些功能。
>
> 使用这些功能时请务必小心，错误地使用这些功能可能会导致 CSL 行为异常甚至崩溃。

CSL 提供了一系列调试选项，用于控制启动器的行为。

这些选项可以通过环境变量或 JVM 参数指定。如果两者同时存在，那么 JVM 参数会覆盖环境变量的设置。

| 环境变量                        | JVM 参数                                       | 功能                             | 默认值                                                                                                         | 额外说明         |
|-----------------------------|----------------------------------------------|--------------------------------|-------------------------------------------------------------------------------------------------------------|--------------|
| `CSL_JAVA_HOME`            |                                              | 指定用于启动 CSL 的 Java             |                                                                                                             | 仅对 exe/sh 生效 |
| `CSL_JAVA_OPTS`            |                                              | 指定启动 CSL 时的默认 JVM 参数          |                                                                                                             | 仅对 exe/sh 生效 |
| `CSL_FORCE_GPU`            |                                              | 指定是否强制使用 GPU 加速渲染              | `false`                                                                                                     |
| `CSL_ANIMATION_FRAME_RATE` |                                              | 指定 CSL 的动画帧率                  | `60`                                                                                                        |              |
| `CSL_LANGUAGE`             |                                              | 指定 CSL 的默认语言                  | 使用系统默认语言                                                                                                    |
| `CSL_UI_SCALE`             |                                              | 指定 CSL 的 UI 缩放比例                 | 遵循系统当前的缩放比例                                                                                       | 支持倍数 (1.5)、百分比 (150%) 或 DPI (144dpi) |
|                             | `-Dcsl.dir=<path>`                          | 指定 CSL 的当前数据文件夹               | `./.csl`                                                                                                   |              |
|                             | `-Dcsl.home=<path>`                         | 指定 CSL 的用户数据文件夹               | Windows: `%APPDATA%\.csl`<br>Linux/BSD: `$XDG_DATA_HOME/csl`<br>macOS: `~Library/Application Support/csl` |              |
|                             | `-Dcsl.self_integrity_check.disable=true`   | 检查更新时不检查本体完整性                  |                                                                                                             |              |
|                             | `-Dcsl.bmclapi.override=<url>`              | 指定 BMCLAPI 的 API Root          | `https://bmclapi2.bangbang93.com`                                                                           |              |
|                             | `-Dcsl.discoapi.override=<url>`             | 指定 foojay Disco API 的 API Root | `https://api.foojay.io/disco/v3.0`                                                                          |
| `CSL_FONT`                 | `-Dcsl.font.override=<font family>`         | 指定 CSL 默认字体                   | 使用系统默认字体                                                                                                    |              |
|                             | `-Dcsl.update_source.override=<url>`        | 指定 CSL 更新源                    | `https://csl.huangyuhui.net/api/update_link`                                                               |              |
|                             | `-Dcsl.authlibinjector.location=<path>`     | 指定 authlib-injector JAR 文件的位置  | 使用 CSL 内嵌的 authlib-injector                                                                                |              |
|                             | `-Dcsl.openjfx.repo=<maven repository url>` | 添加用于下载 OpenJFX 的自定义 Maven 仓库   |                                                                                                             |              |
|                             | `-Dcsl.native.encoding=<encoding>`          | 指定原生编码                         | 使用系统的本机编码                                                                                                   |              |
|                             | `-Dcsl.microsoft.auth.id=<App ID>`          | 指定 Microsoft OAuth App ID      | 使用 CSL 内置的 Microsoft OAuth App ID                                                                          |              |
|                             | `-Dcsl.curseforge.apikey=<Api Key>`         | 指定 CurseForge API 密钥           | 使用 CSL 内置的 CurseForge API 密钥                                                                               |              |
|                             | `-Dcsl.native.backend=<auto/jna/none>`      | 指定CSL使用的本机后端                  | `auto`                                                                                                      |
|                             | `-Dcsl.hardware.fastfetch=<true/false>`     | 指定是否使用 fastfetch 检测硬件信息        | `true`                                                                                                      |

