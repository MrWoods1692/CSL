import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Code,
  GitPullRequest,
  Terminal,
  FileJson,
  ExternalLink,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import RippleButton from '@/components/common/RippleButton';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layouts/MainLayout';
import PageMeta from '@/components/common/PageMeta';
import SectionHeader from '@/components/common/SectionHeader';
import AnimatedSection from '@/components/common/AnimatedSection';
import { StaggerContainer, StaggerItem } from '@/components/common/StaggerContainer';
import DecorativeShape from '@/components/common/DecorativeShape';
import RippleCard from '@/components/common/RippleCard';

interface DocItem {
  title: string;
  category: string;
  desc: string;
  icon: React.ElementType;
  link?: string;
}

const docs: DocItem[] = [
  {
    title: '快速开始',
    category: '入门',
    desc: '5 分钟了解 CSL 的架构与开发环境搭建。',
    icon: BookOpen,
  },
  {
    title: 'API 参考',
    category: '参考',
    desc: '完整的启动器 API 列表，包含版本管理、启动流程与事件系统。',
    icon: Code,
  },
  {
    title: '插件开发',
    category: '进阶',
    desc: '学习如何编写 CSL 插件，扩展启动器功能。',
    icon: FileJson,
  },
  {
    title: 'CLI 工具',
    category: '工具',
    desc: '使用命令行快速安装版本、管理账户与启动游戏。',
    icon: Terminal,
  },
  {
    title: '贡献指南',
    category: '社区',
    desc: '了解代码规范、提交 PR 流程与 Issue 模板。',
    icon: GitPullRequest,
  },
  {
    title: '架构设计',
    category: '进阶',
    desc: '深入理解 CSL 的模块划分、状态管理与渲染管线。',
    icon: BookOpen,
  },
];

const DocsPage: React.FC = () => {
  const [query, setQuery] = useState('');

  const filteredDocs = docs.filter((doc) => {
    const matchQuery =
      doc.title.toLowerCase().includes(query.toLowerCase()) ||
      doc.desc.toLowerCase().includes(query.toLowerCase());
    return matchQuery;
  });

  return (
    <MainLayout>
      <PageMeta
        title="开发文档 - CSL 启动器"
        description="查阅 CSL 启动器的开发文档、API 参考、插件开发与贡献指南。"
      />

      <section className="relative overflow-hidden bg-background px-4 py-20 md:py-28">
        <DecorativeShape
          className="absolute right-8 top-16 h-24 w-24 border-accent bg-secondary opacity-25 md:h-32 md:w-32"
          startRotation={15}
          slow
        />
        <DecorativeShape
          className="absolute bottom-20 left-8 h-20 w-20 border-primary bg-accent opacity-25 md:h-28 md:w-28"
          startRotation={-25}
        />
        <div className="relative mx-auto max-w-6xl">
          <AnimatedSection>
            <SectionHeader
              title="开发文档"
              subtitle="为开发者准备的完整参考资料，从入门到插件开发应有尽有。"
            />
          </AnimatedSection>

          {/* Search */}
          <AnimatedSection delay={0.1}>
            <div className="mx-auto mb-8 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="搜索文档..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-14 border-2 border-foreground bg-background pl-11 text-base shadow-[var(--shadow-solid)] focus-visible:ring-accent"
                />
              </div>
            </div>
          </AnimatedSection>

          {/* Docs Grid */}
          <StaggerContainer key={query} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
            {filteredDocs.map((doc) => (
              <StaggerItem key={doc.title}>
                <RippleCard
                  as="a"
                  href={doc.link || '#'}
                  tilt={false}
                  className="group block h-full"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center border-2 border-foreground bg-secondary text-secondary-foreground shadow-[var(--shadow-solid-sm)]">
                      <doc.icon className="sticker-card-icon h-6 w-6" />
                    </div>
                    <Badge className="border-2 border-foreground bg-primary text-xs font-bold text-primary-foreground">
                      {doc.category}
                    </Badge>
                  </div>
                  <h3 className="mb-2 flex items-center gap-2 font-display text-xl font-bold group-hover:text-accent">
                    {doc.title}
                    <ExternalLink className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{doc.desc}</p>
                </RippleCard>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {filteredDocs.length === 0 && (
            <AnimatedSection>
              <div className="sticker-card mx-auto max-w-xl text-center">
                <p className="font-display text-lg font-bold">未找到相关文档</p>
                <p className="text-sm text-muted-foreground">尝试更换关键词或分类。</p>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>

      <section className="border-t-2 border-foreground bg-primary px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <AnimatedSection>
            <Code className="mx-auto mb-4 h-12 w-12 text-primary-foreground" />
            <h2 className="mb-4 font-display text-3xl font-bold text-primary-foreground md:text-4xl">
              想要贡献代码？
            </h2>
            <p className="mb-8 text-primary-foreground/90">
              CSL 是开源项目，每一份贡献都能让它变得更好。
            </p>
            <RippleButton
              asChild
              className="h-14 border-2 border-foreground bg-secondary px-8 text-lg font-bold text-secondary-foreground shadow-[var(--shadow-solid)] transition-transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[var(--shadow-solid-lg)] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitPullRequest className="mr-2 h-5 w-5" />
                查看贡献指南
              </a>
            </RippleButton>
          </AnimatedSection>
        </div>
      </section>
    </MainLayout>
  );
};

export default DocsPage;
