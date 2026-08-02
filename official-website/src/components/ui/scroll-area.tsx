/**
 * ScrollArea - 滚动区域组件
 *
 * 自定义滚动条容器，提供统一的跨平台滚动体验和样式。
 * 基于 shadcn/ui (new-york 风格) + Radix UI ScrollArea 原语构建。
 *
 * @remarks
 * 导出两个组件：
 * - ScrollArea: 滚动容器，包含 Viewport 和 ScrollBar
 * - ScrollBar: 自定义滚动条，支持水平和垂直方向
 * 滚动条在非悬停/非滚动时自动隐藏
 *
 * @example
 * // 基本用法
 * <ScrollArea className="h-[200px]">
 *   <div>很长的内容...</div>
 * </ScrollArea>
 */

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

/**
 * ScrollArea - 滚动区域容器
 *
 * @param className - 额外的 CSS 类名
 * @param children - 滚动区域的内容
 * @param props - 其他 Radix ScrollArea Root 属性
 * @param ref - 引用到 Radix ScrollArea Root
 */
const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

/**
 * ScrollBar - 自定义滚动条
 *
 * @param className - 额外的 CSS 类名
 * @param orientation - 方向，"vertical"（默认）或 "horizontal"
 * @param props - 其他 Radix Scrollbar 属性
 * @param ref - 引用到 Radix Scrollbar
 */
const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
