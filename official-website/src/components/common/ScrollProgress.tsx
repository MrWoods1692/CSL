import React from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const ScrollProgress: React.FC = () => {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-[100] h-1.5 origin-left bg-accent"
      style={{ scaleX: reduced ? scrollYProgress : scaleX }}
      aria-hidden="true"
    />
  );
};

export default ScrollProgress;
