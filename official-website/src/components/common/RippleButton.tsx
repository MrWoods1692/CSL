import React, { useRef } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = `ripple ripple-${rippleColor}`;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);

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
