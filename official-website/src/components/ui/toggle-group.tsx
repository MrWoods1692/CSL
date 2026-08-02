/**
 * ToggleGroup - 切换组组件
 *
 * 一组可切换按钮，支持单选（type="single"）和多选（type="multiple"）模式。
 * 基于 shadcn/ui (new-york 风格) + Radix UI ToggleGroup + toggleVariants 构建。
 *
 * @remarks
 * 导出两个子组件：
 * - ToggleGroup: 根容器，通过 Context 向下传递 variant 和 size
 * - ToggleGroupItem: 单个切换按钮，复用 toggleVariants 样式
 * 使用 React Context 避免每个 Item 都需要手动传 variant/size
 *
 * @example
 * // 单选模式
 * <ToggleGroup type="single">
 *   <ToggleGroupItem value="bold">粗体</ToggleGroupItem>
 *   <ToggleGroupItem value="italic">斜体</ToggleGroupItem>
 * </ToggleGroup>
 */

"use client"

import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

/**
 * ToggleGroupContext - 切换组上下文
 *
 * 在 ToggleGroup 内部传递 variant 和 size 给所有 ToggleGroupItem。
 */
const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
})

/**
 * ToggleGroup - 切换组根容器
 *
 * 通过 Context Provider 向下传递 variant 和 size。
 *
 * @param className - 额外的 CSS 类名
 * @param variant - 变体类型
 * @param size - 尺寸
 * @param children - 子元素（ToggleGroupItem）
 * @param props - 其他 Radix ToggleGroup 属性（如 type, defaultValue, value）
 * @param ref - 引用到 Radix ToggleGroup Root
 */
const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn("flex items-center justify-center gap-1", className)}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
))

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

/**
 * ToggleGroupItem - 切换组中的单个按钮
 *
 * 优先使用 Context 中的 variant/size，其次使用自身 props。
 *
 * @param className - 额外的 CSS 类名
 * @param children - 按钮内容
 * @param variant - 变体类型（优先使用 Context 中的值）
 * @param size - 尺寸（优先使用 Context 中的值）
 * @param props - 其他 Radix ToggleGroup Item 属性（如 value）
 * @param ref - 引用到 Radix ToggleGroup Item
 */
const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleVariants>
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
})

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }
