/**
 * 下载页面
 *
 * 页面结构：
 * 1. 版本信息栏：最新版本号、发布日期、自动检测平台
 * 2. 平台下载卡片：Windows / macOS / Linux，自动高亮推荐平台
 * 3. 版本历史：可展开的 changelog 列表
 *
 * 功能：
 * - 自动检测用户操作系统并高亮推荐
 * - 点击下载按钮直接跳转到 GitHub Release 上的 jar 资源
 * - 可查看历史版本更新日志
 */

import React, { useEffect, useState } from 'react';
import { Download, Calendar, FileText, History, Monitor, Apple, Laptop, Check, ShieldCheck, Zap, Terminal } from 'lucide-react';
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

/** 下载选项 */
interface DownloadOption {
  label: string;
  format: string;
  size: string;
  href?: string;
}

/** 当前最新版本号 */
const latestVersion = '0.2.0';
/** 发布日期 */
const releaseDate = '2026-11-15';

/** GitHub Release 页面 */
const releasePageUrl = 'https://github.com/MrWoods1692/CSL/releases/tag/v0.2.0';
/** 启动器本体（跨平台 fat jar，需要 Java 21+） */
const launcherJarUrl = `https://github.com/MrWoods1692/CSL/releases/download/v0.2.0/CSL-${latestVersion}.jar`;
/** Windows 免安装包：jpackage app-image，内置 Java 运行时与 JavaFX */
const launcherZipUrl = `https://github.com/MrWoods1692/CSL/releases/download/v0.2.0/CSL-${latestVersion}-windows-x64.zip`;
/** 校验文件 */
const launcherSha256Url = `https://github.com/MrWoods1692/CSL/releases/download/v0.2.0/CSL-${latestVersion}.jar.sha256`;

/** 平台下载数据 */
const platforms = [
  {
    name: 'Windows',
    icon: Monitor,
    arch: '10 / 11 · x64',
    description: '压缩包内置 Java 运行时，解压后双击 CSL.exe 即可，无需安装 Java。',
    downloads: [
      { label: '下载 Windows 版（含 Java）', format: '.zip', size: '75 MB', href: launcherZipUrl },
      { label: '仅下载 jar', format: '.jar', size: '13.4 MB', href: launcherJarUrl },
    ],
    color: 'bg-primary',
  },
  {
    name: 'macOS',
    icon: Apple,
    arch: 'Intel / Apple Silicon',
    description: '下载 jar 后运行 java -jar，需要已安装 Java 21。',
    downloads: [{ label: '下载 CSL 启动器', format: '.jar', size: '13.4 MB', href: launcherJarUrl }],
    color: 'bg-accent',
  },
  {
    name: 'Linux',
    icon: Laptop,
    arch: 'x64 / arm64',
    description: '下载 jar 后运行 java -jar，需要已安装 Java 21。',
    downloads: [
      { label: '下载 CSL 启动器', format: '.jar', size: '13.4 MB', href: launcherJarUrl },
      { label: 'SHA-256 校验文件', format: '.sha256', size: '1 KB', href: launcherSha256Url },
      { label: '查看 Release 说明', format: 'GitHub', size: '页面', href: releasePageUrl },
    ],
    color: 'bg-secondary',
  },
];

/** 版本历史数据 */
const versionHistory: Version[] = [
  {
    version: '0.2.0',
    date: '2026-11-15',
    changelog: [
      '移除多人联机、系统状态、外观与代理设置，安装包减小约 131 MB',
      '移除动态背景与各处方块加载动画，常驻内存由约 920 MB 降到约 250 MB',
      '优化默认 JVM 参数，启动时间由约 4.4 s 缩短到约 2.2 s',
      '重做下载页搜索筛选栏，新增下载详情页与安装向导的返回按钮',
      '新增 Windows 免安装包：内置 Java 运行时，解压双击即用',
    ],
  },
  {
    version: '0.1.0',
    date: '2026-07-28',
    changelog: ['首个公开版本', '支持游戏实例管理与模组下载', '支持 Microsoft 账户登录'],
  },
];

