/**
 * SVG 模块类型声明
 * 
 * 为 vite-plugin-svgr 插件提供 TypeScript 类型支持。
 * 允许通过以下方式导入 SVG 文件：
 * - import { ReactComponent } from './icon.svg?react'  // 作为 React 组件
 * - import src from './icon.svg?react'                   // 作为 URL 字符串
 */

// 声明 *.svg?react 模块的类型
declare module "*.svg?react" {
  import React = require("react");
  // ReactComponent：SVG 作为 React 组件的命名导出
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  // 默认导出：SVG 文件的 URL 字符串
  const src: string;
  export default src;
}
