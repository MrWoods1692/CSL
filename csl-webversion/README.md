# CSL Web Runner - 我的世界网页版运行器

基于 **Rust + WebAssembly + WebGL2** 构建的 Minecraft 兼容网页版运行器，使用 **Next.js** 作为前端框架，**纯静态**部署，无需任何后端服务器。

## 核心特性

- 🎮 **多版本支持** — 支持 Minecraft 1.21.4 / 1.20.4 / 1.19.4 / 1.18.2 / 1.17.1 / 1.16.5 / 1.12.2 / 1.8.9
- 🌐 **多人服务器** — 支持连接原版 Minecraft 服务器（通过 WebSocket 代理）
- 🏠 **单人世界** — 程序化地形生成，无限世界
- 🧩 **模组系统** — 内置模组 API，支持加载 WASM 模组
- 🔌 **每个版本独立 WASM** — 各版本编译为独立 WASM 模块，按需加载
- 🎨 **WebGL2 渲染** — 高效的体素渲染引擎，支持纹理图集、光照、雾效
- 📦 **纯静态部署** — 无需后端服务器，部署到任意静态托管

## 技术架构

```
┌─────────────────────────────────────────────┐
│              Next.js 前端                     │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │ Launcher │ │  Game    │ │ Mod Manager │  │
│  │ 启动器    │ │  游戏    │ │  模组管理   │  │
│  └──────────┘ └──────────┘ └─────────────┘  │
├─────────────────────────────────────────────┤
│           WASM 模块 (每个版本独立)            │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │ MC 1.21.4│ │ MC 1.20.4│ │ MC 1.19.4  │  │
│  │  WASM    │ │  WASM    │ │  WASM      │  │
│  └──────────┘ └──────────┘ └─────────────┘  │
├─────────────────────────────────────────────┤
│           Rust WASM 核心引擎                  │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │ Protocol │ │ Renderer │ │  Mod API    │  │
│  │ 协议实现 │ │ WebGL2   │ │  模组接口   │  │
│  └──────────┘ └──────────┘ └─────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │  World   │ │  Entity  │ │   Input     │  │
│  │ 世界管理 │ │ 实体系统 │ │  输入管理   │  │
│  └──────────┘ └──────────┘ └─────────────┘  │
└─────────────────────────────────────────────┘
```

## 项目结构

```
csl-webversion/
├── wasm-core/              # Rust WASM 核心库
│   ├── Cargo.toml
│   └── src/
│       ├── lib.rs          # 游戏引擎入口
│       ├── protocol.rs     # Minecraft 协议实现
│       ├── renderer.rs     # WebGL2 渲染引擎
│       ├── world.rs        # 世界/区块管理
│       ├── entity.rs       # 实体系统 (玩家/生物)
│       ├── mod_api.rs      # 模组 API
│       ├── input.rs        # 输入管理
│       └── utils.rs        # 工具函数
├── wasm-versions/          # 各版本 WASM 模块
│   ├── mc1_21_4/          # Minecraft 1.21.4
│   ├── mc1_20_4/          # Minecraft 1.20.4
│   └── mc1_19_4/          # Minecraft 1.19.4
├── mods/                   # 内置模组
│   ├── minimap/           # 小地图
│   ├── jeito/             # 物品查看器
│   └── optifine/          # 性能优化
├── csl-web-runner/         # Next.js 前端
│   ├── src/
│   │   ├── app/           # Next.js App Router
│   │   └── components/
│   │       ├── Launcher/  # 启动器界面
│   │       ├── Game/      # 游戏界面 + HUD
│   │       └── Mods/      # 模组管理界面
│   └── public/wasm/       # WASM 输出目录
└── build.sh                # 一键构建脚本
```

## 快速开始

### 前置要求

