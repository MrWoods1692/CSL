import React from 'react';

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
      className={`overflow-hidden whitespace-nowrap border-y-2 border-foreground bg-secondary py-3 ${className}`}
    >
      <div
        className={`inline-flex ${pauseOnHover ? 'marquee-track' : ''}`}
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
