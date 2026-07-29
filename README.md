# CSL - Craft Something Launcher

基于 Rust + Tauri v2 构建的 Minecraft Java 版游戏启动器。

## 子项目

| 目录 | 说明 |
|------|------|
| [minecraft-launcher](./minecraft-launcher/) | Minecraft 启动器 — Rust 后端 + TypeScript 前端，支持 Microsoft 认证、版本管理、一键启动 |

## 技术栈

- **后端**: Rust + Tauri v2
- **前端**: TypeScript + Vite + HTML/CSS
- **认证**: Microsoft OAuth 2.0 设备码流程
- **版本源**: Mojang 官方 API
