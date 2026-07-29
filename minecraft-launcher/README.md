# Minecraft Launcher

基于 Rust + Tauri v2 构建的 Minecraft Java 版游戏启动器。

## 功能特性

- 🔑 **Microsoft 账号认证** — 设备码 OAuth 流程（Xbox Live → XSTS → Minecraft）
- 📦 **版本管理** — 获取 Mojang 官方版本清单，下载和管理 Minecraft 版本
- 🚀 **游戏启动** — 自动构建 JVM 参数，一键启动 Minecraft
- ⚙ **配置管理** — 内存分配、窗口大小、JVM 参数、Java 路径等可自定义

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Rust + Tauri v2 |
| 前端 | TypeScript + Vite + HTML/CSS |
| HTTP | reqwest |
| 序列化 | serde / serde_json |

## 项目结构

```
minecraft-launcher/
├── index.html              # 前端入口 HTML
├── package.json            # Node.js 依赖
├── src/
│   ├── main.ts             # 前端 TypeScript 逻辑
│   └── styles.css          # UI 样式（深色 Minecraft 风格主题）
├── src-tauri/
│   ├── Cargo.toml          # Rust 依赖
│   ├── tauri.conf.json     # Tauri 配置
│   ├── capabilities/       # 权限配置
│   └── src/
│       ├── lib.rs          # 主入口，注册 Tauri 命令
│       ├── config.rs       # 配置管理
│       ├── auth.rs         # Microsoft OAuth 认证
│       ├── version_manager.rs  # 版本下载管理
│       └── launcher.rs     # 启动逻辑
└── vite.config.ts
```

## 系统依赖（Linux）

需要安装以下系统库才能编译运行：

```bash
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libappindicator3-dev \
  librsvg2-dev \
  patchelf \
  libjavascriptcoregtk-4.1-dev \
  libsoup-3.0-dev
```

## 开发运行

```bash
# 安装前端依赖
npm install

# 启动开发服务器
npm run tauri dev

# 构建生产版本
npm run tauri build
```

## 使用说明

1. 启动应用后，点击右上角「🔑 登录」进行 Microsoft 账号认证
2. 在弹出的对话框中复制验证码，打开链接完成设备认证
3. 在左侧版本列表中选择并下载需要的 Minecraft 版本
4. 在右侧启动面板中选择版本，点击「▶ 启动 Minecraft」
5. 可在设置面板调整内存、窗口大小、JVM 参数等

