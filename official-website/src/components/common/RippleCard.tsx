import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

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

  const handleClick = (e: React.MouseEvent) => {
    const card = ref.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.backgroundColor = 'hsl(var(--foreground) / 0.12)';

    card.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);

    onClick?.();
  };

  const commonProps = {
    ref: ref as React.RefObject<HTMLDivElement>,
    className: cn(
      'sticker-card sticker-card-hover sticker-card-interactive',
      tilt && 'sticker-card-tilt',
      className,
    ),
    onClick: handleClick,
  };

  if (as === 'a') {
    return (
      <a
        ref={commonProps.ref as unknown as React.RefObject<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel}
        className={commonProps.className}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  if (as === 'button') {
    return (
      <button
        ref={commonProps.ref as unknown as React.RefObject<HTMLButtonElement>}
        className={commonProps.className}
        onClick={handleClick}
      >
        {children}
      </button>
    );
  }

  return (
    <div
      ref={commonProps.ref}
      className={commonProps.className}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};

export default RippleCard;
