/**
 * 交错动画容器组件
 * 
 * 为子元素提供依次出现的交错入场动画。
 * 
 * StaggerContainer：容器，控制子元素的动画节奏
 * - stagger：子元素之间的延迟间隔（秒）
 * - delay：整体延迟（秒）
 * - once：是否只触发一次
 * - amount：触发动画的可见比例
 * 
 * StaggerItem：子元素，支持 5 种入场方向
 * - up：从下方 32px 淡入
 * - down：从上方 32px 淡入
 * - left：从右侧 32px 淡入
 * - right：从左侧 32px 淡入
 * - scale：从 0.92 缩放淡入
 * 
 * 尊重"减少动画"偏好（跳过 stagger 延迟）。
 */

import React from 'react';
import { motion, type Variants } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  /** 子元素之间的间隔（秒） */
  stagger?: number;
  /** 整体延迟（秒） */
  delay?: number;
  /** 是否只触发一次 */
  once?: boolean;
  /** 触发动画的可见比例 */
  amount?: number;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className,
  stagger = 0.1,
  delay = 0,
  once = true,
  amount = 0.2,
}) => {
  const reduced = useReducedMotion();

  // 容器变体：控制子元素的动画节奏
  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduced ? 0 : stagger,  // 减少动画模式下无间隔
        delayChildren: reduced ? 0 : delay,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={container}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  /** 入场方向 */
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
}

// 各方向的动画变体
const itemVariants: Record<string, Variants> = {
  up: {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  },
  down: {
    hidden: { opacity: 0, y: -32 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  },
  left: {
    hidden: { opacity: 0, x: 32 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  },
  right: {
    hidden: { opacity: 0, x: -32 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  },
};

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  className,
  direction = 'up',
}) => {
  return (
    <motion.div
      variants={itemVariants[direction]}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};

export default StaggerContainer;
