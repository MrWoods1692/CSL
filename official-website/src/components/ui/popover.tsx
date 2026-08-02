/**
 * Popover - 弹出框组件
 *
 * 点击触发后弹出的浮动内容面板，适用于展示额外信息或操作菜单。
 * 与 Tooltip（悬停触发）不同，Popover 通过点击触发，可包含交互元素。
 * 基于 shadcn/ui (new-york 风格) + Radix UI Popover 原语构建。
 *
 * @remarks
 * 导出四个子组件：
 * - Popover: 根容器
 * - PopoverTrigger: 触发器，点击打开弹出框
 * - PopoverAnchor: 锚点，用于自定义弹出位置
 * - PopoverContent: 弹出内容，通过 Portal 渲染，支持四个方向的滑入动画
 * 默认 align="center"（居中对齐触发器），sideOffset=4（距离 4px）
 *
 * @example
 * // 基本用法
 * <Popover>
 *   <PopoverTrigger>打开</PopoverTrigger>
 *   <PopoverContent>弹出内容</PopoverContent>
 * </Popover>
 */

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

/** Popover - 弹出框根容器 */
const Popover = PopoverPrimitive.Root

/** PopoverTrigger - 弹出框触发器 */
const PopoverTrigger = PopoverPrimitive.Trigger

/** PopoverAnchor - 弹出框锚点 */
const PopoverAnchor = PopoverPrimitive.Anchor

/**
 * PopoverContent - 弹出框内容
 *
 * 通过 Portal 渲染，支持四个方向的滑入动画。
 *
 * @param className - 额外的 CSS 类名
 * @param align - 对齐方式，默认 "center"
 * @param sideOffset - 距离触发器的偏移量，默认 4px
 * @param props - 其他 Radix Popover Content 属性
 * @param ref - 引用到 Radix Popover Content
 */
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-popover-content-transform-origin]",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
