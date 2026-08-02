/**
 * Tailwind CSS 配置文件
 * 
 * Tailwind CSS 是一个原子化 CSS 框架，通过扫描源码中的类名来生成对应的 CSS。
 * 
 * 本项目的设计风格为「潮流个性」Neo-Brutalism（新粗野主义）：
 * - 高对比度配色
 * - 硬边框 + 实色阴影
 * - 贴纸风格的卡片布局
 * - 大胆的动画效果
 * 
 * 配色系统使用 CSS 变量（定义在 src/index.css 中），支持亮色/暗色模式切换。
 */

// Tailwind CSS 动画插件 - 提供 accordion-down/up 等预设动画
import tailwindAnimate from 'tailwindcss-animate';
// 容器查询插件 - 基于父容器宽度而非视口宽度的响应式设计
import containerQuery from '@tailwindcss/container-queries';
// 交叉观察器插件 - 元素进入视口时添加类名，用于滚动触发动画
import intersect from 'tailwindcss-intersect';

export default {
    // 暗色模式策略：通过 class 切换（在 html 元素上添加 'dark' 类）
    darkMode: ['class'],
    
    // 内容扫描路径：Tailwind 会扫描这些文件中的类名，只生成使用到的 CSS
    content: [
        './index.html',
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
        // streamdown 组件也需要扫描
        './node_modules/streamdown/dist/**/*.js'
    ],
    
    // 安全列表：强制保留这些类名（即使扫描不到），防止被 PurgeCSS 移除
    safelist: ['border', 'border-border'],
    
    // 类名前缀（空字符串表示无前缀）
    prefix: '',
    
    theme: {
        // 容器配置：居中显示，默认内边距 2rem
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'  // 2xl 断点最大宽度 1400px
            }
        },
        extend: {
            // 颜色系统：使用 CSS 变量（HSL 格式），支持亮色/暗色模式
            colors: {
                // 边框颜色
                border: 'hsl(var(--border))',
                borderColor: {
                    border: 'hsl(var(--border))'
                },
                // 输入框边框颜色
                input: 'hsl(var(--input))',
                // 聚焦环颜色
                ring: 'hsl(var(--ring))',
                // 背景色
                background: 'hsl(var(--background))',
                // 前景色（文字颜色）
                foreground: 'hsl(var(--foreground))',
                // 主色调（CSL 品牌色 - 霓虹绿）
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                // 次要色（千禧粉）
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                // 破坏性操作色（红色系）
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                // 柔和色
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                // 强调色（柠檬黄）
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                // 弹出层颜色
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                // 卡片颜色
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                // 教育/文档相关颜色
                education: {
                    blue: 'hsl(var(--education-blue))',
                    green: 'hsl(var(--education-green))'
                },
                // 语义化颜色
                success: 'hsl(var(--success))',   // 成功 - 绿色
                warning: 'hsl(var(--warning))',   // 警告 - 橙色
                info: 'hsl(var(--info))',         // 信息 - 蓝色
                // 侧边栏颜色
                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar-background))',
                    background: 'hsl(var(--sidebar-background))',
                    foreground: 'hsl(var(--sidebar-foreground))',
                    primary: 'hsl(var(--sidebar-primary))',
                    'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
                    accent: 'hsl(var(--sidebar-accent))',
                    'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                    border: 'hsl(var(--sidebar-border))',
                    ring: 'hsl(var(--sidebar-ring))'
                },
                // 图表颜色（用于 recharts）
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))'
                }
            },
            // 圆角配置
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            // 渐变背景
            backgroundImage: {
                'gradient-primary': 'var(--gradient-primary)',
                'gradient-card': 'var(--gradient-card)',
                'gradient-background': 'var(--gradient-background)'
            },
            // 阴影配置
            boxShadow: {
                card: 'var(--shadow-card)',
                hover: 'var(--shadow-hover)'
            },
            // 关键帧动画定义
            keyframes: {
                // 手风琴展开动画：从高度 0 到内容高度
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                // 手风琴收起动画：从内容高度到 0
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                // 淡入动画：从透明 + 下移 10px 到完全显示
                'fade-in': {
                    from: {
                        opacity: '0',
                        transform: 'translateY(10px)'
                    },
                    to: {
                        opacity: '1',
                        transform: 'translateY(0)'
                    }
                },
                // 滑入动画：从透明 + 左移 20px 到完全显示
                'slide-in': {
                    from: {
                        opacity: '0',
                        transform: 'translateX(-20px)'
                    },
                    to: {
                        opacity: '1',
                        transform: 'translateX(0)'
                    }
                }
            },
            // 动画配置（引用上面定义的关键帧）
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in': 'fade-in 0.5s ease-out',
                'slide-in': 'slide-in 0.5s ease-out'
            }
        }
    },
    // 插件列表
    plugins: [
        // 动画插件
        tailwindAnimate,
        // 容器查询插件
        containerQuery,
        // 交叉观察器插件（滚动触发动画）
        intersect,
        // 自定义工具类：边框样式（solid/dashed/dotted）
        function ({addUtilities}) {
            addUtilities(
                {
                    // 实线边框（各方向独立控制）
                    '.border-t-solid': {'border-top-style': 'solid'},
                    '.border-r-solid': {'border-right-style': 'solid'},
                    '.border-b-solid': {'border-bottom-style': 'solid'},
                    '.border-l-solid': {'border-left-style': 'solid'},
                    // 虚线边框
                    '.border-t-dashed': {'border-top-style': 'dashed'},
                    '.border-r-dashed': {'border-right-style': 'dashed'},
                    '.border-b-dashed': {'border-bottom-style': 'dashed'},
                    '.border-l-dashed': {'border-left-style': 'dashed'},
                    // 点线边框
                    '.border-t-dotted': {'border-top-style': 'dotted'},
                    '.border-r-dotted': {'border-right-style': 'dotted'},
                    '.border-b-dotted': {'border-bottom-style': 'dotted'},
                    '.border-l-dotted': {'border-left-style': 'dotted'},
                },
                ['responsive']  // 支持响应式变体（如 md:border-t-dashed）
            );
        },
    ],
};
