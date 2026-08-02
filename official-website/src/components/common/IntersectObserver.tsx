/**
 * 交叉观察器重启组件
 * 
 * 在路由切换时：
 * 1. 滚动到页面顶部
 * 2. 重启 tailwindcss-intersect 观察器，确保新页面的滚动动画正常触发
 * 
 * 这是一个无 UI 的组件（返回 null），仅通过副作用工作。
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Observer } from 'tailwindcss-intersect';

const IntersectObserver = () => {
  const location = useLocation();

  useEffect(() => {
    // 路由切换时滚动到顶部
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    // 路由变化时需要重启观察器以捕获新页面的元素
    // 使用小延迟确保 DOM 已更新
    const timer = setTimeout(() => {
        Observer.restart();
    }, 100);

    return () => clearTimeout(timer);
  }, [location]);

  return null;
};

export default IntersectObserver;
