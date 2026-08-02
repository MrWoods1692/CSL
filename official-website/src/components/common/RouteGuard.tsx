/**
 * 路由守卫组件
 * 
 * 保护需要登录的页面：
 * - 未登录用户访问非公开路由时，重定向到 /login
 * - 公开路由由 routes.tsx 中的 public: true 标记 + 系统级公开路由（/login, /403, /404）组成
 * - 支持通配符路径匹配（如 /docs/*）
 * - 加载中时显示旋转加载动画
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { routes } from '@/routes';

interface RouteGuardProps {
  children: React.ReactNode;
}

// 系统级公开路由（无需在 routes.tsx 中注册）
const SYSTEM_PUBLIC_ROUTES = ['/login', '/403', '/404'];

// 从 routes.tsx 派生：所有标记为 public: true 的路由
const routePublicPaths = routes.filter(r => r.public).map(r => r.path);

// 合并所有公开路由
const PUBLIC_ROUTES = [...SYSTEM_PUBLIC_ROUTES, ...routePublicPaths];

/**
 * 检查路径是否匹配公开路由模式
 * 支持通配符 *（如 /docs/* 匹配 /docs/install）
 */
function matchPublicRoute(path: string, patterns: string[]) {
  return patterns.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
      return regex.test(path);
    }
    return path === pattern;
  });
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;  // 等待认证状态加载

    const isPublic = matchPublicRoute(location.pathname, PUBLIC_ROUTES);

    // 未登录且非公开路由 → 重定向到登录页
    if (!user && !isPublic) {
      navigate('/login', { state: { from: location.pathname }, replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  // 加载中显示旋转动画
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}