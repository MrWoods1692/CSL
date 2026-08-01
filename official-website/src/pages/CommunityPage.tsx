import React from 'react';
import { Github, MessageCircle, Send, Gamepad2, Star, GitFork, Eye, Clock, Code2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layouts/MainLayout';
import PageMeta from '@/components/common/PageMeta';
import SectionHeader from '@/components/common/SectionHeader';
import AnimatedSection from '@/components/common/AnimatedSection';
import IconBox from '@/components/common/IconBox';
import { StaggerContainer, StaggerItem } from '@/components/common/StaggerContainer';
import DecorativeShape from '@/components/common/DecorativeShape';
import RippleCard from '@/components/common/RippleCard';

const communities = [
  {
    name: 'Telegram',
    desc: '国际玩家交流群，第一时间获取更新通知与公告。',
    icon: Send,
    color: 'bg-primary',
    joinText: '加入 Telegram 群组',
    link: 'https://telegram.org',
    detail: '搜索 @CSLLauncher 或直接点击加入。',
  },
  {
    name: 'Discord',
    desc: '语音与文字频道，适合组队、反馈与技术讨论。',
    icon: Gamepad2,
    color: 'bg-accent',
    joinText: '加入 Discord 服务器',
    link: 'https://discord.com',
    detail: '邀请链接：https://discord.gg/csl',
  },
  {
    name: 'QQ 群',
    desc: '中文玩家大本营，问题解答与资源整合。',
    icon: MessageCircle,
    color: 'bg-secondary',
    joinText: '加入 QQ 群',
    link: '#',
    detail: '群号：123456789（点击复制群号）',
  },
];

const githubRepo = {
  owner: 'MrWoods1692',
  name: 'CSL',
  desc: 'CSL 启动器核心代码仓库，欢迎 Star、Fork 与贡献代码。',
  link: 'https://github.com/MrWoods1692/CSL',
  stars: '1.2k',
  forks: '186',
  watchers: '94',
  language: 'Java',
  languageColor: 'bg-primary',
  updatedAt: '2 天前',
  openIssues: 23,
  contributors: [
    { name: 'MrWoods1692', color: 'bg-primary' },
    { name: 'contributor2', color: 'bg-accent' },
    { name: 'contributor3', color: 'bg-secondary' },
    { name: 'contributor4', color: 'bg-foreground' },
  ],
};

const CommunityPage: React.FC = () => {
  const handleCopy = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert(`已复制：${text}`);
    }
  };

  return (
    <MainLayout>
      <PageMeta
        title="交流社区 - CSL 启动器"
        description="加入 CSL 启动器社区：Telegram、Discord、QQ 群与微信群，获取帮助与最新动态。"
      />

      <section className="relative overflow-hidden bg-background px-4 py-20 md:py-28">
        <DecorativeShape
          className="absolute -right-4 top-20 h-24 w-24 border-accent bg-secondary opacity-25 md:h-32 md:w-32"
          startRotation={30}
        />
        <DecorativeShape
          className="absolute bottom-24 left-6 h-20 w-20 border-primary bg-accent opacity-25 md:h-28 md:w-28"
          startRotation={-15}
          slow
        />
        <div className="relative mx-auto max-w-6xl">
          <AnimatedSection>
            <SectionHeader
              title="加入社区"
              subtitle="与全球玩家和开发者一起交流、分享与创造。"
            />
          </AnimatedSection>

          <StaggerContainer className="grid gap-6 md:grid-cols-2" stagger={0.1}>
            {communities.map((item) => (
              <StaggerItem key={item.name}>
                <div className="sticker-card sticker-card-hover sticker-card-tilt flex h-full flex-col">
                  <div className="tape" />
                  <div className="mb-4 flex items-center gap-4">
                    <IconBox icon={item.icon} color={item.color} size="lg" />
                    <div>
                      <h3 className="font-display text-2xl font-bold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>

                  <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>

                  {item.link === '#' ? (
                    <Button
                      onClick={() => handleCopy(item.detail.replace(/.*：/, ''))}
                      className="btn-sticker h-12 w-full bg-foreground text-background"
                    >
                      {item.joinText}
                    </Button>
                  ) : (
                    <Button
                      asChild
                      className="btn-sticker h-12 w-full bg-foreground text-background"
                    >
                      <a href={item.link} target="_blank" rel="noopener noreferrer">
                        {item.joinText}
                      </a>
                    </Button>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="border-t-2 border-foreground bg-muted px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <AnimatedSection>
            <SectionHeader
              title="开源仓库"
              subtitle="CSL 的成长离不开开源社区，欢迎 Star、Fork 与贡献代码。"
            />
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <a
              href={githubRepo.link}
              target="_blank"
              rel="noopener noreferrer"
              className="sticker-card-interactive-full group mx-auto block max-w-3xl"
            >
              {/* 顶部：图标 + 仓库名 + Star 按钮 */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center border-2 border-foreground bg-card">
                    <Github className="sticker-card-icon h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-display text-2xl font-bold group-hover:text-accent">
                      {githubRepo.owner}/{githubRepo.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{githubRepo.desc}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="inline-flex items-center gap-1 border-2 border-foreground bg-secondary px-3 py-1.5 text-xs font-bold shadow-[var(--shadow-solid-sm)]">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    Star
                  </span>
                </div>
              </div>

              {/* 中部：统计指标条 */}
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y-2 border-foreground/20 py-3 text-sm">
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <span className={`h-3 w-3 rounded-full ${githubRepo.languageColor}`} />
                  {githubRepo.language}
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Star className="h-4 w-4" />
                  {githubRepo.stars}
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <GitFork className="h-4 w-4" />
                  {githubRepo.forks}
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  {githubRepo.watchers}
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Code2 className="h-4 w-4" />
                  {githubRepo.openIssues} issues
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  更新于 {githubRepo.updatedAt}
                </span>
              </div>

              {/* 底部：贡献者 + 操作按钮 */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold">
                    <Users className="h-4 w-4" />
                    贡献者
                  </span>
                  <div className="flex -space-x-2">
                    {githubRepo.contributors.map((c) => (
                      <div
                        key={c.name}
                        title={c.name}
                        className={`h-8 w-8 rounded-full border-2 border-background ${c.color} flex items-center justify-center text-xs font-bold text-background`}
                      >
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-bold text-muted-foreground">
                      +12
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 border-2 border-foreground bg-background px-3 py-1.5 text-xs font-bold shadow-[var(--shadow-solid-sm)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5">
                    <GitFork className="h-3.5 w-3.5" />
                    Fork
                  </span>
                  <span className="inline-flex items-center gap-1.5 border-2 border-foreground bg-background px-3 py-1.5 text-xs font-bold shadow-[var(--shadow-solid-sm)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5">
                    <Eye className="h-3.5 w-3.5" />
                    Watch
                  </span>
                </div>
              </div>
            </a>
          </AnimatedSection>
        </div>
      </section>
    </MainLayout>
  );
};

export default CommunityPage;
