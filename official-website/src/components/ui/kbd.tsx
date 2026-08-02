/**
 * Kbd - 键盘快捷键组件
 *
 * 用于展示键盘快捷键或按键组合的视觉元素，模拟物理键盘按键的外观。
 * 基于 shadcn/ui (new-york 风格) 构建。
 *
 * @remarks
 * 导出两个组件：
 * - Kbd: 单个按键显示，如 ⌘、Ctrl、K
 * - KbdGroup: 按键组合容器，将多个 Kbd 水平排列
 * 在 Tooltip 内部使用时自动适配深色/浅色背景
 *
 * @example
 * // 基本用法
 * <Kbd>⌘</Kbd>
 * <KbdGroup>
 *   <Kbd>⌘</Kbd>
 *   <Kbd>K</Kbd>
 * </KbdGroup>
 */

import { cn } from "@/lib/utils"

/**
 * Kbd - 单个键盘按键
 *
 * 渲染一个模拟键盘按键外观的 kbd 元素。
 *
 * @param className - 额外的 CSS 类名
 * @param props - 其他 HTML kbd 元素属性
 * @returns 渲染的键盘按键元素
 */
function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "bg-muted text-muted-foreground pointer-events-none inline-flex h-5 w-fit min-w-5 select-none items-center justify-center gap-1 rounded-sm px-1 font-sans text-xs font-medium",
        "[&_svg:not([class*='size-'])]:size-3",
        "[[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-background dark:[[data-slot=tooltip-content]_&]:bg-background/10",
        className
      )}
      {...props}
    />
  )
}

/**
 * KbdGroup - 键盘按键组合
 *
 * 将多个 Kbd 按键水平排列在一起，用于展示组合快捷键。
 *
 * @param className - 额外的 CSS 类名
 * @param props - 其他 HTML div 元素属性
 * @returns 渲染的按键组合容器
 */
function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  )
}

export { Kbd, KbdGroup }
