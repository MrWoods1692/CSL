/**
 * PostCSS 配置文件
 * 
 * PostCSS 是一个用 JavaScript 插件转换 CSS 的工具。
 * 在本项目中，PostCSS 用于：
 * 1. Tailwind CSS - 处理 @tailwind 指令，生成原子化 CSS 类
 * 2. Autoprefixer - 自动添加浏览器厂商前缀（-webkit-, -moz- 等）
 */
export default {
  plugins: {
    // Tailwind CSS 插件：扫描源码中的类名，生成对应的 CSS 规则
    tailwindcss: {},
    // Autoprefixer 插件：根据 browserslist 配置自动添加浏览器前缀
    autoprefixer: {},
  },
};
