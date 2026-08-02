/**
 * 主题上下文
 * 
 * 管理网站的亮色/暗色模式切换，支持：
 * - 手动切换（toggleTheme）
 * - 持久化到 localStorage
 * - 跟随系统偏好（prefers-color-scheme）
 * 
 * 实现方式：在 <html> 元素上添加 'light' 或 'dark' 类名，
 * Tailwind CSS 的 darkMode: 'class' 策略会根据此类名切换样式。
 */

import React, { createContext, useCallback, useEffect, useState } from 'react';

/** 主题类型：亮色或暗色 */
type Theme = 'light' | 'dark';

/** 主题上下文的值类型 */
interface ThemeContextValue {
  /** 当前主题 */
  theme: Theme;
  /** 切换主题（light ↔ dark） */
  toggleTheme: () => void;
  /** 设置指定主题 */
  setTheme: (theme: Theme) => void;
}

// 创建主题上下文（提供默认值避免 undefined 检查）
export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

/** localStorage 存储键名 */
const STORAGE_KEY = 'csl-theme-preference';

/**
 * 主题提供者组件
 * 
 * 初始化时按以下优先级确定主题：
 * 1. localStorage 中保存的用户偏好
 * 2. 系统 prefers-color-scheme 媒体查询
 * 3. 默认 'light'
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 初始化主题状态
  const [theme, setThemeState] = useState<Theme>(() => {
    // SSR 兼容：服务端渲染时返回默认值
    if (typeof window === 'undefined') return 'light';
    // 读取 localStorage 中的用户偏好
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark') return stored;
    // 跟随系统偏好
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // 主题变化时：更新 <html> 类名 + 持久化到 localStorage
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // 设置指定主题（使用 useCallback 避免不必要的重渲染）
  const setTheme = useCallback((next: Theme) => setThemeState(next), []);

  // 切换主题
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
