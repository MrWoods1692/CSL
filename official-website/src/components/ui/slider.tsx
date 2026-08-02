/**
 * Slider - 滑块组件
 *
 * 可拖拽的数值范围选择器，支持单值、多值和范围选择。
 * 基于 shadcn/ui (new-york 风格) + Radix UI Slider 原语构建。
 *
 * @remarks
 * 由三个子元素组成：
 * - Track: 轨道，主色 20% 透明度背景
 * - Range: 已选范围，主色实色填充
 * - Thumb: 拖拽滑块，圆形带边框和阴影
 * 支持键盘导航和触屏拖拽（touch-none）
 *
 * @example
 * // 单值滑块
 * <Slider defaultValue={[50]} max={100} step={1} />
 * // 范围滑块
 * <Slider defaultValue={[25, 75]} min={0} max={100} step={1} />
 */

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

/**
 * Slider - 滑块渲染组件
 *
 * @param className - 额外的 CSS 类名
 * @param props - 其他 Radix Slider 属性（如 value, defaultValue, min, max, step, onValueChange）
 * @param ref - 引用到 Radix Slider Root
 */
const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
