/**
 * RadioGroup - 单选组组件
 *
 * 互斥的单选按钮组，用户只能从多个选项中选择一个。
 * 基于 shadcn/ui (new-york 风格) + Radix UI RadioGroup 原语构建。
 *
 * @remarks
 * 导出两个子组件：
 * - RadioGroup: 根容器，grid 布局，通过 defaultValue/value 控制选中项
 * - RadioGroupItem: 单个单选按钮，圆形边框，选中时内部填充实心圆（Circle 图标）
 *
 * @example
 * // 基本用法
 * <RadioGroup defaultValue="option-one">
 *   <div className="flex items-center space-x-2">
 *     <RadioGroupItem value="option-one" id="option-one" />
 *     <Label htmlFor="option-one">选项一</Label>
 *   </div>
 * </RadioGroup>
 */

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * RadioGroup - 单选组根容器
 *
 * @param className - 额外的 CSS 类名
 * @param props - 其他 Radix RadioGroup 属性（如 defaultValue, value, onValueChange）
 * @param ref - 引用到 Radix RadioGroup Root
 */
const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

/**
 * RadioGroupItem - 单个单选按钮
 *
 * 圆形边框，选中时内部显示填充的 Circle 图标。
 *
 * @param className - 额外的 CSS 类名
 * @param props - 其他 Radix RadioGroup Item 属性（如 value）
 * @param ref - 引用到 Radix RadioGroup Item
 */
const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-3.5 w-3.5 fill-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
