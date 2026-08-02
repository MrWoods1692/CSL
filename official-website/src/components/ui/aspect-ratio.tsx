/**
 * AspectRatio - 宽高比容器组件
 *
 * 保持子元素固定宽高比的容器组件，常用于图片、视频、嵌入内容等媒体元素。
 * 基于 shadcn/ui (new-york 风格) + Radix UI AspectRatio 原语构建。
 *
 * @remarks
 * 这是最简单的 shadcn/ui 组件之一，直接导出 Radix UI AspectRatio 原语
 * 通过 ratio 属性控制宽高比（如 16/9、4/3、1/1）
 *
 * @example
 * // 16:9 视频容器
 * <AspectRatio ratio={16 / 9}>
 *   <img src="thumbnail.jpg" alt="缩略图" />
 * </AspectRatio>
 */

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"

const AspectRatio = AspectRatioPrimitive.Root

export { AspectRatio }
