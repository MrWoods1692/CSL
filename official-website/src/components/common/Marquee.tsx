/**
 * 跑马灯组件
 * 
 * 水平无限滚动的文字/内容条。
 * 通过复制 children 实现无缝循环效果。
 * 支持自定义速度、暂停悬停。
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  /** 滚动速度（秒），数值越小越快 */
  speed?: number;
  /** 鼠标悬停时是否暂停 */
  pauseOnHover?: boolean;
}

const Marquee: React.FC<MarqueeProps> = ({
  children,
  className = '',
  speed = 24,
  pauseOnHover = true,
}) => {
  return (
    <div
      className={cn(
        'overflow-hidden whitespace-nowrap border-y-2 border-foreground bg-secondary py-3',
        className,
      )}
    >
      <div
        className={cn('inline-flex', pauseOnHover && 'marquee-track')}
        style={{
          animation: `marquee ${speed}s linear infinite`,
          width: 'max-content',
        }}
      >
        {/* 渲染两次 children 实现无缝循环 */}
        {children}
        {children}
      </div>
    </div>
  );
};

export default Marquee;
