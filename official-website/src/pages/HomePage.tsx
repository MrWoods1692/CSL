import React from 'react';
import { Link } from 'react-router-dom';
import { Download, ArrowRight, Sparkles, Zap, Shield, Users, Package, Cpu, Star, GitBranch } from 'lucide-react';
import RippleButton from '@/components/common/RippleButton';
import MainLayout from '@/components/layouts/MainLayout';
import PageMeta from '@/components/common/PageMeta';
import Marquee from '@/components/common/Marquee';
import SectionHeader from '@/components/common/SectionHeader';
import AnimatedSection from '@/components/common/AnimatedSection';
import IconBox from '@/components/common/IconBox';
import DecorativeShape from '@/components/common/DecorativeShape';
import { StaggerContainer, StaggerItem } from '@/components/common/StaggerContainer';

const highlights = [
  {
    icon: Zap,
    title: '极速启动',
    desc: '优化的启动流程，秒级进入方块世界。',
    color: 'bg-primary',
  },
  {
    icon: Shield,
    title: '稳定可靠',
    desc: '多版本隔离，崩溃自动恢复，存档更安全。',
    color: 'bg-accent',
  },
  {
    icon: Sparkles,
    title: '简洁易用',
    desc: '直观的操作界面，新手也能轻松上手。',
    color: 'bg-secondary',
  },
  {
    icon: Users,
    title: '活跃社区',
    desc: '加入数万玩家社区，获取帮助与灵感。',
    color: 'bg-primary',
  },
];

const stats = [
  { icon: Users, value: '50K+', label: '活跃用户', color: 'text-primary' },
  { icon: Package, value: '300+', label: '支持版本', color: 'text-accent' },
  { icon: Star, value: '4.9', label: '用户评分', color: 'text-secondary' },
  { icon: GitBranch, value: '100%', label: '开源免费', color: 'text-primary' },
];

const previewFeatures = [
  {
    icon: Package,
    title: '多版本管理',
    desc: '官方版、快照版、Forge / Fabric / Quilt 一键切换，版本完全隔离。',
    color: 'bg-primary',
  },
  {
    icon: Cpu,
    title: '智能内存分配',
    desc: '自动检测系统环境，推荐最佳 Java 与内存配置，告别卡顿。',
    color: 'bg-accent',
  },
  {
    icon: Shield,
    title: '崩溃自动恢复',
    desc: '游戏意外退出时自动保存日志与存档，一键回滚到稳定状态。',
    color: 'bg-secondary',
  },
];

