/**
 * Switch - 开关组件
 *
 * 布尔值切换组件，用于开启/关闭状态的可视化切换，比 Checkbox 更适合即时生效的设置。
 * 基于 shadcn/ui (new-york 风格) + Radix UI Switch 原语构建。
 *
 * @remarks
 * 由两个子元素组成：
 * - Root: 开关轨道，checked 状态为主色，unchecked 为输入色
 * - Thumb: 开关滑块，checked 时向右平移 16px
 * 支持键盘聚焦环（focus-visible:ring）
 *
 * @example
 * // 受控模式
 * <Switch checked={enabled} onCheckedChange={setEnabled} />
 * // 带标签
 * <Label htmlFor="airplane-mode">飞行模式</Label>
 * <Switch id="airplane-mode" />
 */

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

/**
 * Switch - 开关渲染组件
 *
 * @param className - 额外的 CSS 类名
 * @param props - 其他 Radix Switch 属性（如 checked, onCheckedChange）
 * @param ref - 引用到 Radix Switch Root
 */
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