- **Rust** (https://rustup.rs/)
- **wasm-pack** (`cargo install wasm-pack`)
- **wasm-bindgen-cli** (`cargo install wasm-bindgen-cli`)
- **Node.js** 18+ (https://nodejs.org/)

### 一键构建

```bash
cd csl-webversion
./build.sh
```

### 手动构建

```bash
# 1. 构建各版本 WASM
cd wasm-versions/mc1_21_4
wasm-pack build --release --target web --out-dir ../../csl-web-runner/public/wasm/mc1_21_4

cd ../mc1_20_4
wasm-pack build --release --target web --out-dir ../../csl-web-runner/public/wasm/mc1_20_4

cd ../mc1_19_4
wasm-pack build --release --target web --out-dir ../../csl-web-runner/public/wasm/mc1_19_4

# 2. 构建前端
cd ../../csl-web-runner
npm install
npm run build

# 3. 静态文件在 out/ 目录
```

### 本地预览

```bash
cd csl-web-runner
npx serve out
# 访问 http://localhost:3000
```

## 支持的 Minecraft 版本

| 版本 | 协议号 | 状态 | 说明 |
|------|--------|------|------|
| 1.21.4 | 769 | ✅ WASM 模块 | 最新版本 |
| 1.20.4 | 765 | ✅ WASM 模块 | 樱花树林 |
| 1.19.4 | 762 | ✅ WASM 模块 | 深暗之域 |
| 1.18.2 | 758 | 🔄 计划中 | 洞穴山崖 |
| 1.17.1 | 756 | 🔄 计划中 | 洞穴更新 |
| 1.16.5 | 754 | 🔄 计划中 | 下界更新 |
| 1.12.2 | 340 | 🔄 计划中 | 经典模组 |
| 1.8.9  | 47  | 🔄 计划中 | 经典PvP |

## 模组系统

### 内置模组

- **CSL 小地图** — 显示附近地形的小地图覆盖层
- **CSL 物品查看器** — 查看所有物品和合成配方
- **CSL 性能优化** — 性能优化和图形设置

### 模组 API

模组通过实现 Rust trait 来扩展游戏功能：

```rust
pub trait Mod: Send + Sync {
    fn info(&self) -> &ModInfo;
    fn on_load(&mut self) {}
    fn on_tick(&mut self, world: &mut World, player: &mut Player) {}
    fn on_render_post(&mut self, renderer: &mut Renderer) {}
    fn on_key(&mut self, key: &str, pressed: bool) -> bool { false }
}
```

## 部署

`out/` 目录是纯静态文件，可部署到任何静态托管服务：

- **GitHub Pages**: 推送 `out/` 到 `gh-pages` 分支
- **Vercel**: 直接导入项目
- **Netlify**: 拖拽 `out/` 文件夹
- **Cloudflare Pages**: 设置输出目录为 `out`
- **任意静态服务器**: Nginx, Apache, etc.

## 操作说明

| 按键 | 功能 |
|------|------|
| W/A/S/D | 移动 |
| 鼠标 | 视角 |
| 空格 | 跳跃 |
| Shift | 潜行 |
| Ctrl | 冲刺 |
| ESC | 退出指针锁定 |
| E | 打开物品栏 (计划中) |

## 技术栈

| 层级 | 技术 |
|------|------|
| 核心引擎 | Rust → WASM |
| 渲染 | WebGL2 (GLSL ES 3.0) |
| 协议 | Minecraft Java Edition Protocol |
| 前端 | Next.js 14 + React 18 + TypeScript |
| 部署 | 纯静态导出 (`output: 'export'`) |

## 路线图

- [x] 多版本 WASM 架构
- [x] WebGL2 渲染引擎
- [x] 程序化地形生成
- [x] 模组 API 系统
- [x] 启动器 UI
- [ ] 完整协议实现 (登录、区块、实体)
- [ ] 音效系统
- [ ] 物品栏系统
- [ ] 合成系统
- [ ] 多人游戏完善
- [ ] 更多 Minecraft 版本
- [ ] 模组市场
