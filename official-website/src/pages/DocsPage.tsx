/**
 * 开发文档页面
 *
 * 页面结构：
 * 1. 搜索栏：按标题/描述过滤文档
 * 2. 文档卡片网格：快速开始、项目结构、贡献指南、架构设计
 * 3. 开发工作流：4 步流程（准备环境→运行项目→验证改动→提交贡献）
 * 4. 目录导航：锚点链接到各详细章节
 * 5. 详细章节：快速开始、构建运行测试、模块架构、调试配置、本地化、贡献指南
 *
 * 每个详细章节包含：编号徽章、标题、介绍、要点列表、代码块。
 */

import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Code,
  GitPullRequest,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import RippleButton from '@/components/common/RippleButton';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layouts/MainLayout';
import PageMeta from '@/components/common/PageMeta';
import SectionHeader from '@/components/common/SectionHeader';
import AnimatedSection from '@/components/common/AnimatedSection';
import IconBox from '@/components/common/IconBox';
import { StaggerContainer, StaggerItem } from '@/components/common/StaggerContainer';
import DecorativeShape from '@/components/common/DecorativeShape';
import RippleCard from '@/components/common/RippleCard';

/** 文档卡片数据 */
interface DocItem {
  title: string;
  category: string;
  desc: string;
  icon: React.ElementType;
  link: string;
  meta: string;
}

const docs: DocItem[] = [
  {
    title: '快速开始',
    category: '入门',
    desc: '从环境准备、源码获取到首次运行，快速开始 CSL 本地开发。',
    icon: BookOpen,
    link: '#quick-start',
    meta: 'JDK 17+ · Gradle',
  },
  {
    title: '项目结构',
    category: '参考',
    desc: '了解 CSL、CSLCore、CSLBoot 与游戏侧库之间的职责边界。',
    icon: Code,
    link: '#architecture',
    meta: '多模块 · JavaFX',
  },
  {
    title: '贡献指南',
    category: '社区',
    desc: '提交 Issue、编写代码、补充文档或参与本地化之前，请先阅读规范。',
    icon: GitPullRequest,
    link: '#contributing',
    meta: 'Issue · Pull Request',
  },
  {
    title: '架构设计',
    category: '进阶',
    desc: '深入理解启动流程、版本隔离、认证、主题和游戏侧引导组件。',
    icon: BookOpen,
    link: '#architecture',
    meta: '启动流程 · 模块边界',
  },
];

/** 开发工作流步骤 */
const workflow = [
  ['01', '准备环境', '安装 JDK 17 或更高版本，并确认 JAVA_HOME 指向正确的 JDK。'],
  ['02', '运行项目', '在 minecraft-launcher 目录执行 ./gradlew :CSL:run，启动桌面客户端。'],
  ['03', '验证改动', '提交前运行 ./gradlew test，并检查 Checkstyle 与多语言资源。'],
  ['04', '提交贡献', '创建清晰的 Issue 或 Pull Request，描述动机、改动和验证结果。'],
];

/** 目录导航 */
const toc = [
  ['quick-start', '快速开始'],
  ['architecture', '模块架构'],
  ['debugging', '调试与配置'],
  ['localization', '本地化开发'],
  ['contributing', '提交贡献'],
];

