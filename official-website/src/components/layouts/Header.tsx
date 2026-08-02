/**
 * 全局页头组件
 *
 * 固定在页面顶部的导航栏，包含：
 * - Logo + 站点名称
 * - 桌面端导航链接（带下划线动画，使用 motion layoutId 实现平滑切换）
 * - 文档页特殊导航（返回官网 + 文档章节锚点 + GitHub 链接）
 * - 主题切换按钮（浅色/深色模式）
 * - 立即下载按钮
 * - 移动端侧边抽屉菜单（Sheet 组件）
 *
 * 使用 sticky 定位 + backdrop-blur 毛玻璃效果。
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Sun, Moon, Download, Github, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { StaggerContainer, StaggerItem } from '@/components/common/StaggerContainer';
import { useTheme } from '@/hooks/useTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/** 主导航项 */
const navItems = [
  { name: '首页', path: '/' },
  { name: '产品介绍', path: '/features' },
  { name: '软件下载', path: '/download' },
  { name: '安装教程', path: '/install' },
  { name: '使用指南', path: '/guide' },
  { name: '开发文档', path: '/docs' },
  { name: '交流社区', path: '/community' },
];

/** 文档页导航项（锚点跳转） */
const docsNavItems = [
  { name: '文档首页', section: 'docs-top' },
  { name: '项目结构', section: 'architecture' },
  { name: '开发流程', section: 'commands' },
  { name: '贡献指南', section: 'contributing' },
];

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduced = useReducedMotion();
  const isDocsPage = location.pathname === '/docs';

  const scrollToDocsSection = (event: React.MouseEvent<HTMLAnchorElement>, section: string) => {
    event.preventDefault();
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background/95 shadow-[0_8px_24px_hsl(224_42%_3%_/_0.08)] backdrop-blur supports-[backdrop-filter]:bg-background/80 dark:border-border dark:shadow-[0_8px_24px_hsl(224_42%_3%_/_0.35)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link
          to="/"
          className="group flex items-center gap-2 font-display text-2xl font-bold tracking-tight"
        >
          <span className="flex h-9 w-9 items-center justify-center border-2 border-foreground bg-transparent shadow-[var(--shadow-solid-sm)] transition-transform group-hover:-rotate-6 group-hover:scale-110">
            <img src="/csl.png" alt="CSL" className="h-full w-full object-contain" />
          </span>
          <span className="hidden md:inline">CSL 启动器</span>
        </Link>

        {/* Desktop Nav */}
        {isDocsPage ? (
          <nav className="hidden items-center gap-1 md:flex" aria-label="文档导航">
            <Link to="/" className="mr-2 flex items-center gap-1 border-r-2 border-foreground/20 pr-4 text-sm font-bold hover:text-accent">
              <ArrowLeft className="h-4 w-4" />
              返回官网
            </Link>
            {docsNavItems.map((item, index) => (
              <a
                key={item.section}
                href={`#${item.section}`}
                onClick={(event) => scrollToDocsSection(event, item.section)}
                className={`px-3 py-2 text-sm font-semibold transition-colors hover:text-accent ${index === 0 ? 'text-accent' : 'text-foreground'}`}
              >
                {item.name}
              </a>
            ))}
            <a
              href="https://github.com/MrWoods1692/CSL"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 flex items-center gap-1 border-l-2 border-foreground/20 pl-4 text-sm font-bold hover:text-accent"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </nav>
        ) : (
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative px-3 py-2 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${
                  isActive(item.path) ? 'text-accent' : 'text-foreground hover:text-accent'
                }`}
              >
                {item.name}
                <motion.span
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-1/2 h-1 -translate-x-1/2 bg-accent"
                  initial={false}
                  animate={{ width: isActive(item.path) ? 24 : 0, opacity: isActive(item.path) ? 1 : 0 }}
                  transition={{ duration: reduced ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
                />
                <span className="absolute bottom-0 left-1/2 h-1 w-0 -translate-x-1/2 bg-accent transition-all duration-300 ease-out group-hover:w-6" aria-hidden="true" />
              </Link>
            ))}
          </nav>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="h-10 w-10 border-2 border-foreground bg-background hover:bg-muted"
            aria-label={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          <Button
            asChild
            className={`${isDocsPage ? 'hidden' : 'hidden md:inline-flex'} h-10 border-2 border-foreground bg-primary px-4 font-bold text-primary-foreground shadow-[var(--shadow-solid-sm)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none`}
          >
            <Link to="/download">
              <Download className="mr-2 h-4 w-4" />
              立即下载
            </Link>
          </Button>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 border-2 border-foreground bg-background md:hidden"
                aria-label="打开导航菜单"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[280px] border-l-2 border-foreground bg-background p-0"
            >
              <div className="flex h-full flex-col">
                <div className="flex h-16 items-center border-b-2 border-foreground px-4">
                  <span className="font-display text-xl font-bold">菜单</span>
                </div>
                <StaggerContainer className="flex flex-col gap-1 p-4" stagger={0.06}>
                  {(isDocsPage ? docsNavItems : navItems).map((item) => (
                    <StaggerItem key={'path' in item ? item.path : item.section}>
                      {'path' in item ? (
                        <Link to={item.path} onClick={() => setMobileOpen(false)} className={`block rounded-md px-4 py-3 text-base font-bold transition-transform active:translate-x-1 ${isActive(item.path) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                          {item.name}
                        </Link>
                      ) : (
                        <a href={`#${item.section}`} onClick={(event) => { scrollToDocsSection(event, item.section); setMobileOpen(false); }} className="block rounded-md px-4 py-3 text-base font-bold transition-transform hover:bg-muted active:translate-x-1">
                          {item.name}
                        </a>
                      )}
                    </StaggerItem>
                  ))}
                  {!isDocsPage && <StaggerItem>
                    <Link
                      to="/download"
                      onClick={() => setMobileOpen(false)}
                      className="mt-4 flex items-center justify-center gap-2 rounded-md border-2 border-foreground bg-accent px-4 py-3 font-bold text-accent-foreground shadow-[var(--shadow-solid-sm)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                    >
                      <Download className="h-4 w-4" />
                      立即下载
                    </Link>
                  </StaggerItem>}
                  {isDocsPage && <StaggerItem><a href="https://github.com/MrWoods1692/CSL" target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)} className="mt-4 flex items-center justify-center gap-2 rounded-md border-2 border-foreground bg-accent px-4 py-3 font-bold text-accent-foreground shadow-[var(--shadow-solid-sm)] active:translate-x-1 active:translate-y-1 active:shadow-none"><Github className="h-4 w-4" />GitHub 仓库</a></StaggerItem>}
                  {isDocsPage && <StaggerItem><Link to="/" onClick={() => setMobileOpen(false)} className="mt-2 flex items-center justify-center gap-2 rounded-md border-2 border-foreground bg-primary px-4 py-3 font-bold text-primary-foreground shadow-[var(--shadow-solid-sm)] active:translate-x-1 active:translate-y-1 active:shadow-none"><ArrowLeft className="h-4 w-4" />返回官网首页</Link></StaggerItem>}
                </StaggerContainer>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
