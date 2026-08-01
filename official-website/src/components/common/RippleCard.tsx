import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { useRipple } from '@/hooks/useRipple';

interface RippleCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
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
    createRipple(e);
    onClick?.();
  };

  const classNameStr = cn(
    'sticker-card sticker-card-hover sticker-card-interactive',
    tilt && 'sticker-card-tilt',
    className,
  );

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

  return (
    <div ref={ref} className={classNameStr} onClick={handleClick}>
      {children}
    </div>
  );
};

export default RippleCard;
