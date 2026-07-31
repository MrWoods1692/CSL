# 貢獻指南

<!-- #BEGIN LANGUAGE_SWITCHER -->
[English](Contributing.md) | **中文** ([简体](Contributing_zh.md), **繁體**)
<!-- #END LANGUAGE_SWITCHER -->

## 構建 CSL

### 環境需求

構建 CSL 啟動器需要安裝 JDK 17 (或更高版本)。你可以從此處下載它: [Download Liberica JDK](https://bell-sw.com/pages/downloads/#jdk-25-lts)。

在安裝 JDK 後，請確保 `JAVA_HOME` 環境變數指向符合需求的 JDK 目錄。
你可以這樣查看 `JAVA_HOME` 指向的 JDK 版本:

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

### 獲取 CSL 原始碼

- 透過 [Git](https://git-scm.com/downloads) 可以獲取最新原始碼:
  ```shell
  git clone https://github.com/MrWoods1692/CSL.git
  cd CSL
  ```
- 從 [GitHub Release 頁面](https://github.com/MrWoods1692/CSL/releases)可以手動下載特定版本的原始碼。

### 構建 CSL

想要構建 CSL，請切換到 CSL 專案的根目錄下，並執行以下指令:

```shell
./gradlew clean makeExecutables
```

構建出的 CSL 程式檔位於根目錄下的 `CSL/build/libs` 子目錄中。

## 除錯選項

> [!WARNING]
> 本文介紹的是 CSL 的內部功能，我們不保證這些功能的穩定性，並且隨時可能修改或刪除這些功能。
>
> 使用這些功能時請務必小心，錯誤地使用這些功能可能會導致 CSL 行為異常甚至崩潰。

CSL 提供了一系列除錯選項，用於控制啟動器的行為。

這些選項可以透過環境變數或 JVM 參數設定。如果兩者同時存在，那麼 JVM 參數會覆蓋環境變數的設定。

| 環境變數                        | JVM 參數                                       | 功能                             | 預設值                                                                                                         | 額外說明         |
|-----------------------------|----------------------------------------------|--------------------------------|-------------------------------------------------------------------------------------------------------------|--------------|
| `CSL_JAVA_HOME`            |                                              | 設定用於開啟 CSL 的 Java             |                                                                                                             | 僅對 exe/sh 生效 |
| `CSL_JAVA_OPTS`            |                                              | 設定開啟 CSL 時的預設 JVM 參數          |                                                                                                             | 僅對 exe/sh 生效 |
| `CSL_FORCE_GPU`            |                                              | 設定是否強制使用 GPU 加速繪製              | `false`                                                                                                     |
| `CSL_ANIMATION_FRAME_RATE` |                                              | 設定 CSL 的動畫幀率                  | `60`                                                                                                        |              |
| `CSL_LANGUAGE`             |                                              | 設定 CSL 的預設語言                  | 使用系統預設語言                                                                                                    |
| `CSL_UI_SCALE`             |                                              | 設定 CSL 的 UI 縮放比例               | 遵循系統目前的縮放比例                                                                                       | 支援倍數 (1.5)、百分比 (150%) 或 DPI (144dpi) |
|                             | `-Dcsl.dir=<path>`                          | 設定 CSL 的目前資料存放位置               | `./.csl`                                                                                                   |              |
|                             | `-Dcsl.home=<path>`                         | 設定 CSL 的使用者資料存放位置               | Windows: `%APPDATA%\.csl`<br>Linux/BSD: `$XDG_DATA_HOME/csl`<br>macOS: `~Library/Application Support/csl` |              |
|                             | `-Dcsl.self_integrity_check.disable=true`   | 檢查更新時不檢查程式完整性                  |                                                                                                             |              |
|                             | `-Dcsl.bmclapi.override=<url>`              | 設定 BMCLAPI 的 API Root          | `https://bmclapi2.bangbang93.com`                                                                           |              |
|                             | `-Dcsl.discoapi.override=<url>`             | 設定 foojay Disco API 的 API Root | `https://api.foojay.io/disco/v3.0`                                                                          |
| `CSL_FONT`                 | `-Dcsl.font.override=<font family>`         | 設定 CSL 預設字體                   | 使用系統預設字體                                                                                                    |              |
|                             | `-Dcsl.update_source.override=<url>`        | 設定 CSL 更新來源                    | `https://csl.huangyuhui.net/api/update_link`                                                               |              |
|                             | `-Dcsl.authlibinjector.location=<path>`     | 設定 authlib-injector JAR 檔的位置  | 使用 CSL 內置的 authlib-injector                                                                                |              |
|                             | `-Dcsl.openjfx.repo=<maven repository url>` | 添加用於下載 OpenJFX 的自訂 Maven 倉庫   |                                                                                                             |              |
|                             | `-Dcsl.native.encoding=<encoding>`          | 設定原生編碼                         | 使用系統的本機編碼                                                                                                   |              |
|                             | `-Dcsl.microsoft.auth.id=<App ID>`          | 設定 Microsoft OAuth App ID      | 使用 CSL 內建的 Microsoft OAuth App ID                                                                          |              |
|                             | `-Dcsl.curseforge.apikey=<Api Key>`         | 設定 CurseForge API 金鑰           | 使用 CSL 內建的 CurseForge API 金鑰                                                                               |              |
|                             | `-Dcsl.native.backend=<auto/jna/none>`      | 設定 CSL 使用的本機後端                  | `auto`                                                                                                      |
|                             | `-Dcsl.hardware.fastfetch=<true/false>`     | 設定是否使用 fastfetch 檢測硬體資訊        | `true`                                                                                                      |

