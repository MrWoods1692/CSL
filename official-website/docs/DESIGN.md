# 设计规范（Design Specification）

## 主题：潮流个性（Trendy Personality）

### 设计理念

以高对比配色与硬朗边缘为视觉基底，通过超大字号直陈价值主张（Value Proposition），将标准 UI 元素进行夸张风格化处理并叠加几何锐线符号。运用无模糊的实心阴影（Solid Shadow）营造强烈触觉深度，在非预期的散落、旋转与堆叠中形成一种玩味而失序的视觉秩序。

> **价值主张（Value Proposition）**：产品向用户承诺的核心利益，通常以醒目文案呈现。
>
> **实心阴影（Solid Shadow）**：无高斯模糊的纯色投影，区别于常见的柔和投影，呈现硬朗、扁平的视觉风格，是 Neo-Brutalism 设计风格的典型特征。
>
> **Neo-Brutalism（新粗野主义）**：一种强调粗粝、原始与功能性的设计风格，以粗黑描边、高对比配色、硬朗阴影为标志，近年在 Web 设计领域复兴。

---

## 色彩系统（Color System）

| 角色 | 色值 | 用途 |
|------|------|------|
| 主色（Primary） | `#7EFF73`（霓虹酸柠绿） | 核心高亮、主操作元素 |
| 辅助色（Secondary） | `#FF4B91`（千禧玫粉） | 撞色搭配、视觉对冲 |
| 强调色（Accent） | `#FFE135`（活力柠檬黄） | 点缀与提示信息 |

> **主色（Primary Color）**：品牌识别的核心色彩，用于最重要的交互元素与视觉焦点。
>
> **撞色（Color Blocking）**：将高饱和度、强对比的色彩并置搭配的手法，产生视觉冲击力，是本主题的核心配色策略。

---

## 字体系统（Typography）

| 用途 | 字体 | 来源 |
|------|------|------|
| 标题（Heading） | DouyinSansBold | [WOFF2 字体文件](https://resource-static.cdn.bcebos.com/fonts/DouyinSansBold.woff2) |
| 正文（Body） | 系统默认字体 | 系统字体栈 |

> **WOFF2（Web Open Font Format 2）**：专为 Web 优化的字体压缩格式，相比 TTF/OTF 体积更小、加载更快，是现代 Web 字体的首选格式。

---

## 动效系统（Motion System）

### 元素动效（Element Animation）

- 采用大胆的动效语言：卡片上浮、按钮色彩闪烁、悬停时图标旋转/滑入等
- 按钮点击时执行明显下压效果（`transform: translate`），提供触觉反馈
- 横向滚动的跑马灯（Marquee）文本横幅贯穿页面，增强动态感

> **跑马灯（Marquee）**：文本或元素沿水平方向持续滚动的动效，常用于公告、标语或装饰性文本展示。

### 入场动效（Entrance Animation）

- 元素从屏幕外滑入，并伴随弹性回弹（Elastic Bounce）效果

> **弹性回弹（Elastic Bounce）**：元素运动至目标位置后产生轻微过冲并回弹的动效，模拟物理弹性，增强自然感与趣味性。

### 动画实现方案

项目集成 `tailwindcss-intersect` 插件，可通过以下方式实现元素进入视口时的动画效果：

```html
<div class="opacity-0 intersect:opacity-100 transition duration-700">
  元素内容
</div>
```

同时可配合 `motion/react`（Framer Motion）实现复杂动画编排。

> **`tailwindcss-intersect`**：Tailwind CSS 插件，基于 Intersection Observer API 提供声明式的滚动触发动画能力，通过 `intersect:` 变体前缀使用。
>
> **Intersection Observer API**：浏览器原生 API，用于异步检测元素与视口的交叉状态，是实现滚动触发动画的底层基础。

---

## 布局规范（Layout）

- 强调视觉层级（Visual Hierarchy），标题采用超大字号建立视觉焦点
- 整体视觉如同由卡片或海报拼贴而成，大量使用粗黑描边（2px–4px）分隔区域
- 滚动方式：垂直滚动中混合水平滚动区域，制造节奏变化

> **视觉层级（Visual Hierarchy）**：通过字号、色彩、间距、对比度等手段引导用户视线优先级的设计原则，确保用户首先注意到最重要的信息。
>
> **拼贴美学（Collage Aesthetic）**：将不同形状、尺寸、角度的元素并置组合的视觉风格，营造手工感与随意感，呼应"玩味失序"的主题定位。

---

## 元素规范（Elements）

- 采用纯黑色、无模糊的投影，通常向右下偏移 4–8px
- UI 元素仿佛贴纸一般被"贴"在画板或墙面上，营造层叠与立体感

> **贴纸式布局（Sticker Layout）**：元素以明显偏移阴影"浮"在背景之上的视觉处理，模拟贴纸粘贴的物理质感，是本主题的核心视觉语言。