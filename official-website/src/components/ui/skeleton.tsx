/**
 * Skeleton - 骨架屏组件
 *
 * 内容加载时的占位动画组件，用于提升感知性能和减少布局偏移（CLS）。
 * 基于 shadcn/ui (new-york 风格) 构建。
 *
 * @remarks
 * 使用 animate-pulse 动画产生呼吸效果，背景色为 primary/10（主色的 10% 透明度）
 * 适用于：列表加载、卡片加载、文本加载等场景
 *
 * @example
 * // 基本用法
 * <Skeleton className="h-4 w-[250px]" />
 * <Skeleton className="h-4 w-[200px]" />
 * // 圆形骨架
 * <Skeleton className="h-12 w-12 rounded-full" />
 */

import { cn } from "@/lib/utils"

/**
 * Skeleton - 骨架屏渲染组件
 *
 * @param className - 额外的 CSS 类名，用于控制尺寸和形状
 * @param props - 其他 HTML div 属性
 * @returns 渲染的骨架屏元素
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  )
}

export { Skeleton }
