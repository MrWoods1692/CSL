/**
 * Toggle - 切换按钮组件
 *
 * 可切换状态的按钮，按下后保持激活状态（data-state="on"），再次点击取消。
 * 基于 shadcn/ui (new-york 风格) + Radix UI Toggle + class-variance-authority 构建。
 *
 * @remarks
 * 支持两种变体：default（透明背景）和 outline（带边框）
 * 支持三种尺寸：default(36px)、sm(32px)、lg(40px)
 * 激活状态：bg-accent + text-accent-foreground
 * 导出 toggleVariants 函数，可在 ToggleGroup 等组件中复用
 *
 * @example
 * // 基本用法
 * <Toggle>粗体</Toggle>
 * <Toggle variant="outline">斜体</Toggle>
 */

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * toggleVariants - 切换按钮样式变体
 *
 * 使用 CVA 定义切换按钮的样式变体系统。
 * 激活状态通过 data-state="on" 属性选择器控制。
 */
const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * Toggle - 切换按钮渲染组件
 *
 * @param className - 额外的 CSS 类名
 * @param variant - 变体类型："default" | "outline"
 * @param size - 尺寸："default" | "sm" | "lg"
 * @param props - 其他 Radix Toggle 属性（如 pressed, defaultPressed, onPressedChange）
 * @param ref - 引用到 Radix Toggle Root
 */
const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
