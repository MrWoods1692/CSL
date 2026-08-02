/**
 * 用户协议与免责声明页面
 *
 * 包含 12 个章节的完整用户协议：
 * 协议接受、软件使用、账户与身份验证、开源与第三方内容、
 * 下载更新与文件来源、隐私与本地数据、知识产权与用户内容、
 * 免责声明、备份与安全责任、服务变更与终止、未成年人使用、反馈联系与争议。
 *
 * 左侧固定目录导航，右侧文章内容区。
 */

import React from 'react';
import { AlertTriangle, FileText, ShieldCheck } from 'lucide-react';
import MainLayout from '@/components/layouts/MainLayout';
import PageMeta from '@/components/common/PageMeta';
import SectionHeader from '@/components/common/SectionHeader';
import AnimatedSection from '@/components/common/AnimatedSection';
import DecorativeShape from '@/components/common/DecorativeShape';

/** 协议章节数据结构 */
interface PolicySection { id: string; title: string; content: string[]; }

const sections: PolicySection[] = [
  { id: 'acceptance', title: '一、协议接受', content: [
    '欢迎使用 CSL 启动器及本网站。本协议适用于 CSL 启动器客户端、官方网站、文档、下载服务、社区入口以及由 CSL 项目维护者提供的其他相关服务。',
    '下载、安装、访问、复制或使用上述服务，即表示你已阅读、理解并同意遵守本协议及页面中引用的其他规则。如果你不同意任何条款，请立即停止使用并删除相关软件及文件。',
    '我们可能根据产品变化、法律法规或运营需要修订本协议。修订内容发布后生效；继续使用服务即表示接受修订后的协议。对于重大变更，我们会在页面上进行提示。',
  ] },
  { id: 'usage', title: '二、软件使用', content: [
    'CSL 启动器是面向 Minecraft Java 版玩家的开源辅助工具，用于管理游戏版本、Java 运行环境、资源、模组及启动配置。启动器本身不提供盗版游戏、破解账号或绕过正版验证的服务。',
    '你应使用合法取得的游戏账号、游戏文件和第三方内容，并遵守适用法律法规、游戏发行商的最终用户许可协议、服务器规则以及所使用资源的授权协议。',
    '你不得利用本软件从事违法活动、侵犯他人知识产权或隐私、传播恶意软件、绕过安全措施、干扰服务器运行、批量请求第三方接口，或以其他方式损害他人合法权益。',
    '你不得对软件进行反向工程、反编译、拆解或制作恶意修改版本，但适用法律明确允许或相关开源许可证明确授权的情形除外。',
  ] },
  { id: 'account', title: '三、账户与身份验证', content: [
    '启动器可能需要调用 Microsoft、Mojang 或其他第三方提供的登录和身份验证服务。登录行为在相应第三方页面或客户端中完成，CSL 不要求你向项目维护者提供密码。',
    '你应确保登录信息和访问凭据来源合法，并对在本地设备上保存的令牌、配置文件和账户状态负责。发现账户异常、令牌泄露或设备被他人使用时，应立即通过相应服务提供方采取保护措施。',
    'CSL 不会出售、出租或转让你的账户，也不保证第三方登录服务始终可用。账户封禁、验证失败、地区限制及第三方政策变化应由相应服务提供方解释和处理。',
  ] },
  { id: 'open-source', title: '四、开源与第三方内容', content: [
    'CSL 启动器的源代码及部分组件按照各自适用的开源许可证发布。具体权利、义务、署名要求和使用限制以对应项目目录中的 LICENSE、NOTICE 或许可证文本为准；不同组件的许可证可能不同。',
    '启动器可能连接第三方服务、下载游戏文件或展示第三方内容。第三方内容不由 CSL 开发者拥有或控制，其可用性、准确性、完整性、适配性和合法性由相应提供方负责。',
    '你安装或使用模组、资源包、着色器、启动参数、第三方 Java 或其他扩展时，应自行确认来源、完整性、安全性与授权范围。CSL 不为第三方内容背书，也不保证其不会导致冲突、崩溃或数据损失。',
    'Minecraft、相关游戏名称、标识及素材属于其权利人所有。本项目与 Mojang Studios、Microsoft 或其他相关权利人无隶属、授权或官方合作关系，除非另有明确说明。',
  ] },
  { id: 'download', title: '五、下载、更新与文件来源', content: [
    '启动器可能从官方服务、项目发布页、镜像站或其他第三方地址获取程序、游戏元数据、依赖库和资源文件。下载地址、版本号和校验信息可能因平台及网络环境不同而变化。',
    '使用前请确认下载来源、文件名、文件大小和校验值；不要运行来源不明或被安全软件标记为异常的文件。对于第三方镜像，请以镜像维护者公布的信息为准。',
    '自动更新可能改变程序文件、配置格式或运行行为。更新前建议备份重要配置、实例目录和存档；更新失败时，不要直接删除唯一的数据副本。',
    '由于网络中断、服务器维护、版本下架、地区限制或上游服务变化，部分文件可能暂时无法下载。此类情况不代表你的设备或账户必然存在问题。',
  ] },
  { id: 'privacy', title: '六、隐私与本地数据', content: [
    'CSL 遵循尽量减少数据收集的原则。启动器运行所需的配置、日志、缓存、实例信息和登录状态通常保存在你的本地设备上，具体位置可能因操作系统和配置而不同。',
    '当你主动访问 GitHub、登录第三方账户、下载游戏文件或使用社区服务时，相关请求可能会携带 IP 地址、设备信息、请求日志或第三方服务所需的数据。该等数据由相应服务提供方按照其隐私政策处理。',
    '请不要在 Issue、日志、截图或社区消息中公开密码、访问令牌、完整账户信息、个人身份信息、支付信息或其他敏感数据。提交日志前应先进行必要的脱敏。',
    '如果你发现本项目可能存在隐私或安全问题，请通过项目仓库的安全反馈渠道报告，避免在公开讨论中披露可被利用的细节。',
  ] },
  { id: 'intellectual-property', title: '七、知识产权与用户内容', content: [
    '除开源许可证另有规定外，CSL 项目代码、网站设计、文字、图形、标识和其他项目内容的权利归相应权利人所有。未经许可，不得将项目名称、标识或页面内容用于误导性宣传或暗示官方背书。',
    '你提交 Issue、Pull Request、翻译、文档、截图或其他反馈时，应确保拥有相应权利，且内容不侵犯他人权利、不包含秘密信息或恶意代码。',
    '提交内容的版权归属和授权范围以贡献指南、项目许可证及平台规则为准。维护者可能为修复问题、维护项目、发布文档或改进产品而引用、修改或整合相关内容。',
  ] },
  { id: 'disclaimer', title: '八、免责声明', content: [
    'CSL 启动器及本网站按“现状”和“可用”基础提供，不对软件持续可用、完全无错误、绝对安全、适用于特定目的、兼容所有设备或满足你的特定需求作出明示或默示保证。',
    '因操作系统、Java 环境、显卡驱动、网络状况、第三方服务、游戏更新、模组、资源包、启动参数、用户自行修改或设备故障导致的启动失败、数据丢失、存档损坏、账号限制或其他损失，使用者应自行承担相应风险。',
    '网站中的教程、版本信息、硬件建议、链接、示例配置和社区内容仅供参考，可能存在滞后、错误或不适用于特定环境的情况。执行任何命令、删除文件或修改配置前，请确认其影响并做好备份。',
    '在法律允许的最大范围内，CSL 开发者及贡献者不对因使用或无法使用本软件、网站或相关资源而产生的间接损失、偶然损失、特殊损失、数据损失、利润损失或后果性损失承担责任。',
  ] },
  { id: 'backup', title: '九、备份与安全责任', content: [
    '使用启动器前，请备份世界存档、截图、模组、资源包、配置、账户恢复信息和其他重要文件。建议将备份保存到与游戏目录不同的位置，并定期验证备份是否可以恢复。',
    '测试开发版本、实验性功能、第三方模组和自定义启动参数可能增加不稳定风险。发生异常时，请先停止重复启动，保留日志和现场信息，再尝试恢复备份或排查问题。',
    'CSL 不负责恢复因用户未备份、误删、磁盘故障、恶意软件、同步冲突或第三方程序造成的数据。你应使用可信来源的软件，并保持操作系统、Java 和安全软件处于合理的更新状态。',
  ] },
  { id: 'availability', title: '十、服务变更与终止', content: [
    '维护者可以根据开发计划、上游服务变化、安全风险或资源情况，对软件功能、网站页面、下载地址、接口、社区入口和文档进行增加、调整、暂停或终止。',
    '出现严重安全问题、法律要求、上游服务停止或不可抗力时，相关功能可能在未能提前通知的情况下暂停。维护者不保证历史版本、旧接口或旧下载地址永久可用。',
    '你可以随时停止使用并删除 CSL 启动器。停止使用前应自行导出或备份需要保留的数据。协议中关于知识产权、免责声明、责任限制和争议处理的条款在终止后仍可能继续适用。',
  ] },
  { id: 'minors', title: '十一、未成年人使用', content: [
    '未成年人使用本软件或访问相关服务，应在监护人知情并同意的情况下进行。监护人应帮助其理解账户安全、隐私保护、第三方服务条款和数据备份的重要性。',
    '如适用法律对未成年人信息处理、网络游戏或在线服务另有要求，应优先遵守相关强制性规定。',
  ] },
  { id: 'feedback', title: '十二、反馈、联系与争议', content: [
    '你可以通过项目仓库提交问题、建议、代码贡献或安全反馈。提交内容时请提供可复现步骤、系统版本、Java 版本和经过脱敏的日志，但不要公开密码、访问令牌、个人身份信息或其他敏感数据。',
    '对于安全漏洞，请优先使用项目提供的私下反馈方式，而不是在公开 Issue 中披露完整利用细节。维护者会在合理范围内评估、修复并发布相关信息。',
    '如对本协议、软件行为或第三方内容有疑问，请先通过项目仓库与维护者沟通。任何争议应在适用法律允许的范围内，通过友好协商或其他合法方式解决；如本协议部分内容被认定无效，其余内容仍然有效。',
  ] },
];

