/**
 * 波纹卡片组件
 * 
 * 带点击波纹效果的卡片，可渲染为 div / a / button 三种元素。
 * 支持悬停倾斜效果（tilt），使用 CSS 变量 --tilt-x / --tilt-y 驱动 3D 旋转。
 * 使用 useRipple hook 实现波纹动画。
 */

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { useRipple } from '@/hooks/useRipple';

interface RippleCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  /** 渲染为哪种 HTML 元素 */
  as?: 'div' | 'a' | 'button';
  href?: string;
  target?: string;
  rel?: string;
  /** 是否在悬停时旋转卡片（默认 true） */
  tilt?: boolean;
}

const RippleCard: React.FC<RippleCardProps> = ({
  children,
  className = '',
  onClick,
  as = 'div',
  href,
  target,
  rel,
  tilt = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const createRipple = useRipple(ref, 'default');

  const handleClick = (e: React.MouseEvent) => {
    createRipple(e);  // 触发波纹效果
    onClick?.();
  };

  // 组合样式类：贴纸卡片 + 悬停效果 + 交互 + 可选倾斜
  const classNameStr = cn(
    'sticker-card sticker-card-hover sticker-card-interactive',
    tilt && 'sticker-card-tilt',
    className,
  );

  // 渲染为链接
  if (as === 'a') {
    return (
      <a
        ref={ref as unknown as React.RefObject<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel}
        className={classNameStr}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  // 渲染为按钮
  if (as === 'button') {
    return (
      <button
        ref={ref as unknown as React.RefObject<HTMLButtonElement>}
        className={classNameStr}
        onClick={handleClick}
      >
        {children}
      </button>
    );
  }

  // 默认渲染为 div
  return (
    <div ref={ref} className={classNameStr} onClick={handleClick}>
      {children}
    </div>
  );
};

export default RippleCard;
