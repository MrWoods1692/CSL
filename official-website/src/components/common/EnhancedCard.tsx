/**
 * 增强卡片组件
 * 
 * 带悬停动效的卡片组件，支持三种悬停效果：
 * - lift：上浮 + 阴影增强
 * - tilt：轻微旋转 + 上浮
 * - rotate：旋转 + 缩放
 * 
 * 可渲染为 div 或 a 标签。
 */

import React from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface EnhancedCardProps {
  children: React.ReactNode;
  className?: string;
  /** 悬停效果类型 */
  hover?: 'lift' | 'tilt' | 'rotate';
  onClick?: () => void;
  /** 渲染为 div 或 a 标签 */
  as?: 'div' | 'a';
  href?: string;
}

const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  className = '',
  hover = 'lift',
  onClick,
  as = 'div',
  href,
}) => {
  const reduced = useReducedMotion();

  // 悬停状态变体
  const hoverVariants = {
    lift: { y: -4, x: -4, boxShadow: '8px 8px 0 0 hsl(var(--foreground))' },
    tilt: { rotate: -1.5, y: -4, x: -2, boxShadow: '8px 8px 0 0 hsl(var(--foreground))' },
    rotate: { rotate: -2, scale: 1.02, boxShadow: '8px 8px 0 0 hsl(var(--foreground))' },
  };

  // 点击状态变体
  const tapVariants = {
    lift: { y: 2, x: 2, boxShadow: '4px 4px 0 0 hsl(var(--foreground))' },
    tilt: { y: 2, x: 2, rotate: 0, boxShadow: '4px 4px 0 0 hsl(var(--foreground))' },
    rotate: { scale: 0.98, rotate: 0, boxShadow: '4px 4px 0 0 hsl(var(--foreground))' },
  };

  const Component = as === 'a' ? motion.a : motion.div;

  return (
    <Component
      href={as === 'a' ? href : undefined}
      onClick={onClick}
      className={cn('sticker-card', className)}
      initial={false}
      whileHover={reduced ? undefined : hoverVariants[hover]}
      whileTap={reduced ? undefined : tapVariants[hover]}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {children}
    </Component>
  );
};

export default EnhancedCard;
