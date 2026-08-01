import React from 'react';

type Shape = 'square' | 'diamond';

interface DecorativeShapeProps {
  className?: string;
  shape?: Shape;
  startRotation?: number;
  slow?: boolean;
}

const DecorativeShape: React.FC<DecorativeShapeProps> = ({
  className = '',
  shape = 'square',
  startRotation = 0,
  slow = false,
}) => {
  const rotation = shape === 'diamond' ? startRotation + 45 : startRotation;
  const animationClass = slow ? 'animate-float-rotate-slow' : 'animate-float-rotate';

  return (
    <div
      className={`pointer-events-none border-4 ${animationClass} ${className}`}
      style={{ '--start-rotation': `${rotation}deg` } as React.CSSProperties}
      aria-hidden="true"
    />
  );
};

export default DecorativeShape;
