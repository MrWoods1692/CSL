/**
 * Progress - 进度条组件
 *
 * 展示任务完成进度的视觉指示器。当 value 为 undefined 时进入不确定进度模式。
 * 基于 shadcn/ui (new-york 风格) + Radix UI Progress 原语构建。
 *
 * @remarks
 * 使用 CSS transform: translateX() 实现进度动画
 * 外层轨道：主色 20% 透明度背景
 * 内层指示器：主色实色填充
 *
 * @example
 * // 确定进度
 * <Progress value={60} />
 * // 不确定进度（加载中）
 * <Progress />
 */

"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

/**
 * Progress - 进度条渲染组件
 *
 * @param className - 额外的 CSS 类名
 * @param value - 当前进度值（0-100），不传则为不确定模式
 * @param props - 其他 Radix Progress 属性
 * @param ref - 引用到 Radix Progress Root
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
