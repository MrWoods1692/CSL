/**
 * Checkbox - 复选框组件
 *
 * 允许用户从多个选项中选择一个或多个项目，支持受控和非受控模式。
 * 基于 shadcn/ui (new-york 风格) + Radix UI Checkbox 原语构建。
 *
 * @remarks
 * 选中时显示 Lucide Check 图标，使用 CSS Grid 居中图标
 * 支持 checked、unchecked 和 indeterminate（半选）三种状态
 * 使用 peer 机制可与 Label 联动
 *
 * @example
 * // 基本用法
 * <Checkbox />
 * // 带标签
 * <Checkbox id="terms" />
 * <Label htmlFor="terms">同意服务条款</Label>
 */

"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Checkbox - 复选框渲染组件
 *
 * @param className - 额外的 CSS 类名
 * @param props - 其他 Radix Checkbox 属性（如 checked, onCheckedChange, defaultChecked）
 * @param ref - 引用到 Radix Checkbox Root
 */
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("grid place-content-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
