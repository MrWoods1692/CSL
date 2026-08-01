import React from 'react';
import { cn } from '@/lib/utils';

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
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
        {children}
        {children}
      </div>
    </div>
  );
};

export default Marquee;
