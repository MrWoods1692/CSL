/**
 * 减少动画 Hook
 * 
 * 检测用户系统是否开启了"减少动画"偏好设置。
 * 当用户开启此设置时，应禁用或简化页面动画效果，
 * 以提升无障碍体验（减少前庭系统敏感用户的不适感）。
 * 
 * @returns 是否应减少动画（boolean）
 */

import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    // 检测系统偏好：prefers-reduced-motion: reduce
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(media.matches);

    // 监听偏好变化
    const handler = (event: MediaQueryListEvent) => {
      setReduced(event.matches);
    };

    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  return reduced;
}
