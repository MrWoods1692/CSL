/**
 * 滚动触发动画组件
 * 
 * 当元素进入视口时触发入场动画。基于 motion/react（Framer Motion 继任者）。
 * 支持多种动画方向（上/下/左/右/无）和自定义参数。
 * 尊重用户的"减少动画"偏好设置。
 */

import React from 'react';
import { motion, type Variants } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  /** 动画延迟（秒） */
  delay?: number;
  /** 动画方向 */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  /** 动画持续时间（秒） */
  duration?: number;
  /** 是否只触发一次（false 则每次进入视口都触发） */
  once?: boolean;
  /** 触发动画的可见比例（0-1），默认 0.2 表示元素 20% 可见时触发 */
  amount?: number;
  /** 渲染的 HTML 元素标签 */
  as?: keyof React.JSX.IntrinsicElements;
}

/** 各方向的初始偏移量 */
const directionOffset = {
  up: { y: 40 },
  down: { y: -40 },
  left: { x: 40 },
  right: { x: -40 },
  none: {},
};

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className,
  delay = 0,
  direction = 'up',
  duration = 0.5,
  once = true,
  amount = 0.2,
  as = 'div',
}) => {
  const reduced = useReducedMotion();

  // 动画变体定义
  const variants: Variants = {
    hidden: {
      opacity: 0,
      ...directionOffset[direction],  // 初始位置偏移
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: reduced ? 0 : duration,  // 减少动画模式下跳过动画
        delay: reduced ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],  // 自定义缓动曲线（弹性效果）
      },
    },
  };

  // 动态创建 motion 组件（支持 div/span/section 等）
  const MotionComponent = motion[as as 'div'];

  return (
    <MotionComponent
      initial="hidden"
      whileInView="visible"  // 进入视口时触发
      viewport={{ once, amount }}
      variants={variants}
      className={cn(className)}
    >
      {children}
    </MotionComponent>
  );
};

export default AnimatedSection;
