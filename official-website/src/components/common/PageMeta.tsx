/**
 * 页面元数据组件
 * 
 * 为每个页面设置 SEO 元数据：
 * - HTML title / description / keywords
 * - Open Graph 标签（og:url, og:title, og:description, og:image）
 * - Twitter Card 标签
 * - 规范链接（canonical URL）
 * - 结构化数据（JSON-LD Schema.org SoftwareApplication）
 * 
 * 同时导出 AppWrapper：包裹整个应用的顶层 Provider（HelmetProvider + TooltipProvider）。
 */

import { HelmetProvider, Helmet } from "react-helmet-async";
import { useLocation } from 'react-router-dom';
import { TooltipProvider } from "@/components/ui/tooltip";

const PageMeta = ({
  title,
  description,
  keywords = 'CSL 启动器, Minecraft 启动器, 我的世界启动器, Minecraft, 模组',
}: {
  title: string;
  description: string;
  keywords?: string;
}) => {
  const location = useLocation();
  // 构建当前页面的完整规范 URL
  const canonicalUrl = `${window.location.origin}${location.pathname}`;
  // Schema.org 结构化数据：SoftwareApplication 类型
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'CSL 启动器',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Windows, macOS, Linux',
    description,
    url: canonicalUrl,
    image: `${window.location.origin}/csl.png`,
    softwareVersion: '开源版本',
    author: { '@type': 'Organization', name: 'CSL 开源社区' },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
  };

  return (
    <Helmet>
      {/* 基础 SEO */}
      <title>{title}</title>
      <link rel="canonical" href={canonicalUrl} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {/* Open Graph（Facebook / Discord 等） */}
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${window.location.origin}/csl.png`} />
      {/* Twitter Card */}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${window.location.origin}/csl.png`} />
      {/* JSON-LD 结构化数据 */}
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
};

/**
 * 应用顶层包裹组件
 * 提供 HelmetProvider（SEO 元数据管理）和 TooltipProvider（全局 Tooltip 上下文）。
 */
export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>
    <TooltipProvider>
      {children}
    </TooltipProvider>
  </HelmetProvider>
);

export default PageMeta;
