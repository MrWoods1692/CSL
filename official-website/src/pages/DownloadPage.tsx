import React, { useState } from 'react';
import { Download, Calendar, FileText, History, Monitor, Apple, Laptop } from 'lucide-react';
import RippleButton from '@/components/common/RippleButton';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layouts/MainLayout';
import PageMeta from '@/components/common/PageMeta';
import SectionHeader from '@/components/common/SectionHeader';
import AnimatedSection from '@/components/common/AnimatedSection';
import IconBox from '@/components/common/IconBox';
import { StaggerContainer, StaggerItem } from '@/components/common/StaggerContainer';
import DecorativeShape from '@/components/common/DecorativeShape';

interface Version {
  version: string;
  date: string;
  changelog: string[];
}

const latestVersion = '3.2.1';
const releaseDate = '2026-07-28';

const platforms = [
  {
    name: 'Windows',
    icon: Monitor,
    arch: '64-bit',
    downloads: [{ label: '安装包', format: '.exe', size: '42 MB' }],
    color: 'bg-primary',
  },
  {
    name: 'macOS',
    icon: Apple,
    arch: 'Intel / Apple Silicon',
    downloads: [{ label: '安装包', format: '.dmg', size: '58 MB' }],
    color: 'bg-accent',
  },
  {
    name: 'Linux',
    icon: Laptop,
    arch: 'x64 / AppImage',
    downloads: [
      { label: 'Debian / Ubuntu', format: '.deb', size: '48 MB' },
      { label: 'RedHat / Fedora', format: '.rpm', size: '48 MB' },
      { label: 'AppImage', format: '.AppImage', size: '62 MB' },
      { label: 'Docker 镜像', format: 'docker pull', size: '镜像' },
      { label: '便携压缩包', format: '.tar.gz', size: '45 MB' },
    ],
    color: 'bg-secondary',
  },
];

const versionHistory: Version[] = [
  {
    version: '3.2.1',
    date: '2026-07-28',
    changelog: ['修复部分模组加载器识别错误', '优化启动内存分配提示', '改进深色模式下的对比度'],
  },
  {
    version: '3.2.0',
    date: '2026-07-15',
    changelog: ['新增整合包导出功能', '支持 Modrinth 直接搜索安装', '重写日志查看器'],
  },
  {
    version: '3.1.2',
    date: '2026-06-30',
    changelog: ['修复 Linux 下 Java 自动检测失败问题', '优化下载速度与断点续传'],
  },
  {
    version: '3.1.1',
    date: '2026-06-12',
    changelog: ['改进离线账户登录体验', '新增版本隔离快捷切换'],
  },
  {
    version: '3.1.0',
    date: '2026-05-28',
    changelog: ['全新 UI 设计', '支持 Microsoft 账户自动刷新', '新增服务器快捷加入'],
  },
];

