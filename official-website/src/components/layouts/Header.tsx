import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Sun, Moon, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { StaggerContainer, StaggerItem } from '@/components/common/StaggerContainer';
import { useTheme } from '@/hooks/useTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const navItems = [
  { name: '首页', path: '/' },
  { name: '产品介绍', path: '/features' },
  { name: '软件下载', path: '/download' },
  { name: '安装教程', path: '/install' },
  { name: '使用指南', path: '/guide' },
  { name: '开发文档', path: '/docs' },
  { name: '交流社区', path: '/community' },
];

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduced = useReducedMotion();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link
          to="/"
          className="group flex items-center gap-2 font-display text-2xl font-bold tracking-tight"
        >
          <span className="flex h-9 w-9 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground shadow-[var(--shadow-solid-sm)] transition-transform group-hover:-rotate-6 group-hover:scale-110">
            C
          </span>
          <span className="hidden md:inline">CSL 启动器</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`group relative px-3 py-2 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${
                isActive(item.path)
                  ? 'text-accent'
                  : 'text-foreground hover:text-accent'
              }`}
            >
              {item.name}
              <motion.span
                layoutId="nav-underline"
                className="absolute bottom-0 left-1/2 h-1 -translate-x-1/2 bg-accent"
                initial={false}
                animate={{
                  width: isActive(item.path) ? 24 : 0,
                  opacity: isActive(item.path) ? 1 : 0,
                }}
                transition={{ duration: reduced ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
              />
              <span
                className="absolute bottom-0 left-1/2 h-1 w-0 -translate-x-1/2 bg-accent transition-all duration-300 ease-out group-hover:w-6"
                aria-hidden="true"
              />
            </Link>
          ))}
        </nav>

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
            className="hidden h-10 border-2 border-foreground bg-primary px-4 font-bold text-primary-foreground shadow-[var(--shadow-solid-sm)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none md:inline-flex"
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
                  {navItems.map((item) => (
                    <StaggerItem key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`block rounded-md px-4 py-3 text-base font-bold transition-transform active:translate-x-1 ${
                          isActive(item.path)
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        {item.name}
                      </Link>
                    </StaggerItem>
                  ))}
                  <StaggerItem>
                    <Link
                      to="/download"
                      onClick={() => setMobileOpen(false)}
                      className="mt-4 flex items-center justify-center gap-2 rounded-md border-2 border-foreground bg-accent px-4 py-3 font-bold text-accent-foreground shadow-[var(--shadow-solid-sm)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                    >
                      <Download className="h-4 w-4" />
                      立即下载
                    </Link>
                  </StaggerItem>
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