const PolicyPage: React.FC = () => {
  const handleSectionNavigation = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
  <MainLayout>
    <PageMeta title="用户协议与免责声明 - CSL 启动器" description="CSL 启动器用户协议、隐私说明、开源说明、第三方内容说明与免责声明。" />
    <section className="relative overflow-hidden bg-background px-4 py-20 md:py-28">
      <DecorativeShape className="absolute right-8 top-16 h-24 w-24 border-accent bg-secondary opacity-25 md:h-32 md:w-32" startRotation={15} slow />
      <DecorativeShape className="absolute bottom-12 left-8 h-20 w-20 border-primary bg-accent opacity-25 md:h-28 md:w-28" startRotation={-25} />
      <div className="relative mx-auto max-w-6xl"><AnimatedSection><SectionHeader title="用户协议与免责声明" subtitle="使用 CSL 启动器前，请认真阅读以下详细条款。" /></AnimatedSection><AnimatedSection delay={0.1}><div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2"><div className="sticker-card flex gap-4 bg-primary"><ShieldCheck className="h-8 w-8 shrink-0" /><div><h2 className="font-display text-lg font-bold">开源与透明</h2><p className="mt-1 text-sm leading-relaxed">以项目许可证和第三方服务条款为准。</p></div></div><div className="sticker-card flex gap-4 bg-secondary"><AlertTriangle className="h-8 w-8 shrink-0" /><div><h2 className="font-display text-lg font-bold">请先备份数据</h2><p className="mt-1 text-sm leading-relaxed">使用模组、测试版本或修改配置前，请备份存档。</p></div></div></div></AnimatedSection></div>
    </section>
    <section className="border-t-2 border-foreground bg-muted px-4 py-16 md:py-24"><div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[220px_1fr]"><aside className="lg:sticky lg:top-24 lg:self-start"><div className="mb-4 flex items-center gap-2 font-display font-bold"><FileText className="h-5 w-5" />本页目录</div><nav className="border-l-2 border-foreground">{sections.map((section) => <a key={section.id} href={`#${section.id}`} onClick={(event) => handleSectionNavigation(event, section.id)} className="block border-l-4 border-transparent px-4 py-2 text-sm font-bold transition-colors hover:border-accent hover:text-accent">{section.title}</a>)}</nav></aside><article className="sticker-card space-y-10 bg-card"><p className="border-b-2 border-foreground/15 pb-6 text-sm leading-relaxed text-muted-foreground">最后更新：2026 年 8 月 2 日。本文为项目使用说明，不构成法律意见；如适用法律对相关事项另有强制性规定，以适用法律为准。</p>{sections.map((section) => <section key={section.id} id={section.id} className="scroll-mt-24"><h2 className="mb-3 font-display text-xl font-bold">{section.title}</h2><div className="space-y-3 text-sm leading-7 text-muted-foreground">{section.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section>)}</article></div></section>
  </MainLayout>
  );
};

export default PolicyPage;