const DownloadPage: React.FC = () => {
  const [showHistory, setShowHistory] = useState(false);

  const handleDownload = (platform: string) => {
    alert(`开始下载 ${platform} 版本。实际项目中此处会触发真实下载链接。`);
  };

  return (
    <MainLayout>
      <PageMeta
        title="软件下载 - CSL 启动器"
        description="下载 CSL 启动器最新版本，支持 Windows、macOS 与 Linux，查看完整版本历史。"
      />

      <section className="relative overflow-hidden bg-background px-4 py-20 md:py-28">
        <DecorativeShape
          className="absolute -right-4 top-20 h-24 w-24 border-accent bg-secondary opacity-30 md:h-32 md:w-32"
          startRotation={20}
        />
        <DecorativeShape
          className="absolute bottom-24 left-4 h-20 w-20 border-primary bg-accent opacity-30 md:h-28 md:w-28"
          startRotation={-15}
          slow
        />
        <div className="relative mx-auto max-w-6xl">
          <AnimatedSection>
            <SectionHeader
              title="下载 CSL 启动器"
              subtitle={`最新版本 ${latestVersion} · 发布于 ${releaseDate} · 免费开源`}
            />
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
              <Badge className="border-2 border-foreground bg-primary px-3 py-1 text-sm font-bold text-primary-foreground shadow-[var(--shadow-solid-sm)]">
                最新版 v{latestVersion}
              </Badge>
              <Badge
                variant="outline"
                className="border-2 border-foreground px-3 py-1 text-sm font-bold"
              >
                <Calendar className="mr-1 h-3 w-3" />
                {releaseDate}
              </Badge>
            </div>
          </AnimatedSection>

          <StaggerContainer className="grid gap-6 md:grid-cols-3" stagger={0.1} delay={0.2}>
            {platforms.map((platform, idx) => (
              <StaggerItem key={platform.name}>
                <div
                  className={`sticker-card sticker-card-hover sticker-card-tilt flex h-full flex-col ${idx === 0 ? 'md:scale-105 md:border-accent' : ''}`}
                >
                  {idx === 0 && (
                    <span className="absolute -top-3 right-4 border-2 border-foreground bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground shadow-[var(--shadow-solid-sm)]">
                      推荐
                    </span>
                  )}
                  <div className="tape" />
                  <div className="mb-6 flex items-center gap-4">
                    <IconBox icon={platform.icon} color={platform.color} size="lg" />
                    <div>
                      <h3 className="font-display text-2xl font-bold">{platform.name}</h3>
                      <p className="text-sm text-muted-foreground">{platform.arch}</p>
                    </div>
                  </div>

                  <div className="mb-4 space-y-2 border-b-2 border-dashed border-foreground/20 pb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">版本</span>
                      <span className="font-semibold">v{latestVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">架构</span>
                      <span className="font-semibold">{platform.arch}</span>
                    </div>
                  </div>

                  <div className="mt-auto space-y-2">
                    {platform.downloads.map((dl) => (
                      <RippleButton
                        key={dl.format}
                        onClick={() => handleDownload(`${platform.name} ${dl.format}`)}
                        className="btn-sticker h-11 w-full bg-foreground px-3 text-sm text-background"
                      >
                        <Download className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">{dl.label}</span>
                        <span className="ml-auto shrink-0 text-xs opacity-75">{dl.size}</span>
                      </RippleButton>
                    ))}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="border-t-2 border-foreground bg-muted px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <AnimatedSection>
            <div className="mb-8 flex items-center justify-between">
              <SectionHeader
                title="版本历史"
                subtitle="查看每个版本的更新内容与发布日期。"
                align="left"
              />
              <RippleButton
                variant="outline"
                onClick={() => setShowHistory(!showHistory)}
                rippleColor="accent"
                className="hidden h-10 border-2 border-foreground bg-background font-bold shadow-[var(--shadow-solid-sm)] hover:shadow-[var(--shadow-solid)] md:inline-flex"
              >
                <History className="mr-2 h-4 w-4" />
                {showHistory ? '收起历史' : '展开历史'}
              </RippleButton>
            </div>
          </AnimatedSection>

          <StaggerContainer className="space-y-4" stagger={0.08}>
            {(showHistory ? versionHistory : versionHistory.slice(0, 2)).map((version) => (
              <StaggerItem key={version.version}>
                <div className="sticker-card-interactive-full">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <h3 className="font-display text-xl font-bold">v{version.version}</h3>
                    <Badge
                      variant="outline"
                      className="border-2 border-foreground text-xs font-semibold"
                    >
                      <Calendar className="mr-1 h-3 w-3" />
                      {version.date}
                    </Badge>
                  </div>
                  <ul className="space-y-1">
                    {version.changelog.map((change, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <FileText className="mt-0.5 h-4 w-4 shrink-0" />
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <AnimatedSection delay={0.2}>
            <RippleButton
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
              rippleColor="accent"
              className="mt-6 h-12 w-full border-2 border-foreground bg-background font-bold shadow-[var(--shadow-solid-sm)] hover:shadow-[var(--shadow-solid)] md:hidden"
            >
              <History className="mr-2 h-4 w-4" />
              {showHistory ? '收起历史' : '展开全部历史'}
            </RippleButton>
          </AnimatedSection>
        </div>
      </section>
    </MainLayout>
  );
};

export default DownloadPage;
