/**
 * 波纹按钮组件
 * 
 * 在 shadcn/ui Button 基础上添加点击波纹效果。
 * 波纹颜色可配置：light / dark / primary / accent / secondary。
 * 使用 useRipple hook 实现波纹动画。
 */

import React, { useRef } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRipple } from '@/hooks/useRipple';

interface RippleButtonProps extends ButtonProps {
  children: React.ReactNode;
  /** 波纹颜色主题 */
  rippleColor?: 'light' | 'dark' | 'primary' | 'accent' | 'secondary';
}

const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  className = '',
  onClick,
  rippleColor = 'light',
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  // 创建波纹效果函数
  const createRipple = useRipple(buttonRef, rippleColor);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(e);  // 触发波纹动画
    onClick?.(e);     // 调用原始 onClick
  };

  return (
    <Button
      ref={buttonRef}
      className={cn('btn-ripple', className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
};

export default RippleButton;
