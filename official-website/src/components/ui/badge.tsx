/**
 * Badge - 徽章
 *
 * 用于标记和分类的小型标签，支持多种变体（默认、次要、破坏性、轮廓）。
 * 基于 shadcn/ui (new-york 风格) + class-variance-authority 构建。
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Badge - 徽章组件
 *
 * 用于标记和分类的小型标签组件，常用于状态标识、计数显示、分类标签等场景。
 * 基于 shadcn/ui (new-york 风格) + class-variance-authority (CVA) 构建。
 *
 * @remarks
 * 支持四种变体：default（默认/主要）、secondary（次要）、destructive（破坏性/危险）、outline（轮廓）
 * 导出 badgeVariants 函数，可在其他组件中复用徽章样式
 *
 * @example
 * // 基本用法
 * <Badge>新功能</Badge>
 * <Badge variant="secondary">进行中</Badge>
 * <Badge variant="destructive">已删除</Badge>
 * <Badge variant="outline">草稿</Badge>
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * badgeVariants - 徽章样式变体配置
 *
 * 使用 CVA (class-variance-authority) 定义徽章的样式变体系统。
 * 基础样式：inline-flex 布局、圆角边框、内边距、小号字体、半粗体、过渡动画、聚焦环
 *
 * @param variant - 变体类型
 *   - default: 主色背景 + 主色前景文字 + 阴影
 *   - secondary: 次要色背景 + 次要色前景文字
 *   - destructive: 破坏性色背景 + 破坏性色前景文字 + 阴影
 *   - outline: 仅边框 + 前景色文字
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * BadgeProps - 徽章组件属性
 *
 * 继承 HTMLDivElement 所有属性，并扩展 CVA 变体属性。
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge - 徽章渲染组件
 *
 * 渲染一个带有样式变体的内联 div 元素。
 *
 * @param className - 额外的 CSS 类名，通过 cn() 合并
 * @param variant - 徽章变体类型，默认为 "default"
 * @param props - 其他 HTML div 属性
 * @returns 渲染的徽章元素
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
