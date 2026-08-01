import React from 'react';
import { cn } from '@/lib/utils';

type Shape = 'square' | 'diamond' | 'circle';

interface DecorativeShapeProps {
  className?: string;
  shape?: Shape;
  /** 起始旋转角度（square/circle 生效；diamond 忽略，因其自身已为菱形） */
  startRotation?: number;
  slow?: boolean;
  /** 边框宽度（px），默认 4。square/circle 映射到 Tailwind border 类，diamond 用 SVG stroke-width */
  borderWidth?: 2 | 4 | 8;
}

const BORDER_CLASS: Record<NonNullable<DecorativeShapeProps['borderWidth']>, string> = {
  2: 'border-2',
  4: 'border-4',
  8: 'border-8',
};

const DecorativeShape: React.FC<DecorativeShapeProps> = ({
  className = '',
  shape = 'square',
  startRotation = 0,
  slow = false,
  borderWidth = 4,
}) => {
  const animationClass = slow ? 'animate-float-rotate-slow' : 'animate-float-rotate';

  // diamond 用 SVG 实现真正的菱形描边，避免旋转方块导致边框粗细不均
  if (shape === 'diamond') {
    return (
      <div
        className={cn('pointer-events-none', animationClass, className)}
        style={{ '--start-rotation': `${startRotation}deg` } as React.CSSProperties}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          <polygon
            points="50,2 98,50 50,98 2,50"
            className="fill-current"
            strokeWidth={borderWidth}
            stroke="currentColor"
            strokeLinejoin="miter"
          />
        </svg>
      </div>
    );
  }

  // circle 用 border-radius 实现
  if (shape === 'circle') {
    return (
      <div
        className={cn(
          'pointer-events-none rounded-full',
          BORDER_CLASS[borderWidth],
          animationClass,
          className,
        )}
        style={{ '--start-rotation': `${startRotation}deg` } as React.CSSProperties}
        aria-hidden="true"
      />
    );
  }

  // square 默认
  return (
    <div
      className={cn(
        'pointer-events-none',
        BORDER_CLASS[borderWidth],
        animationClass,
        className,
      )}
      style={{ '--start-rotation': `${startRotation}deg` } as React.CSSProperties}
      aria-hidden="true"
    />
  );
};

export default DecorativeShape;
