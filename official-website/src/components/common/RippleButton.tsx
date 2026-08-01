import React, { useRef } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRipple } from '@/hooks/useRipple';

interface RippleButtonProps extends ButtonProps {
  children: React.ReactNode;
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
  const createRipple = useRipple(buttonRef, rippleColor);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(e);
    onClick?.(e);
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
