import React from 'react';
import { cn } from '@/lib/utils';

interface IconBoxProps {
  /** lucide-react 图标组件 */
  icon: React.ElementType;
  /** 背景色 Tailwind 类，如 bg-primary / bg-accent / bg-secondary */
  color?: string;
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 图标颜色类，默认 text-foreground */
  iconClassName?: string;
  className?: string;
}

const SIZE_MAP = {
  sm: { box: 'h-10 w-10', icon: 'h-5 w-5' },
  md: { box: 'h-12 w-12', icon: 'h-6 w-6' },
  lg: { box: 'h-14 w-14', icon: 'h-7 w-7' },
} as const;

/**
 * 统一的图标容器：硬边框 + 实心阴影 + 悬停放大。
 * 用于卡片内的功能图标展示。
 */
const IconBox: React.FC<IconBoxProps> = ({
  icon: Icon,
  color = 'bg-primary',
  size = 'md',
  iconClassName = 'text-foreground',
  className,
}) => {
  const sz = SIZE_MAP[size];
  return (
    <div
      className={cn(
        'flex items-center justify-center border-2 border-foreground shadow-[var(--shadow-solid-sm)]',
        color,
        sz.box,
        className,
      )}
    >
      <Icon className={cn('sticker-card-icon', sz.icon, iconClassName)} />
    </div>
  );
};

export default IconBox;