const DownloadPage: React.FC = () => {
  const [showHistory, setShowHistory] = useState(false);
  const [downloaded, setDownloaded] = useState<string | null>(null);
  const [detectedPlatform, setDetectedPlatform] = useState('');

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setDetectedPlatform(userAgent.includes('mac') ? 'macOS' : userAgent.includes('linux') ? 'Linux' : 'Windows');
  }, []);

  const handleDownload = (platform: string, option: DownloadOption) => {
    setDownloaded(`${platform} ${option.format}`);
    if (option.href && option.href !== '#') window.location.href = option.href;
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
              {detectedPlatform && (
                <Badge variant="outline" className="border-2 border-accent px-3 py-1 text-sm font-bold text-accent">
                  <Zap className="mr-1 h-3 w-3" />
                  已检测到 {detectedPlatform}
                </Badge>
              )}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <div className="mx-auto mb-10 grid max-w-3xl gap-3 text-sm sm:grid-cols-3">
              {[
                { icon: ShieldCheck, text: '开源透明，安全可靠' },
                { icon: Zap, text: '轻量精简，启动更快' },
                { icon: Check, text: 'Windows 免安装包，内置 Java' },
              ].map((item) => (
                <div key={item.text} className="flex items-center justify-center gap-2 border-2 border-foreground/20 bg-card px-3 py-3 font-semibold shadow-[var(--shadow-solid-sm)]">
                  <item.icon className="h-4 w-4 text-accent" />
                  {item.text}
                </div>
              ))}
            </div>
          </AnimatedSection>

          <StaggerContainer className="grid items-start gap-6 md:grid-cols-3" stagger={0.1} delay={0.2}>
            {platforms.map((platform) => {
              const isRecommended = detectedPlatform === platform.name;

              return (
              <StaggerItem key={platform.name} className="self-start">
                <div
                  className={`sticker-card sticker-card-hover sticker-card-tilt flex flex-col overflow-visible ${isRecommended ? 'md:scale-105 md:border-accent' : ''}`}
                >
                  {isRecommended && (
                    <span className="absolute -top-3 right-4 border-2 border-foreground bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground shadow-[var(--shadow-solid-sm)]">
                      推荐安装
                    </span>
                  )}
                  <div className="tape" />
                  <div className="mb-6 flex items-center gap-4 border-b-2 border-dashed border-foreground/20 pb-5">
                    <IconBox icon={platform.icon} color={platform.color} size="lg" />
                    <div>
                      <h3 className="font-display text-2xl font-bold">{platform.name}</h3>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{platform.arch}</p>
                    </div>
                  </div>
                  <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{platform.description}</p>

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

                  <div className="space-y-2">
                    {platform.downloads.map((dl) => (
                      <RippleButton
                        key={dl.format}
                        onClick={() => handleDownload(platform.name, dl)}
                        className="btn-sticker h-11 w-full bg-foreground px-3 text-sm text-background"
                      >
                        <Download className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">{dl.label}</span>
                        <span className="ml-auto shrink-0 text-xs opacity-75">{dl.size}</span>
                      </RippleButton>
                    ))}
                    {downloaded?.startsWith(platform.name) && (
                      <p className="flex items-center justify-center gap-1 text-xs font-semibold text-accent">
                        <Check className="h-3.5 w-3.5" />
                        已准备下载 {downloaded.replace(`${platform.name} `, '')}
                      </p>
                    )}
                  </div>
                </div>
              </StaggerItem>
              );
            })}
          </StaggerContainer>

          <AnimatedSection delay={0.25}>
            <div className="mx-auto mt-10 max-w-3xl border-2 border-foreground bg-card p-5 shadow-[var(--shadow-solid-sm)]">
              <p className="mb-2 flex items-center gap-2 font-display text-base font-bold">
                <Terminal className="h-4 w-4 text-accent" />
                运行方式
              </p>
              <p className="mb-2 text-xs font-semibold text-foreground">Windows（推荐）：解压 zip，双击 CSL.exe，无需安装 Java。</p>
              <code className="block select-all break-all rounded border-2 border-foreground/20 bg-muted px-3 py-2 font-mono text-sm">
                java -jar CSL-{latestVersion}.jar
              </code>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                选择 jar 时需要 Java 21 或更高版本（macOS / Linux 同样适用）。jar 首次启动会联网下载约 15 MB 的 JavaFX 运行库，之后从本地缓存加载。
              </p>
            </div>
          </AnimatedSection>
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
