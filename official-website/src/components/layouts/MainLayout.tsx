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
