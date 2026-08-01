import React from 'react';
import { Github, MessageCircle, Send, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layouts/MainLayout';
import PageMeta from '@/components/common/PageMeta';
import SectionHeader from '@/components/common/SectionHeader';
import AnimatedSection from '@/components/common/AnimatedSection';
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
                    <div
                      className={`flex h-14 w-14 items-center justify-center border-2 border-foreground ${item.color} shadow-[var(--shadow-solid-sm)]`}
                    >
                      <item.icon className="sticker-card-icon h-7 w-7" />
                    </div>
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
                      className="h-12 w-full border-2 border-foreground bg-foreground font-bold text-background shadow-[var(--shadow-solid-sm)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[var(--shadow-solid)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                      {item.joinText}
                    </Button>
                  ) : (
                    <Button
                      asChild
                      className="h-12 w-full border-2 border-foreground bg-foreground font-bold text-background shadow-[var(--shadow-solid-sm)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[var(--shadow-solid)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
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
              className="sticker-card sticker-card-hover sticker-card-interactive sticker-card-tilt group mx-auto block max-w-2xl"
            >
              <div className="flex items-center gap-5">
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
            </a>
          </AnimatedSection>
        </div>
      </section>
    </MainLayout>
  );
};

export default CommunityPage;
