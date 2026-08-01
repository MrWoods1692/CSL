import { useCallback, type RefObject } from 'react';

type RippleColor = 'light' | 'dark' | 'primary' | 'accent' | 'secondary' | 'default';

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
    (e: React.MouseEvent<T>) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement('span');
      ripple.className = RIPPLE_COLOR_CLASS[color];
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      el.appendChild(ripple);
      setTimeout(() => ripple.remove(), 550);
    },
    [ref, color],
  );
}
