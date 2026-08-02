/**
 * Tooltip - 工具提示组件
 *
 * 鼠标悬停或键盘聚焦时显示的浮动提示信息，支持自定义位置和延迟。
 * 基于 shadcn/ui (new-york 风格) + Radix UI Tooltip 原语构建。
 *
 * @remarks
 * 导出四个子组件：
 * - TooltipProvider: 全局提供者，配置延迟时间等全局设置
 * - Tooltip: 根容器，管理提示的显示/隐藏状态
 * - TooltipTrigger: 触发器，包裹需要提示的元素
 * - TooltipContent: 提示内容，通过 Portal 渲染到 body，支持四个方向的滑入动画
 * 默认 sideOffset=4（距离触发器 4px）
 *
 * @example
 * // 基本用法
 * <TooltipProvider>
 *   <Tooltip>
 *     <TooltipTrigger>悬停我</TooltipTrigger>
 *     <TooltipContent>这是提示信息</TooltipContent>
 *   </Tooltip>
 * </TooltipProvider>
 */

"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

/** TooltipProvider - 全局提供者，配置 delayDuration 等全局设置 */
const TooltipProvider = TooltipPrimitive.Provider

/** Tooltip - 根容器，管理单个提示的显示/隐藏 */
const Tooltip = TooltipPrimitive.Root

/** TooltipTrigger - 触发器，包裹需要提示的子元素 */
const TooltipTrigger = TooltipPrimitive.Trigger

/**
 * TooltipContent - 提示内容
 *
 * 通过 Portal 渲染到 body，避免 z-index 问题。
 * 支持四个方向的滑入动画（bottom/top/left/right）。
 *
 * @param className - 额外的 CSS 类名
 * @param sideOffset - 距离触发器的偏移量，默认 4px
 * @param props - 其他 Radix Tooltip Content 属性
 * @param ref - 引用到 Radix Tooltip Content
 */
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]",
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
