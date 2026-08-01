import React, { useState } from 'react';
import { Search, Play, Settings, Box, HelpCircle, Wrench } from 'lucide-react';
import { motion } from 'motion/react';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import MainLayout from '@/components/layouts/MainLayout';
import PageMeta from '@/components/common/PageMeta';
import SectionHeader from '@/components/common/SectionHeader';
import AnimatedSection from '@/components/common/AnimatedSection';
import IconBox from '@/components/common/IconBox';
import { StaggerContainer, StaggerItem } from '@/components/common/StaggerContainer';
import DecorativeShape from '@/components/common/DecorativeShape';

const quickStart = [
  {
    icon: Play,
    title: '启动游戏',
    desc: '选择已安装的游戏版本，点击「启动」按钮，CSL 会自动完成 Java 检测与资源补全。',
  },
  {
    icon: Box,
    title: '安装版本',
    desc: '进入「版本列表」，点击「安装新版本」，选择官方版或带有模组加载器的版本。',
  },
  {
    icon: Settings,
    title: '配置内存',
    desc: '在「设置」中调整最大内存，建议根据电脑总内存分配 2–4 GB。',
  },
  {
    icon: Wrench,
    title: '安装模组',
    desc: '选中某个版本，点击「模组管理」，搜索并安装来自 CurseForge 或 Modrinth 的模组。',
  },
];

const faq = [
  {
    question: 'CSL 启动器支持哪些 Minecraft 版本？',
    answer:
      '支持从 1.0 到最新快照版的绝大多数官方版本，同时支持 Forge、Fabric、Quilt 等模组加载器版本。',
  },
  {
    question: '启动时提示「找不到 Java」怎么办？',
    answer:
      'CSL 通常会自动下载并配置 Java。若失败，请前往设置手动指定 Java 路径，或访问 Oracle / Adoptium 下载对应版本。',
  },
  {
    question: '如何导入已有的游戏存档？',
    answer:
      '打开 CSL 的 .minecraft 目录，将你的 saves 文件夹复制到对应版本的 saves 目录下即可。',
  },
  {
    question: '游戏崩溃如何排查？',
    answer:
      '在启动器日志页面查看错误信息，常见原因包括模组冲突、内存不足或 Java 版本不兼容。也可将日志发送到社区求助。',
  },
  {
    question: 'CSL 是否完全免费？',
    answer:
      '是的，CSL 启动器完全免费且开源，不存在任何付费功能或内购项目。',
  },
  {
    question: '如何参与开发或提交反馈？',
    answer:
      '欢迎访问 GitHub 仓库提交 Issue 或 Pull Request，也可以加入 Telegram、Discord、QQ 或微信群参与讨论。',
  },
];

const GuidePage: React.FC = () => {
  const [query, setQuery] = useState('');
  const filteredFaq = faq.filter(
    (item) =>
      item.question.toLowerCase().includes(query.toLowerCase()) ||
      item.answer.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <MainLayout>
      <PageMeta
        title="使用指南 - CSL 启动器"
        description="快速上手 CSL 启动器，查看常见问题解答与使用技巧。"
      />

      <section className="relative overflow-hidden bg-background px-4 py-20 md:py-28">
        <DecorativeShape
          className="absolute -right-2 top-28 h-20 w-20 border-accent bg-secondary opacity-25 md:h-28 md:w-28"
          startRotation={25}
        />
        <DecorativeShape
          className="absolute bottom-16 left-4 h-16 w-16 border-primary bg-accent opacity-25 md:h-24 md:w-24"
          startRotation={-10}
          slow
        />
        <div className="relative mx-auto max-w-5xl">
          <AnimatedSection>
            <SectionHeader
              title="快速上手"
              subtitle="四个步骤，从安装到进入游戏。"
            />
          </AnimatedSection>

          <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
            {quickStart.map((item, index) => (
              <StaggerItem key={item.title}>
                <div className="sticker-card sticker-card-hover sticker-card-interactive h-full">
                  <div className="mb-3 flex items-center gap-3">
                    <IconBox icon={item.icon} color="bg-primary" size="sm" />
                    <span className="font-display text-2xl font-bold text-muted-foreground">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mb-2 font-display text-lg font-bold">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="border-t-2 border-foreground bg-muted px-4 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <AnimatedSection>
            <SectionHeader
              title="常见问题"
              subtitle="搜索你遇到的问题，或直接查看下方 FAQ。"
            />
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <div className="relative mb-8">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="搜索问题或关键词..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 border-2 border-foreground bg-background pl-10 text-base shadow-[var(--shadow-solid-sm)] focus-visible:ring-accent"
              />
            </div>
          </AnimatedSection>

          {filteredFaq.length === 0 ? (
            <AnimatedSection>
              <div className="sticker-card text-center">
                <HelpCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="font-bold">未找到相关问题</p>
                <p className="text-sm text-muted-foreground">尝试更换关键词，或前往社区提问。</p>
              </div>
            </AnimatedSection>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFaq.map((item, index) => (
                <AnimatedSection key={index} delay={index * 0.06} direction="up">
                  <AccordionItem
                    value={`item-${index}`}
                    className="sticker-card sticker-card-hover sticker-card-interactive border-2 border-foreground px-6 data-[state=open]:border-accent"
                  >
                    <AccordionTrigger className="py-4 text-left font-display text-lg font-bold hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                </AnimatedSection>
              ))}
            </Accordion>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default GuidePage;
