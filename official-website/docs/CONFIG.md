# 配置文件说明（Configuration Reference）

> 由于 JSON 格式不支持注释，本文档集中说明 `official-website/` 目录下所有 JSON 配置文件的作用与关键字段。

---

## package.json

项目元数据与依赖管理文件。

| 字段 | 说明 |
|------|------|
| `name` | 项目名称：`csl-official-website` |
| `version` | 当前版本：`0.1.0` |
| `type` | 模块系统：`module`（ESM） |
| `scripts.dev` | 启动 Vite 开发服务器 |
| `scripts.build` | 先 TypeScript 类型检查，再 Vite 生产构建 |
| `scripts.preview` | 预览生产构建结果 |
| `scripts.lint` | 运行 TS 类型检查 + Biome Lint + Tailwind CSS 校验 |

### 核心依赖

| 类别 | 依赖 | 用途 |
|------|------|------|
| UI 框架 | react, react-dom | React 18 核心 |
| 路由 | react-router-dom | HashRouter 客户端路由 |
| 动画 | motion | Framer Motion 继任者，声明式动画 |
| SEO | react-helmet-async | 动态设置页面 meta 标签 |
| 后端 | @supabase/supabase-js | Supabase 客户端 SDK |
| 组件库 | @radix-ui/react-* | 无样式无障碍 UI 原语（30+ 组件） |
| 表单 | react-hook-form, @hookform/resolvers, zod | 表单状态管理 + 校验 |
| 工具 | clsx, class-variance-authority, tailwind-merge | 类名合并与变体管理 |
| 轮播 | embla-carousel-react | 轻量轮播组件 |
| 监控 | @sentry/react | 前端错误监控 |
| HTTP | axios | HTTP 请求客户端 |
| 日期 | date-fns | 日期格式化工具 |
| 图标 | lucide-react | 开源 SVG 图标库 |
| 命令面板 | cmdk | ⌘K 命令面板 |
| 拖拽 | react-dropzone | 文件拖拽上传 |
| 图表 | recharts | 声明式图表库 |
| 主题 | next-themes | 深色/浅色主题切换 |
| Markdown | react-markdown, rehype-*, remark-* | Markdown 渲染与语法高亮 |
| 导出 | jszip, file-saver | 源码导出打包与下载 |

### 开发依赖

| 依赖 | 用途 |
|------|------|
| typescript | TypeScript 编译器 |
| vite | 构建工具 |
| @vitejs/plugin-react | Vite React 插件 |
| tailwindcss | 原子化 CSS 框架 |
| @tailwindcss/typography | Tailwind 排版插件 |
| tailwindcss-animate | Tailwind 动画插件 |
| tailwindcss-intersect | Tailwind Intersection Observer 插件 |
| @biomejs/biome | 代码格式化与 Lint |
| @types/react, @types/react-dom | React 类型定义 |

---

## biome.json

Biome 代码质量工具配置。

| 字段 | 说明 |
|------|------|
| `vcs.enabled` | 启用 VCS（Git）集成 |
| `vcs.useIgnoreFile` | 使用 `.gitignore` 排除文件 |
| `files.includes` | 检查范围：`src/**` 下的 JS/TS/CSS 文件 + `tailwind.config.js` |
| `linter.rules.correctness.noUndeclaredDependencies` | 禁止使用未声明的依赖 |
| `linter.rules.correctness.useHookAtTopLevel` | 强制 Hook 在顶层调用 |
| `linter.rules.suspicious.noRedeclare` | 禁止重复声明变量 |
| `linter.rules.style.noCommonJs` | 禁止 CommonJS 语法（强制 ESM） |
| `formatter.enabled` | 格式化功能关闭（使用 Prettier 或其他工具） |

---

## components.json

shadcn/ui 组件库配置文件。

| 字段 | 说明 |
|------|------|
| `$schema` | shadcn/ui schema 引用 |
| `style` | 组件风格：`"new-york"`（现代简约风格） |
| `rsc` | React Server Components：`false`（客户端渲染） |
| `tsx` | 使用 TSX 语法：`true` |
| `tailwind.config` | Tailwind 配置文件路径 |
| `tailwind.css` | 全局 CSS 文件路径 |
| `tailwind.baseColor` | 基础色：`"slate"` |
| `tailwind.cssVariables` | 使用 CSS 变量管理主题色 |
| `iconLibrary` | 图标库：`"lucide"` |
| `aliases.components` | 组件路径别名：`@/components` |
| `aliases.utils` | 工具函数别名：`@/lib/utils` |
| `aliases.ui` | UI 组件别名：`@/components/ui` |
| `aliases.lib` | 库别名：`@/lib` |
| `aliases.hooks` | Hooks 别名：`@/hooks` |

