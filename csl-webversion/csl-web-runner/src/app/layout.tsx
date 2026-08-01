import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CSL Web Runner - Minecraft 网页版',
  description: 'Craft Spirit Launcher Web Edition - 在浏览器中运行 Minecraft',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}