/**
 * CSL 启动器官方网站 - 根组件
 * 
 * 本组件是 React 应用的根节点，负责：
 * 1. 主题管理（ThemeProvider - 亮色/暗色模式切换）
 * 2. 路由管理（HashRouter - 使用 URL hash 的 SPA 路由）
 * 3. 全局组件挂载（IntersectObserver、Toaster、CookieConsent）
 * 4. 路由配置（从 routes.tsx 动态生成 Route）
 * 
 * 使用 HashRouter 而非 BrowserRouter 的原因：
 * - 静态托管友好（不需要服务端配置 fallback）
 * - GitHub Pages 等静态托管平台兼容性更好
 */

import React from 'react';
// HashRouter：使用 URL hash（#）部分进行路由，适合静态托管
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// IntersectObserver：路由切换时重启 tailwindcss-intersect 观察器
import IntersectObserver from '@/components/common/IntersectObserver';
// Cookie 同意横幅
import CookieConsent from '@/components/common/CookieConsent';
// Toast 通知组件（sonner）
import { Toaster } from '@/components/ui/sonner';
// 主题上下文（亮色/暗色模式）
import { ThemeProvider } from '@/contexts/ThemeContext';

// 路由配置
import { routes } from './routes';

const App: React.FC = () => {
  return (
    // 主题提供者：管理亮色/暗色模式，持久化到 localStorage
    <ThemeProvider>
      {/* HashRouter：基于 URL hash 的 SPA 路由 */}
      <Router>
        {/* IntersectObserver：路由变化时重启交叉观察器，确保滚动动画正常触发 */}
        <IntersectObserver />
        {/* 主布局容器：flex 列布局，最小高度撑满视口 */}
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">
            <Routes>
              {/* 动态生成路由：从 routes 配置数组映射 */}
              {routes.map((route, index) => (
                <Route
                  key={index}
                  path={route.path}
                  element={route.element}
                />
              ))}
              {/* 通配符路由：未匹配的路径重定向到首页 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
        {/* Toast 通知容器：全局通知（如操作成功/失败提示） */}
        <Toaster />
        {/* Cookie 同意横幅：首次访问时显示 */}
        <CookieConsent />
      </Router>
    </ThemeProvider>
  );
};

export default App;
