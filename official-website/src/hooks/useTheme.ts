/**
 * 主题 Hook
 * 
 * 便捷获取当前主题状态和切换方法的 Hook。
 * 封装了 ThemeContext 的使用，提供类型安全的主题操作。
 * 
 * @throws 如果在 ThemeProvider 外部使用会抛出错误
 */

import { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';

export const useTheme = () => {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useTheme 必须在 ThemeProvider 内部使用');
  }
  return value;
};
