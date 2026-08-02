/**
 * Vite 构建配置文件
 * 
 * Vite 是下一代前端构建工具，具有以下特点：
 * - 开发时使用原生 ES Module 实现极速热更新（HMR）
 * - 生产构建使用 Rollup 进行打包优化
 * - 内置 TypeScript、JSX、CSS 等支持
 * 
 * 本配置为 CSL 启动器官网项目定制，包含：
 * 1. React 插件 - 支持 JSX 转换和 Fast Refresh
 * 2. SVGR 插件 - 将 SVG 文件导入为 React 组件
 * 3. 路径别名 - @ 映射到 src 目录
 * 4. 依赖预构建优化
 */

// 从 vite 导入 defineConfig 工具函数，提供类型提示
import { defineConfig } from "vite";
// Vite 官方 React 插件，支持 JSX 转换和热更新
import react from "@vitejs/plugin-react";
// SVGR 插件，将 SVG 文件转换为 React 组件
import svgr from "vite-plugin-svgr";
// Node.js 路径处理模块
import path from "path";

// 导出 Vite 配置（使用 defineConfig 获得 IDE 智能提示）
export default defineConfig({
  // 插件配置
  plugins: [
    // React 插件：自动处理 JSX 转换，支持 Fast Refresh（热更新时保留组件状态）
    react(),
    // SVGR 插件配置
    svgr({
      svgrOptions: {
        // 将 SVG 视为图标（移除默认尺寸，方便通过 CSS 控制大小）
        icon: true,
        // 使用命名导出方式
        exportType: "named",
        // 导出的组件名称为 ReactComponent
        namedExport: "ReactComponent",
      },
    }),
  ],
  // 模块解析配置
  resolve: {
    alias: {
      // 路径别名：@ 指向 src 目录，方便导入时使用 @/components/xxx 代替 ../../components/xxx
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // 构建配置
  build: {
    // 输出目录
    outDir: "dist",
    // 不生成 sourcemap 文件（减小构建体积）
    sourcemap: false,
  },
  // 依赖预构建优化
  optimizeDeps: {
    // 显式声明需要预构建的依赖，避免冷启动时重复编译
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
  },
});
