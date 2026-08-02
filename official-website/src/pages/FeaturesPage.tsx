/**
 * 产品介绍页面
 *
 * 页面结构：
 * 1. 功能特性网格：6 个核心功能卡片（多版本管理、模组整合包、自动更新、跨平台、账户联机、开发者友好）
 * 2. 优势亮点：零广告、高性能、开源透明、社区驱动
 * 3. PPT 演示区：4 张幻灯片展示 CSL 工作流（准备→管理→探索→启动），自动轮播 + 手动切换
 */

import React, { useEffect, useState } from 'react';
import {
  Boxes,
  Puzzle,
  RefreshCw,
  Monitor,
  Gamepad2,
  FileCode,
  Rocket,
  Heart,
  Download,
  Settings2,
  Play,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import MainLayout from '@/components/layouts/MainLayout';
import PageMeta from '@/components/common/PageMeta';
import SectionHeader from '@/components/common/SectionHeader';
import AnimatedSection from '@/components/common/AnimatedSection';
import IconBox from '@/components/common/IconBox';
import { StaggerContainer, StaggerItem } from '@/components/common/StaggerContainer';
import DecorativeShape from '@/components/common/DecorativeShape';

/** 功能特性数据 */
const features = [
  {
    icon: Boxes,
    title: '多版本管理',
    desc: '一键安装、切换官方版、快照版与 Forge/Fabric/Quilt 等模组加载器，版本之间完全隔离，互不冲突。',
    color: 'bg-primary',
  },
  {
    icon: Puzzle,
    title: '模组与整合包',
    desc: '内置模组搜索与安装，支持 CurseForge、Modrinth 等主流平台，整合包导入只需拖拽。',
    color: 'bg-accent',
  },
  {
    icon: RefreshCw,
    title: '自动更新',
    desc: '启动器与资源包自动检测更新，保持最新体验，无需手动下载与替换文件。',
    color: 'bg-secondary',
  },
  {
    icon: Monitor,
    title: '跨平台支持',
    desc: '原生适配 Windows、macOS 与 Linux，无论你使用什么设备，都能获得一致体验。',
    color: 'bg-primary',
  },
  {
    icon: Gamepad2,
    title: '账户与多人联机',
    desc: '支持微软、Mojang 与离线账户登录，快速加入服务器，管理好友列表与联机历史。',
    color: 'bg-accent',
  },
  {
    icon: FileCode,
    title: '开发者友好',
    desc: '开放的 API 与插件系统，允许开发者扩展启动器功能，打造属于自己的工具链。',
    color: 'bg-secondary',
  },
];

/** 优势亮点数据 */
const advantages = [
  { title: '零广告', desc: '界面清爽，无弹窗、无捆绑，专注游戏体验。', color: 'bg-primary' },
  { title: '高性能', desc: '优化的 Java 检测与内存分配，让游戏运行更流畅。', color: 'bg-accent' },
  { title: '开源透明', desc: '代码完全开源，任何人都可以审计、贡献与二次开发。', color: 'bg-secondary' },
  { title: '社区驱动', desc: '由玩家与开发者共同维护，快速响应问题与新需求。', color: 'bg-primary' },
];

/** PPT 演示幻灯片数据 */
const presentationSlides = [
  {
    eyebrow: '01 / 准备',
    title: '从下载到启动，只需几步',
    desc: 'CSL 会自动识别系统环境与 Java 版本，帮你完成首次配置。常用版本、账户和启动参数集中在一个清晰的工作台中。',
    icon: Download,
    color: 'bg-primary',
    detail: ['自动检测 Java 环境', '断点续传与镜像加速', '新手引导清晰易懂'],
  },
  {
    eyebrow: '02 / 管理',
    title: '把每个游戏实例分开管理',
    desc: '为生存、整合包、多人服务器建立独立实例。版本、模组、资源包和存档互不覆盖，切换体验更安心。',
    icon: Boxes,
    color: 'bg-secondary',
    detail: ['实例数据完全隔离', '自定义内存与 JVM 参数', '一键复制与备份配置'],
  },
  {
    eyebrow: '03 / 探索',
    title: '发现并安装你的下一组模组',
    desc: '在启动器内搜索社区资源，查看兼容版本与依赖关系。拖入整合包后，CSL 会自动整理文件并提示冲突。',
    icon: Puzzle,
    color: 'bg-accent',
    detail: ['支持主流模组平台', '自动处理依赖关系', '导入整合包无需解压'],
  },
  {
    eyebrow: '04 / 启动',
    title: '稳定、快速地进入游戏',
    desc: '启动前检查账户、版本和资源完整性，减少因配置错误导致的崩溃。你也可以保存多套启动预设，随时切换。',
    icon: Play,
    color: 'bg-primary',
    detail: ['启动前完整性检查', '快捷启动预设', '清晰的日志与错误提示'],
  },
];

const FeaturesPage: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = presentationSlides[activeSlide];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % presentationSlides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, []);

  const changeSlide = (direction: number) => {
    setActiveSlide((current) => (current + direction + presentationSlides.length) % presentationSlides.length);
  };

  return (
    <MainLayout>
      <PageMeta
        title="产品介绍 - CSL 启动器"
        description="了解 CSL 启动器的核心功能特性与优势亮点：多版本管理、模组安装、自动更新、跨平台支持。"
      />

      <section className="relative overflow-hidden bg-background px-4 py-20 md:py-28">
        <DecorativeShape
          className="absolute -right-6 top-16 h-24 w-24 border-accent bg-secondary opacity-30 md:h-36 md:w-36"
          startRotation={12}
        />
        <DecorativeShape
          className="absolute bottom-20 left-4 h-20 w-20 border-primary bg-accent opacity-30 md:h-28 md:w-28"
          startRotation={-18}
          slow
        />
        <div className="relative mx-auto max-w-6xl">
          <AnimatedSection>
            <SectionHeader
              title="功能特性"
              subtitle="CSL 启动器覆盖从下载到启动的全流程，让每一次进入游戏都更简单。"
            />
          </AnimatedSection>
          <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
            {features.map((item) => (
              <StaggerItem key={item.title}>
                <div className="sticker-card-interactive-full h-full">
                  <div className="tape" />
                  <IconBox icon={item.icon} color={item.color} className="mb-4" />
                  <h3 className="mb-2 font-display text-xl font-bold">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="relative overflow-hidden bg-background px-4 py-20 md:py-28">
        <div className="relative mx-auto max-w-6xl">
          <AnimatedSection>
            <SectionHeader
              title="一眼看懂 CSL 的工作流"
              subtitle="像翻阅一份 PPT 一样，快速了解从准备环境到进入游戏的完整流程。"
            />
          </AnimatedSection>

          <AnimatedSection delay={0.12} direction="none">
            <div className="ppt-deck relative overflow-hidden border-2 border-foreground bg-card shadow-[var(--shadow-solid-lg)]">
              <div className="flex items-center justify-between border-b-2 border-foreground bg-foreground px-4 py-3 text-background">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em]">
                  <span className="h-3 w-3 rounded-full bg-accent" />
                  CSL PRODUCT DECK
                </div>
                <span className="font-mono text-xs">{String(activeSlide + 1).padStart(2, '0')} / {String(presentationSlides.length).padStart(2, '0')}</span>
              </div>

              <div className="grid min-h-[420px] md:grid-cols-[0.9fr_1.1fr]">
                <div className={`relative flex items-center justify-center overflow-hidden ${slide.color} p-8 md:p-12`}>
                  <div className="absolute -right-10 -top-10 h-44 w-44 rotate-12 border-2 border-foreground/40 bg-background/20" />
                  <div className="absolute -bottom-16 -left-8 h-40 w-40 -rotate-12 border-2 border-foreground/40 bg-background/20" />
                  <div className="ppt-loader relative z-10 flex h-48 w-48 items-center justify-center border-2 border-foreground bg-background shadow-[var(--shadow-solid)]">
                    <div className="absolute inset-5 animate-spin-slow border-2 border-dashed border-foreground/50" />
                    <slide.icon className="h-20 w-20 text-foreground" strokeWidth={1.5} />
                    <span className="absolute bottom-5 font-mono text-[10px] font-bold tracking-widest">LOADING EXPERIENCE</span>
                  </div>
                </div>

                <div className="flex flex-col justify-between p-7 md:p-12">
                  <div>
                    <p className="mb-4 font-mono text-xs font-bold tracking-[0.2em] text-accent">{slide.eyebrow}</p>
                    <h3 className="mb-5 max-w-xl font-display text-3xl font-bold leading-tight md:text-5xl">{slide.title}</h3>
                    <p className="max-w-xl leading-relaxed text-muted-foreground">{slide.desc}</p>
                    <ul className="mt-7 grid gap-3 sm:grid-cols-3">
                      {slide.detail.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm font-semibold">
                          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-10 flex items-center gap-4">
                    <button type="button" onClick={() => changeSlide(-1)} className="btn-sticker flex h-10 w-10 items-center justify-center bg-background" aria-label="上一页">
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button type="button" onClick={() => changeSlide(1)} className="btn-sticker flex h-10 w-10 items-center justify-center bg-primary" aria-label="下一页">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="flex flex-1 gap-2" aria-label="演示页码">
                      {presentationSlides.map((item, index) => (
                        <button
                          type="button"
                          key={item.eyebrow}
                          onClick={() => setActiveSlide(index)}
                          className={`h-2 flex-1 border border-foreground transition-colors ${index === activeSlide ? 'bg-accent' : 'bg-muted'}`}
                          aria-label={`第 ${index + 1} 页`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div key={activeSlide} className="ppt-progress absolute bottom-0 left-0 h-1 bg-accent" />
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="relative overflow-hidden border-y-2 border-foreground bg-muted px-4 py-20 md:py-28">
        <DecorativeShape
          className="absolute right-8 top-12 h-16 w-16 border-foreground bg-secondary opacity-30 md:h-24 md:w-24"
          startRotation={-10}
          slow
        />
        <DecorativeShape
          className="absolute bottom-12 left-8 h-20 w-20 border-foreground bg-accent opacity-30 md:h-28 md:w-28"
          startRotation={30}
        />
        <div className="relative mx-auto max-w-6xl">
          <AnimatedSection>
            <SectionHeader
              title="优势亮点"
              subtitle="在众多启动器中，CSL 选择把玩家体验放在第一位。"
            />
          </AnimatedSection>
          <StaggerContainer className="grid gap-6 md:grid-cols-2" stagger={0.12}>
            {advantages.map((item, index) => (
              <StaggerItem key={item.title}>
                <div
                  className={`sticker-card-interactive-full h-full ${index % 2 === 1 ? 'md:translate-y-6' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <IconBox icon={Heart} color={item.color} className="shrink-0" />
                    <div>
                      <h3 className="mb-1 font-display text-xl font-bold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="bg-accent px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <AnimatedSection>
            <Rocket className="mx-auto mb-4 h-12 w-12 text-accent-foreground" />
            <h2 className="mb-4 font-display text-3xl font-bold text-accent-foreground md:text-4xl">
              立即体验全部功能
            </h2>
            <p className="text-accent-foreground/90">
              免费下载 CSL 启动器，开启你的专属方块冒险。
            </p>
          </AnimatedSection>
        </div>
      </section>
    </MainLayout>
  );
};

export default FeaturesPage;
