/**
 * 页面过渡动画组件
 * 
 * 路由切换时的页面级过渡动画：
 * - 入场：从下方 16px 淡入
 * - 出场：向上 16px 淡出
 * - 使用自定义缓动曲线 [0.22, 1, 0.36, 1]（弹性缓出）
 * - 尊重"减少动画"偏好（跳过位移，仅保留透明度变化）
 */

import React from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className }) => {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduced ? 0 : -16 }}
      transition={{ duration: reduced ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
