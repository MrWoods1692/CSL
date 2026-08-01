import React from 'react';
import { Link } from 'react-router-dom';
import { Github, MessageCircle, Gamepad2 } from 'lucide-react';

const footerLinks = [
  { name: '产品介绍', path: '/features' },
  { name: '软件下载', path: '/download' },
  { name: '安装教程', path: '/install' },
  { name: '使用指南', path: '/guide' },
  { name: '开发文档', path: '/docs' },
  { name: '交流社区', path: '/community' },
];

const socialLinks = [
  { name: 'GitHub', href: 'https://github.com', icon: Github },
  { name: 'Telegram', href: 'https://telegram.org', icon: MessageCircle },
  { name: 'Discord', href: 'https://discord.com', icon: Gamepad2 },
];

const Footer: React.FC = () => {
  return (
    <footer className="relative border-t-2 border-foreground bg-muted">
      {/* 顶部彩色装饰条 */}
      <div className="flex h-2">
        <div className="flex-1 bg-primary" />
        <div className="flex-1 bg-secondary" />
        <div className="flex-1 bg-accent" />
      </div>
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="group flex items-center gap-2 font-display text-2xl font-bold">
              <span className="flex h-9 w-9 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground transition-transform group-hover:-rotate-6 group-hover:scale-110">
                C
              </span>
              CSL 启动器
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              为《我的世界》玩家打造的专业启动器。简单、快速、开源、自由。
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="border-2 border-foreground bg-card px-2 py-0.5 text-xs font-bold shadow-[var(--shadow-solid-sm)]">免费开源</span>
              <span className="border-2 border-foreground bg-card px-2 py-0.5 text-xs font-bold shadow-[var(--shadow-solid-sm)]">跨平台</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 font-display text-lg font-bold">快速导航</h3>
            <ul className="grid grid-cols-2 gap-2">
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
                  >
                    <span className="h-1 w-1 bg-foreground/30 transition-all group-hover:w-3 group-hover:bg-accent" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 font-display text-lg font-bold">关注我们</h3>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 border-2 border-foreground bg-background px-3 py-2 text-sm font-bold shadow-[var(--shadow-solid-sm)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[var(--shadow-solid)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  <social.icon className="h-4 w-4" />
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t-2 border-foreground pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} CSL 启动器. 基于开源协议发布.</p>
          <p className="mt-1">本网站与 Mojang Studios 或 Microsoft 无关联。</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
