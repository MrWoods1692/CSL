/**
 * CSL 启动器官方网站 - 应用入口文件
 * 
 * 本文件是 Vite 构建的入口点（在 index.html 中通过 <script type="module"> 引入）。
 * 负责：
 * 1. 初始化 Sentry 错误监控
 * 2. 渲染 React 应用到 #root 容器
 * 3. 包裹错误边界（ErrorBoundary）和全局 Provider
 */

// Sentry 错误监控 SDK（React 集成版）
import * as Sentry from "@sentry/react";
// React 18 的 createRoot API（替代 ReactDOM.render）
import { createRoot } from "react-dom/client";
// 根组件
import App from "./App.tsx";
// 全局包装器（提供 HelmetProvider + TooltipProvider）
import { AppWrapper } from "./components/common/PageMeta.tsx";
// 全局样式（Tailwind CSS + 自定义 CSS 变量）
import "./index.css";

// 初始化 Sentry 错误监控
Sentry.init({
  // DSN（Data Source Name）：Sentry 项目标识符，从环境变量读取
  dsn: import.meta.env['VITE_SENTRY_DSN'] as string | undefined,
  // 环境标识：development / production
  environment: import.meta.env.MODE,
});

// 创建 React 18 根节点并渲染应用
createRoot(document.getElementById("root")!).render(
  // Sentry 错误边界：捕获子组件中的未处理错误，显示友好提示
  <Sentry.ErrorBoundary fallback={<p>应用发生错误，请刷新页面重试</p>}>
    {/* AppWrapper：提供 HelmetProvider（SEO 头部管理）+ TooltipProvider（全局工具提示） */}
    <AppWrapper>
      <App />
    </AppWrapper>
  </Sentry.ErrorBoundary>
);
