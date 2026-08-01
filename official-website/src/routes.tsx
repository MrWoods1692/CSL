import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import DownloadPage from './pages/DownloadPage';
import InstallPage from './pages/InstallPage';
import GuidePage from './pages/GuidePage';
import DocsPage from './pages/DocsPage';
import CommunityPage from './pages/CommunityPage';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  /** Accessible without login. Routes without this flag require authentication. Has no effect when RouteGuard is not in use. */
  public?: boolean;
}

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
];
