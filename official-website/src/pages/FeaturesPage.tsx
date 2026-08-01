import React from 'react';
import {
  Boxes,
  Puzzle,
  RefreshCw,
  Monitor,
  Gamepad2,
  FileCode,
  Rocket,
  Heart,
} from 'lucide-react';
import MainLayout from '@/components/layouts/MainLayout';
import PageMeta from '@/components/common/PageMeta';
import SectionHeader from '@/components/common/SectionHeader';
import AnimatedSection from '@/components/common/AnimatedSection';
import IconBox from '@/components/common/IconBox';
import { StaggerContainer, StaggerItem } from '@/components/common/StaggerContainer';
import DecorativeShape from '@/components/common/DecorativeShape';

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

const advantages = [
  { title: '零广告', desc: '界面清爽，无弹窗、无捆绑，专注游戏体验。', color: 'bg-primary' },
  { title: '高性能', desc: '优化的 Java 检测与内存分配，让游戏运行更流畅。', color: 'bg-accent' },
  { title: '开源透明', desc: '代码完全开源，任何人都可以审计、贡献与二次开发。', color: 'bg-secondary' },
  { title: '社区驱动', desc: '由玩家与开发者共同维护，快速响应问题与新需求。', color: 'bg-primary' },
];

const FeaturesPage: React.FC = () => {
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