---

## tsconfig.json

TypeScript 根配置文件（项目引用模式）。

| 字段 | 说明 |
|------|------|
| `compilerOptions.target` | 编译目标：`ES2020` |
| `compilerOptions.module` | 模块系统：`ESNext` |
| `compilerOptions.skipLibCheck` | 跳过 `.d.ts` 类型检查（加速编译） |
| `compilerOptions.baseUrl` | 路径解析基目录：`.` |
| `compilerOptions.paths` | 路径别名：`@/*` → `./src/*` |
| `files` | 空数组（由子配置管理文件范围） |
| `references` | 引用子配置：`tsconfig.app.json`（前端）、`tsconfig.node.json`（Node 端） |

---

## tsconfig.app.json

前端 TypeScript 配置（React 应用）。

| 字段 | 说明 |
|------|------|
| `compilerOptions.jsx` | JSX 转换模式：`"react-jsx"`（自动导入 React） |
| `compilerOptions.moduleResolution` | 模块解析策略：`"bundler"`（适配 Vite） |
| `compilerOptions.allowImportingTsExtensions` | 允许导入 `.ts`/`.tsx` 扩展名 |
| `compilerOptions.isolatedModules` | 隔离模块模式（Vite/esbuild 要求） |
| `compilerOptions.noEmit` | 不生成输出文件（仅类型检查） |
| `compilerOptions.strict` | 启用所有严格类型检查 |
| `compilerOptions.strictNullChecks` | 严格空值检查 |
| `compilerOptions.paths` | 路径别名：`@/*` → `./src/*` |
| `include` | 包含 `src/` 下所有 `.ts`/`.tsx` 文件 |

---

## tsconfig.node.json

Node 端 TypeScript 配置（Vite 配置文件）。

| 字段 | 说明 |
|------|------|
| `compilerOptions.target` | 编译目标：`ES2022`（Node 18+） |
| `compilerOptions.lib` | 类型库：`ES2023` |
| `compilerOptions.noUnusedLocals` | 禁止未使用的局部变量 |
| `compilerOptions.noUnusedParameters` | 禁止未使用的参数 |
| `include` | 仅包含 `vite.config.ts` |

---

## vite.config.ts

Vite 构建工具配置。

| 配置项 | 说明 |
|--------|------|
| `plugins` | 启用 `@vitejs/plugin-react` |
| `resolve.alias` | 路径别名：`@` → `./src` |
| `base` | 基础路径：`"./"`（相对路径，适配静态部署） |
| `build.outDir` | 输出目录：`dist` |
| `build.assetsDir` | 静态资源目录：`assets` |
| `build.sourcemap` | 生产环境禁用 sourcemap |
| `server.host` | 开发服务器监听：`127.0.0.1` |
| `server.port` | 开发服务器端口：`3000` |

---

## tailwind.config.js

Tailwind CSS 配置。

| 配置项 | 说明 |
|--------|------|
| `darkMode` | 深色模式策略：`"class"`（通过 CSS 类切换） |
| `content` | 扫描 `src/` 下所有 TSX/TS 文件中的类名 |
| `theme.extend.colors` | 扩展颜色：使用 CSS 变量（`hsl(var(--xxx))`） |
| `theme.extend.fontFamily` | 扩展字体：`sans` 系统字体栈 |
| `theme.extend.borderRadius` | 扩展圆角：`lg`/`md`/`sm` 使用 CSS 变量 |
| `plugins` | 插件：`tailwindcss-animate`、`@tailwindcss/typography`、`tailwindcss-intersect` |

---

## postcss.config.js

PostCSS 配置。

| 配置项 | 说明 |
|--------|------|
| `plugins.tailwindcss` | Tailwind CSS 插件 |
| `plugins.autoprefixer` | 自动添加浏览器前缀 |