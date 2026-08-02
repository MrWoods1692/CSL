/**
 * CSL 官方网站 - 路由配置
 * 
 * 定义所有页面的路由映射，包括：
 * - 路由路径（path）
 * - 页面组件（element）
 * - 可见性（visible）- 控制是否在导航栏显示
 * - 公开性（public）- 控制是否需要登录认证
 * 
 * 共 8 个路由：首页、产品介绍、软件下载、安装教程、使用指南、开发文档、交流社区、用户协议
 */

// 页面组件导入
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import DownloadPage from './pages/DownloadPage';
import InstallPage from './pages/InstallPage';
import GuidePage from './pages/GuidePage';
import DocsPage from './pages/DocsPage';
import CommunityPage from './pages/CommunityPage';
import PolicyPage from './pages/PolicyPage';
import type { ReactNode } from 'react';

/** 路由配置接口 */
export interface RouteConfig {
  /** 页面名称（用于导航栏显示） */
  name: string;
  /** 路由路径 */
  path: string;
  /** 页面组件 */
  element: ReactNode;
  /** 是否在导航栏中可见（默认 true） */
  visible?: boolean;
  /** 无需登录即可访问。没有此标记的路由需要认证。当不使用 RouteGuard 时此标记无效。 */
  public?: boolean;
}

/** 路由配置数组 */
export const routes: RouteConfig[] = [
  {
    name: '首页',
    path: '/',
    element: <HomePage />,
    public: true,
  },
  {
    name: '产品介绍',
    path: '/features',
    element: <FeaturesPage />,
    public: true,
  },
  {
    name: '软件下载',
    path: '/download',
    element: <DownloadPage />,
    public: true,
  },
  {
    name: '安装教程',
    path: '/install',
    element: <InstallPage />,
    public: true,
  },
  {
    name: '使用指南',
    path: '/guide',
    element: <GuidePage />,
    public: true,
  },
  {
    name: '开发文档',
    path: '/docs',
    element: <DocsPage />,
    public: true,
  },
  {
    name: '交流社区',
    path: '/community',
    element: <CommunityPage />,
    public: true,
  },
  {
    name: '用户协议与免责声明',
    path: '/policy',
    element: <PolicyPage />,
    // 不在导航栏中显示（通常通过页脚链接访问）
    visible: false,
    public: true,
  },
];
