/**
 * 水波纹效果 Hook
 * 
 * 在点击位置创建 Material Design 风格的水波纹动画。
 * 统一供 RippleCard / RippleButton 等组件复用。
 * 
 * 实现原理：
 * 1. 在点击位置创建一个 <span> 元素
 * 2. 使用 CSS 动画（ripple 关键帧）实现扩散效果
 * 3. 550ms 后自动移除元素
 * 
 * @param ref - 目标元素的 ref
 * @param color - 波纹颜色变体（light/dark/primary/accent/secondary/default）
 * @returns 点击事件处理函数
 */

import { useCallback, type RefObject } from 'react';

/** 水波纹颜色变体 */
type RippleColor = 'light' | 'dark' | 'primary' | 'accent' | 'secondary' | 'default';

/** 颜色变体到 CSS 类名的映射 */
const RIPPLE_COLOR_CLASS: Record<RippleColor, string> = {
  light: 'ripple-light',
  dark: 'ripple-dark',
  primary: 'ripple-primary',
  accent: 'ripple-accent',
  secondary: 'ripple-secondary',
  default: 'ripple',
};

/**
 * 在点击位置创建水波纹效果。
 * 统一供 RippleCard / RippleButton 等组件复用。
 */
export function useRipple<T extends HTMLElement>(
  ref: RefObject<T | null>,
  color: RippleColor = 'default',
) {
  return useCallback(
    (e: React.MouseEvent<Element>) => {
      const el = ref.current;
      if (!el) return;

      // 计算波纹大小（取元素宽高的最大值，确保覆盖整个元素）
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      // 计算波纹中心位置（相对于元素左上角）
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      // 创建波纹元素
      const ripple = document.createElement('span');
      ripple.className = RIPPLE_COLOR_CLASS[color];
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      // 添加到 DOM 并设置自动移除
      el.appendChild(ripple);
      setTimeout(() => ripple.remove(), 550);
    },
    [ref, color],
  );
}
