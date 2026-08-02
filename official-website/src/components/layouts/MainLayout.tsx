/**
 * 主布局组件
 *
 * 所有页面的外层包裹组件，提供统一的页面结构：
 * - ScrollProgress：顶部滚动进度条
 * - Header：全局页头导航
 * - PageTransition：页面过渡动画
 * - Footer：全局页脚
 * - BackToTop：回到顶部按钮
 */

import React from 'react';
import Header from './Header';
import Footer from './Footer';
import PageTransition from '@/components/common/PageTransition';
import ScrollProgress from '@/components/common/ScrollProgress';
import BackToTop from '@/components/common/BackToTop';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollProgress />
      <Header />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default MainLayout;
