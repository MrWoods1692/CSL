/**
 * Label - 表单标签组件
 *
 * 与 Radix UI Label 原语集成，提供无障碍的表单标签-控件关联。
 * 当关联的控件处于 disabled 状态时，标签自动变灰并禁用点击。
 * 基于 shadcn/ui (new-york 风格) + Radix UI Label + class-variance-authority 构建。
 *
 * @remarks
 * 使用 peer-disabled 机制：当兄弟元素（如 Input）被禁用时，Label 自动降低不透明度
 * 通过 htmlFor 属性与表单控件的 id 关联，提升无障碍访问性
 *
 * @example
 * // 基本用法
 * <Label htmlFor="email">邮箱地址</Label>
 * <Input id="email" type="email" />
 */

"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * labelVariants - 标签样式变体
 *
 * 定义标签的基础样式：中等字重、标准行高、禁用状态下的样式处理。
 */
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

/**
 * Label - 标签渲染组件
 *
 * 使用 forwardRef 转发引用到 Radix Label 根元素。
 *
 * @param className - 额外的 CSS 类名
 * @param props - 其他 Radix Label 属性（如 htmlFor）
 * @param ref - 转发到 Radix Label Root 的引用
 * @returns 渲染的标签元素
 */
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
