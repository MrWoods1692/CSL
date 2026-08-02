/**
 * 滚动进度条组件
 * 
 * 固定在页面顶部的进度条，显示当前页面滚动百分比。
 * - 使用 motion/react 的 useScroll 获取滚动进度
 * - 使用 useSpring 实现平滑的弹簧动画过渡
 * - 渐变色彩条（primary → accent → secondary）+ 发光效果
 * - 尊重"减少动画"偏好（跳过 spring 动画）
 */

import React from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const ScrollProgress: React.FC = () => {
  const reduced = useReducedMotion();
  // 获取页面滚动进度（0-1）
  const { scrollYProgress } = useScroll();
  // 弹簧动画平滑过渡
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-0 z-[100] h-2 border-b border-foreground/20 bg-foreground/10"
      aria-hidden="true"
    >
      <motion.div
        className="relative h-full origin-left overflow-hidden bg-gradient-to-r from-primary via-accent to-secondary shadow-[0_0_12px_hsl(var(--accent)/0.7)]"
        style={{ scaleX: reduced ? scrollYProgress : scaleX }}
      >
        {/* 右侧高光扫过效果 */}
        <span className="absolute inset-y-0 right-0 w-20 bg-gradient-to-r from-transparent via-white/70 to-transparent blur-[2px]" />
      </motion.div>
    </div>
  );
};

export default ScrollProgress;