const HomePage: React.FC = () => {
  return (
    <MainLayout>
      <PageMeta
        title="CSL 启动器 - 为《我的世界》玩家打造"
        description="CSL 启动器官方网站：产品介绍、软件下载、安装教程、使用指南、开发文档与交流社区。"
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b-2 border-foreground bg-background px-4 py-20 md:py-32">
        {/* 背景网格 */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* 径向光晕 */}
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 bg-radial-fade" />
        <div
          className="absolute -right-10 -top-10 h-40 w-40 rotate-12 border-4 border-accent bg-secondary opacity-40 animate-float-rotate-slow md:h-64 md:w-64"
          style={{ '--start-rotation': '12deg' } as React.CSSProperties}
        />
        <div
          className="absolute bottom-10 left-10 h-24 w-24 -rotate-12 border-4 border-primary bg-accent opacity-40 animate-float-rotate md:h-40 md:w-40"
          style={{ '--start-rotation': '-12deg' } as React.CSSProperties}
        />
        {/* diamond 装饰预览 */}
        <DecorativeShape
          shape="diamond"
          className="absolute right-1/4 top-1/3 h-20 w-20 text-accent opacity-50 md:h-32 md:w-32"
          startRotation={0}
          slow
        />

        <div className="relative mx-auto max-w-5xl text-center">
          <AnimatedSection direction="down" delay={0}>
            <div className="mb-6 inline-flex items-center gap-2 border-2 border-foreground bg-secondary px-4 py-2 font-bold shadow-[var(--shadow-solid-sm)]">
              <Sparkles className="h-4 w-4" />
              免费 · 开源 · 跨平台
            </div>
          </AnimatedSection>

          <AnimatedSection direction="up" delay={0.1}>
            <h1 className="mb-6 font-display text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl lg:text-8xl">
              <span className="block text-foreground">启动你的</span>
              <span className="block text-gradient-vibrant text-stroke">方块世界</span>
            </h1>
          </AnimatedSection>

          <AnimatedSection direction="up" delay={0.2}>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
              CSL 启动器专为《我的世界》玩家设计。支持多版本管理、模组安装、自动更新，让每一次冒险都从这里开始。
            </p>
          </AnimatedSection>

          <AnimatedSection direction="up" delay={0.3}>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <RippleButton
                asChild
                size="lg"
                rippleColor="dark"
                className="btn-sticker btn-sticker-lg h-14 bg-primary px-8 text-lg text-primary-foreground"
              >
                <Link to="/download">
                  <Download className="mr-2 h-5 w-5" />
                  立即下载
                </Link>
              </RippleButton>
              <RippleButton
                asChild
                variant="outline"
                size="lg"
                className="btn-sticker h-14 bg-background px-8 text-lg"
              >
                <Link to="/features">
                  了解更多
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </RippleButton>
            </div>
          </AnimatedSection>

          <AnimatedSection direction="up" delay={0.4}>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-sm font-bold text-muted-foreground">
              <span className="flex items-center gap-1.5 border-2 border-foreground bg-card px-3 py-1.5 shadow-[var(--shadow-solid-sm)]">
                <span className="h-2 w-2 bg-primary" />
                Windows
              </span>
              <span className="flex items-center gap-1.5 border-2 border-foreground bg-card px-3 py-1.5 shadow-[var(--shadow-solid-sm)]">
                <span className="h-2 w-2 bg-accent" />
                macOS
              </span>
              <span className="flex items-center gap-1.5 border-2 border-foreground bg-card px-3 py-1.5 shadow-[var(--shadow-solid-sm)]">
                <span className="h-2 w-2 bg-secondary" />
                Linux
              </span>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Marquee */}
      <Marquee>
        {[
          { text: 'CSL 启动器 · 为冒险而生', icon: '◆' },
          { text: '多版本管理 · 一键切换', icon: '★' },
          { text: '智能内存分配 · 自动调优', icon: '●' },
          { text: '崩溃自动恢复 · 从不丢失进度', icon: '▲' },
          { text: '跨平台 · Windows / macOS / Linux', icon: '✦' },
          { text: '完全开源 · 社区驱动', icon: '✚' },
          { text: '模组生态 · 即装即用', icon: '◆' },
          { text: '离线账户 · 正版登录 · 一处管理', icon: '★' },
          { text: '50,000+ 玩家的共同选择', icon: '●' },
        ].map((item, i) => (
          <span
            key={i}
            className="mx-6 inline-flex items-center gap-3 font-display text-xl font-bold text-secondary-foreground"
          >
            <span className="text-accent">{item.icon}</span>
            {item.text}
          </span>
        ))}
      </Marquee>

      {/* Stats */}
      <section className="border-b-2 border-foreground bg-background px-4 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <StaggerContainer className="grid grid-cols-2 gap-6 md:grid-cols-4" stagger={0.1}>
            {stats.map((stat) => (
              <StaggerItem key={stat.label} direction="scale">
                <div className="sticker-card sticker-card-hover sticker-card-accent-top flex flex-col items-center p-6 text-center">
                  <IconBox
                    icon={stat.icon}
                    color="bg-background"
                    iconClassName={stat.color}
                    className="mb-3"
                  />
                  <div className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-muted px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <AnimatedSection>
            <SectionHeader
              title="为什么选择 CSL"
              subtitle="我们重新思考了《我的世界》启动体验，将复杂留给代码，把简单交还给你。"
            />
          </AnimatedSection>
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
            {highlights.map((item) => (
              <StaggerItem key={item.title}>
                <div className="sticker-card-interactive-full h-full">
                  <IconBox icon={item.icon} color={item.color} className="mb-4" />
                  <h3 className="mb-2 font-display text-xl font-bold">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Feature Preview */}
      <section className="border-y-2 border-foreground bg-background px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <AnimatedSection>
            <SectionHeader
              title="核心功能一览"
              subtitle="从版本管理到崩溃恢复，CSL 为你打理一切。"
            />
          </AnimatedSection>
          <StaggerContainer className="grid gap-6 md:grid-cols-3" stagger={0.12}>
            {previewFeatures.map((item) => (
              <StaggerItem key={item.title}>
                <div className="sticker-card-interactive-full h-full">
                  <IconBox icon={item.icon} color={item.color} className="mb-4" />
                  <h3 className="mb-2 font-display text-xl font-bold">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
          <AnimatedSection delay={0.3}>
            <div className="mt-10 text-center">
              <RippleButton
                asChild
                variant="outline"
                className="btn-sticker h-12 bg-background px-6"
              >
                <Link to="/features">
                  查看全部功能
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </RippleButton>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-primary px-4 py-20 md:py-28">
        {/* 背景斜纹 */}
        <div className="absolute inset-0 bg-diagonal-stripes opacity-[0.04]" />
        <div
          className="absolute -left-10 top-10 h-32 w-32 -rotate-12 border-4 border-foreground bg-secondary opacity-30 animate-float-rotate md:h-48 md:w-48"
          style={{ '--start-rotation': '-12deg' } as React.CSSProperties}
        />
        <div
          className="absolute -bottom-8 -right-8 h-28 w-28 rotate-45 border-4 border-foreground bg-accent opacity-30 animate-float-rotate-slow md:h-40 md:w-40"
          style={{ '--start-rotation': '45deg' } as React.CSSProperties}
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <AnimatedSection>
            <h2 className="mb-6 font-display text-3xl font-bold text-primary-foreground md:text-5xl">
              准备好开始了吗？
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <p className="mb-8 text-lg text-primary-foreground/90">
              下载 CSL 启动器，加入全球玩家社区，探索无限可能的方块世界。
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <RippleButton
                asChild
                size="lg"
                className="btn-sticker btn-sticker-lg h-14 bg-secondary px-8 text-lg text-secondary-foreground"
              >
                <Link to="/download">免费下载</Link>
              </RippleButton>
              <RippleButton
                asChild
                variant="outline"
                size="lg"
                className="btn-sticker h-14 bg-primary-foreground px-8 text-lg text-primary"
              >
                <Link to="/community">加入社区</Link>
              </RippleButton>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </MainLayout>
  );
};

export default HomePage;
