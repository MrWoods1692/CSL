import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/theme';

export const metadata: Metadata = {
  title: 'CSL Web Runner - Minecraft 网页版',
  description: 'Craft Spirit Launcher Web Edition - 在浏览器中运行 Minecraft',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 防止主题闪烁的内联脚本
  const themeScript = `(function(){try{var t=localStorage.getItem('csl-web-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}