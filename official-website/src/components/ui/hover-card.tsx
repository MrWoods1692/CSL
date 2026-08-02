/**
 * HoverCard - 悬停卡片组件
 *
 * 鼠标悬停时弹出的信息卡片，用于展示预览内容（如用户资料预览、链接预览）。
 * 与 Tooltip 不同，HoverCard 可包含富文本和交互元素。
 * 基于 shadcn/ui (new-york 风格) + Radix UI HoverCard 原语构建。
 *
 * @remarks
 * 导出三个子组件：
 * - HoverCard: 根容器，通过 openDelay/closeDelay 控制延迟
 * - HoverCardTrigger: 触发器，包裹需要悬停的元素
 * - HoverCardContent: 悬停卡片内容，支持四个方向的滑入动画
 * 默认 align=center，sideOffset=4
 *
 * @example
 * // 基本用法
 * <HoverCard>
 *   <HoverCardTrigger>悬停我</HoverCardTrigger>
 *   <HoverCardContent>预览内容</HoverCardContent>
 * </HoverCard>
 */

import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

import { cn } from "@/lib/utils"

/** HoverCard - 悬停卡片根容器 */
const HoverCard = HoverCardPrimitive.Root

/** HoverCardTrigger - 悬停卡片触发器 */
const HoverCardTrigger = HoverCardPrimitive.Trigger

/**
 * HoverCardContent - 悬停卡片内容
 *
 * @param className - 额外的 CSS 类名
 * @param align - 对齐方式，默认 "center"
 * @param sideOffset - 距离触发器的偏移量，默认 4px
 * @param props - 其他 Radix HoverCard Content 属性
 * @param ref - 引用到 Radix HoverCard Content
 */
const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-hover-card-content-transform-origin]",
      className
    )}
    {...props}
  />
))
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

export { HoverCard, HoverCardTrigger, HoverCardContent }
