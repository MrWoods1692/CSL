/**
 * Separator - 分隔线组件
 *
 * 用于在视觉上分隔内容的水平或垂直线条。
 * 基于 shadcn/ui (new-york 风格) + Radix UI Separator 原语构建。
 *
 * @remarks
 * 支持两种方向：
 * - horizontal: 水平线，宽度 100%，高度 1px
 * - vertical: 垂直线，高度 100%，宽度 1px
 * 默认 decorative=true，表示纯装饰性分隔线（非语义化）
 *
 * @example
 * // 水平分隔线
 * <Separator />
 * // 垂直分隔线
 * <Separator orientation="vertical" />
 */

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

/**
 * Separator - 分隔线渲染组件
 *
 * @param className - 额外的 CSS 类名
 * @param orientation - 方向，"horizontal"（默认）或 "vertical"
 * @param decorative - 是否为纯装饰性分隔线，默认 true
 * @param props - 其他 Radix Separator 属性
 * @param ref - 引用到 Radix Separator Root
 */
const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
