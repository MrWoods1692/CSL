/**
 * 安装教程页面
 *
 * 页面结构：
 * 1. 平台 Tab 切换：Windows / macOS / Linux
 * 2. 安装步骤：编号步骤列表（带进度指示器）
 * 3. 安装小贴士：平台特定的注意事项
 *
 * 每个平台的教程包含 4 个步骤 + 2 条小贴士。
 */

import React, { useState } from 'react';
import { Monitor, Apple, Laptop, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RippleButton from '@/components/common/RippleButton';
import MainLayout from '@/components/layouts/MainLayout';
import PageMeta from '@/components/common/PageMeta';
import SectionHeader from '@/components/common/SectionHeader';
import AnimatedSection from '@/components/common/AnimatedSection';
import IconBox from '@/components/common/IconBox';
import { StaggerContainer, StaggerItem } from '@/components/common/StaggerContainer';
import DecorativeShape from '@/components/common/DecorativeShape';

/** 安装步骤 */
interface Step {
  title: string;
  desc: string;
}

/** 安装指南（按平台） */
interface InstallGuide {
  id: string;
  name: string;
  icon: React.ElementType;
  steps: Step[];
  tips: string[];
  color: string;
}

/** 各平台安装指南数据 */
const guides: InstallGuide[] = [
  {
    id: 'windows',
    name: 'Windows',
    icon: Monitor,
    color: 'bg-primary',
    steps: [
      { title: '下载安装包', desc: '访问下载页面，选择 Windows 版本（.exe 或 .zip）并下载。' },
      { title: '运行安装程序', desc: '双击下载的 .exe 文件，按提示完成安装。如果选择 .zip，解压到任意目录即可。' },
      { title: '允许防火墙', desc: '首次启动时，Windows 可能询问网络权限，请点击允许。' },
      { title: '完成设置', desc: '打开 CSL 启动器，登录账户并选择游戏版本，即可开始游玩。' },
    ],
    tips: [
      '建议将启动器安装到非系统盘，避免权限问题。',
      '若杀毒软件误报，请将 CSL 添加到白名单。',
    ],
  },
  {
    id: 'macos',
    name: 'macOS',
    icon: Apple,
    color: 'bg-accent',
    steps: [
      { title: '下载镜像', desc: '下载 macOS 版本 .dmg 文件，根据芯片选择 Intel 或 Apple Silicon。' },
      { title: '拖拽安装', desc: '打开 .dmg，将 CSL 启动器拖入「应用程序」文件夹。' },
      { title: '授权运行', desc: '首次打开若提示「无法验证开发者」，请前往「系统设置 > 隐私与安全性」允许运行。' },
      { title: '授予权限', desc: '根据提示授予文件夹访问权限，以便管理游戏目录。' },
    ],
    tips: [
      'Apple Silicon 设备选择 ARM 版本可获得更好性能。',
      '若遇到闪退，请检查是否已安装兼容的 Java 运行环境。',
    ],
  },
  {
    id: 'linux',
    name: 'Linux',
    icon: Laptop,
    color: 'bg-secondary',
    steps: [
      { title: '下载包', desc: '选择对应架构的 .AppImage 或 .tar.gz 文件下载。' },
      { title: '赋予执行权限', desc: '对 .AppImage 执行 chmod +x CSL-Launcher.AppImage。' },
      { title: '运行启动器', desc: '双击或在终端运行 ./CSL-Launcher.AppImage。' },
      { title: '安装 Java', desc: '如未安装 Java，启动器会提示自动下载或引导你安装。' },
    ],
    tips: [
      '部分发行版可能需要安装 libfuse2 才能运行 AppImage。',
      '使用 .tar.gz 时建议解压到 ~/.local/share/ 下。',
    ],
  },
];

const InstallPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('windows');
  const activeGuide = guides.find((g) => g.id === activeTab) || guides[0];

  return (
    <MainLayout>
      <PageMeta
        title="安装教程 - CSL 启动器"
        description="查看 CSL 启动器在 Windows、macOS 与 Linux 上的详细安装步骤与常见问题。"
      />

      <section className="relative overflow-hidden bg-background px-4 py-20 md:py-28">
        <DecorativeShape
          className="absolute right-6 top-24 h-20 w-20 border-accent bg-secondary opacity-25 md:h-28 md:w-28"
          startRotation={10}
          slow
        />
        <DecorativeShape
          className="absolute bottom-32 left-6 h-16 w-16 border-primary bg-accent opacity-25 md:h-24 md:w-24"
          startRotation={-20}
        />
        <div className="relative mx-auto max-w-5xl">
          <AnimatedSection>
            <SectionHeader
              title="安装教程"
              subtitle="根据你的操作系统选择对应教程，几分钟即可完成安装。"
            />
          </AnimatedSection>

          {/* Tabs */}
          <AnimatedSection delay={0.1}>
            <div className="mb-10 flex flex-wrap justify-center gap-3">
              {guides.map((guide) => (
                <RippleButton
                  key={guide.id}
                  onClick={() => setActiveTab(guide.id)}
                  rippleColor={activeTab === guide.id ? 'dark' : 'accent'}
                  className={`h-12 border-2 border-foreground px-6 font-bold shadow-[var(--shadow-solid-sm)] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                    activeTab === guide.id
                      ? `${guide.color} text-foreground`
                      : 'bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  <guide.icon className="mr-2 h-5 w-5" />
                  {guide.name}
                </RippleButton>
              ))}
            </div>
          </AnimatedSection>

          {/* Steps */}
          <AnimatedSection key={activeTab} delay={0.2} direction="up">
            <div className="sticker-card sticker-card-hover sticker-card-tilt">
              <div className="mb-6 flex items-center gap-3">
                <IconBox icon={activeGuide.icon} color={activeGuide.color} />
                <h2 className="font-display text-2xl font-bold md:text-3xl">
                  {activeGuide.name} 安装步骤
                </h2>
              </div>

              <StaggerContainer className="space-y-6" stagger={0.1}>
                {activeGuide.steps.map((step, index) => (
                  <StaggerItem key={index}>
                    <div className="relative flex gap-4 border-l-4 border-foreground pl-6">
                      <span
                        className={`absolute -left-5 top-0 flex h-10 w-10 items-center justify-center border-2 border-foreground font-display text-lg font-bold ${activeGuide.color}`}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="mb-1 font-display text-lg font-bold">{step.title}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </AnimatedSection>

          {/* Tips */}
          <AnimatedSection delay={0.3}>
            <div className="mt-8 sticker-card sticker-card-hover sticker-card-tilt border-l-4 border-l-accent bg-card">
              <h3 className="mb-3 flex items-center gap-2 font-display text-xl font-bold">
                <AlertCircle className="sticker-card-icon h-6 w-6 text-accent" />
                安装小贴士
              </h3>
              <ul className="space-y-2">
                {activeGuide.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </MainLayout>
  );
};

export default InstallPage;
