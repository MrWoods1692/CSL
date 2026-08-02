/**
 * 回到顶部按钮
 * 
 * 固定在页面右下角的浮动按钮，滚动超过 400px 后显示。
 * 点击后平滑滚动到页面顶部。尊重"减少动画"偏好。
 */

import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      // 滚动超过 400px 时显示按钮
      setVisible(window.scrollY > 400);
    };
    // passive: true 提升滚动性能
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    // 减少动画模式下使用 instant 滚动
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    // AnimatePresence：在元素从 DOM 移除时播放退出动画
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{ duration: reduced ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 right-6 z-40"
        >
          <Button
            onClick={scrollToTop}
            size="icon"
            className="btn-sticker h-12 w-12 bg-accent text-accent-foreground"
            aria-label="回到顶部"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