/** 详细章节数据 */
const detailedSections = [
  {
    id: 'quick-start', badge: '01 / 入门', title: '快速开始',
    intro: 'CSL 是基于 JavaFX 的跨平台 Minecraft Java 版启动器。开发主工程位于仓库的 minecraft-launcher 目录，构建系统使用 Gradle Kotlin DSL。',
    points: [['环境要求', 'JDK 17 或更高版本（推荐 LTS）、Git，以及项目自带的 Gradle Wrapper。'], ['获取源码', 'git clone https://github.com/MrWoods1692/CSL.git，然后进入 CSL/minecraft-launcher。'], ['首次运行', '执行 ./gradlew :CSL:run。Windows 用户使用 gradlew.bat :CSL:run。']],
    code: 'git clone https://github.com/MrWoods1692/CSL.git\ncd CSL/minecraft-launcher\n./gradlew :CSL:run',
  },
  {
    id: 'commands', badge: '02 / 工具', title: '构建、运行与测试',
    intro: '所有构建和测试任务都在 minecraft-launcher 目录执行。首次构建会自动下载 JavaFX、Maven 依赖和 Minecraft 元数据。',
    points: [['开发运行', './gradlew :CSL:run —— 启动桌面客户端，适合日常开发调试。'], ['测试', './gradlew test —— 运行所有单元测试和模块测试。'], ['发布构建', './gradlew clean makeExecutables —— 构建可分发的启动器程序。'], ['质量检查', './gradlew check —— 执行代码质量和项目检查任务。']],
    code: './gradlew test\n./gradlew check\n# 构建产物：CSL/build/libs/',
  },
  {
    id: 'architecture', badge: '03 / 设计', title: '模块架构',
    intro: '修改功能前先判断代码所属的职责层，避免把 UI、业务和通用工具耦合在一起。源码、构建配置、测试和生成产物各自有明确位置。',
    points: [['CSL/', '启动器主模块。包含 JavaFX 页面、控制器、账户认证、版本安装、Mod 管理、主题、设置和游戏启动流程。'], ['CSL/src/main/', '主模块生产代码与资源。Java 代码按功能分包，resources 放图标、主题、字体、语言文件和默认配置。'], ['CSL/src/test/', '主模块测试代码。用于验证启动流程、文件处理、UI 相关业务和回归问题。'], ['CSLCore/', '无界面核心库。提供 JSON、HTTP、压缩、NBT、文件系统、平台检测、语言处理等可复用能力。'], ['CSLCore/src/main/', '核心 Java 实现和共享资源。优先将与 UI 无关的通用逻辑放在此处，避免主模块重复实现。'], ['CSLBoot/', '启动引导模块。负责定位 Java、准备启动参数并拉起 CSL 主程序，保证不同运行环境下能够启动。'], ['minecraft/libraries/', '游戏侧辅助库。CSLMultiMCBootstrap 负责游戏侧引导，CSLTransformerDiscoveryService 负责 Transformer 发现。'], ['buildSrc/', 'Gradle 构建插件源码。包含打包、JavaFX、CI、文档更新、本地化检查和发行版任务。'], ['config/', '仓库级配置。project.properties 管理版本配置，checkstyle/ 管理 Java 代码检查规则，jenkins/ 放 CI 配置。'], ['gradle/', 'Gradle Wrapper 和版本目录。libs.versions.toml 统一管理依赖版本，避免各模块重复声明。'], ['docs/', '项目文档和多语言文档，包括贡献指南、平台支持、本地化和发布计划。'], ['build/ 与各模块 build/', 'Gradle 生成的缓存、编译结果、测试报告和中间产物，不应手工编辑或提交。'], ['lib/', '本地或第三方运行时依赖。构建脚本通过 flatDir 仓库读取其中的库文件。']],
    code: 'minecraft-launcher/\n├── build.gradle.kts       # 根构建逻辑和公共任务\n├── settings.gradle.kts    # 声明模块和工程入口\n├── gradlew                 # Unix 构建入口\n├── gradlew.bat             # Windows 构建入口\n├── buildSrc/               # 自定义 Gradle 插件\n├── config/                 # 版本、Checkstyle、CI 配置\n├── gradle/                 # Wrapper 与依赖版本目录\n├── CSL/                    # 启动器 UI 与业务\n│   ├── src/main/           # 生产代码和资源\n│   └── src/test/           # 测试代码\n├── CSLCore/                # 通用核心能力\n├── CSLBoot/                # 启动引导器\n├── minecraft/libraries/    # 游戏侧辅助组件\n├── docs/                   # 项目文档\n├── lib/                    # 本地依赖\n└── */build/                # 自动生成的编译产物',
  },
  {
    id: 'debugging', badge: '04 / 调试', title: '调试与运行配置',
    intro: '内部参数可能随版本变化。使用覆盖参数前，请确认问题确实需要改变默认行为，并在 Issue 或 Pull Request 中说明原因。',
    points: [['CSL_LANGUAGE', '设置启动器默认语言，例如 zh 或 en。'], ['CSL_UI_SCALE', '覆盖 UI 缩放，可使用 1.5、150% 或 144dpi。'], ['CSL_FORCE_GPU', '设为 true，强制启用 GPU 加速渲染。'], ['-Dcsl.dir=<path>', '指定当前实例数据目录，默认是工作目录下的 .csl。']],
    code: 'CSL_LANGUAGE=zh CSL_UI_SCALE=1.25 ./gradlew :CSL:run\n./gradlew :CSL:run --args="-Dcsl.dir=/tmp/csl-dev"',
  },
  {
    id: 'localization', badge: '05 / 多语言', title: '本地化开发',
    intro: '界面文本主要位于 CSL/src/main/resources/assets/lang/I18N.properties。新增翻译时请保留键名、占位符和转义格式。',
    points: [['默认资源', 'I18N.properties 是英文基础资源，必须保持完整。'], ['简体中文', '使用 I18N_zh.properties，语言键为 zh。'], ['繁体中文', '使用 I18N_zh_Hant.properties，语言键为 zh-Hant。'], ['提交要求', '界面或文档变更应同步更新所有主要语言资源。']],
    code: 'CSL_LANGUAGE=zh ./gradlew :CSL:run\n# 未翻译条目会按照语言回退机制使用默认文本',
  },
  {
    id: 'contributing', badge: '06 / 社区', title: '提交贡献',
    intro: 'CSL 欢迎代码、文档、测试、翻译和问题反馈。请让每个 Pull Request 都能被快速理解和验证。',
    points: [['1. 讨论', '先搜索现有 Issue；重大功能建议先发起讨论。'], ['2. 开发', 'Fork 仓库并创建独立分支，保持提交聚焦。'], ['3. 验证', '补充必要的测试、文档和本地化资源，运行 test 与 check。'], ['4. 提交', '描述动机、主要改动、验证命令和已知限制。']],
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
        description="查阅 CSL 启动器的开发文档、项目结构、构建运行与贡献指南。"
      />

      <section id="docs-top" className="relative scroll-mt-20 overflow-hidden bg-background px-4 py-20 md:py-28">
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
              subtitle="为开发者准备的完整参考资料，从入门到项目贡献。"
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
                  href={doc.link}
                  tilt={false}
                  className="group block h-full"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <IconBox icon={doc.icon} color="bg-secondary" iconClassName="text-secondary-foreground" />
                    <Badge className="border-2 border-foreground bg-primary text-xs font-bold text-primary-foreground">
                      {doc.category}
                    </Badge>
                  </div>
                  <h3 className="mb-2 flex items-center gap-2 font-display text-xl font-bold group-hover:text-accent">
                    {doc.title}
                    <ExternalLink className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{doc.desc}</p>
                  <p className="mt-5 border-t-2 border-foreground/15 pt-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {doc.meta}
                  </p>
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

      <section className="border-t-2 border-foreground bg-muted px-4 py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">本页目录</p>
            <nav className="border-l-2 border-foreground">
              {toc.map(([id, label]) => <a key={id} href={`#${id}`} className="block border-l-4 border-transparent px-4 py-2 text-sm font-bold transition-colors hover:border-accent hover:text-accent">{label}</a>)}
            </nav>
            <div className="mt-8 border-2 border-foreground bg-primary p-4 shadow-[var(--shadow-solid-sm)]">
              <p className="text-sm font-bold">遇到问题？</p>
              <p className="mt-2 text-xs leading-relaxed">请附上系统、JDK 版本、复现步骤和完整日志。</p>
              <a href="https://github.com/MrWoods1692/CSL/issues/new" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-bold underline">创建 Issue →</a>
            </div>
          </aside>
          <div className="min-w-0 space-y-8">
            {detailedSections.map((section) => (
              <article id={section.id} key={section.id} className="scroll-mt-24 border-2 border-foreground bg-background p-6 shadow-[var(--shadow-solid)] md:p-8">
                <Badge className="border-2 border-foreground bg-accent text-xs font-bold text-accent-foreground">{section.badge}</Badge>
                <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">{section.title}</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{section.intro}</p>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {section.points.map(([title, text]) => <div key={title} className="border-2 border-foreground bg-muted p-4"><p className="font-display font-bold text-accent">{title}</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p></div>)}
                </div>
                {section.code && <pre className="mt-6 overflow-x-auto border-2 border-foreground bg-foreground p-5 font-mono text-sm leading-7 text-background"><code>{section.code}</code></pre>}
                {section.id === 'architecture' && <div className="mt-6 border-l-4 border-primary bg-secondary p-4 text-sm leading-relaxed"><strong>如何选择目录：</strong>界面和启动器业务放入 <code className="font-mono">CSL</code>；与界面无关、可复用的能力放入 <code className="font-mono">CSLCore</code>；启动前的 Java 环境处理放入 <code className="font-mono">CSLBoot</code>；构建流程或检查规则放入 <code className="font-mono">buildSrc</code>；测试与生产代码保持对应的包结构。</div>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t-2 border-foreground bg-secondary px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <AnimatedSection>
            <SectionHeader
              title="四步进入开发"
              subtitle="从第一次构建到提交贡献，每一步都有明确的验证目标。"
            />
          </AnimatedSection>
          <StaggerContainer className="grid gap-5 md:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
            {workflow.map(([number, title, description]) => (
              <StaggerItem key={number}>
                <div className="h-full border-2 border-foreground bg-background p-5 shadow-[var(--shadow-solid-sm)]">
                  <span className="font-display text-4xl font-bold text-accent">{number}</span>
                  <h3 className="mt-4 font-display text-xl font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
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
              className="btn-sticker btn-sticker-lg mr-3 h-14 bg-background px-8 text-lg text-foreground"
            >
              <a href="#docs-top" onClick={(event) => { event.preventDefault(); document.getElementById('docs-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                <ArrowLeft className="mr-2 h-5 w-5" />
                返回文档顶部
              </a>
            </RippleButton>
            <RippleButton
              asChild
              className="btn-sticker btn-sticker-lg h-14 bg-secondary px-8 text-lg text-secondary-foreground"
            >
              <a
                href="https://github.com/MrWoods1692/CSL/blob/main/minecraft-launcher/docs/Contributing.md"
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
