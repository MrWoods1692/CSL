/**
 * Alert - 警告提示组件
 *
 * 用于向用户显示重要的提示信息，支持多种变体和图标。
 * 基于 shadcn/ui (new-york 风格) + class-variance-authority 构建。
 *
 * @remarks
 * 导出三个子组件：
 * - Alert: 根容器，role="alert" 确保屏幕阅读器自动朗读
 * - AlertTitle: 标题，使用 h5 标签
 * - AlertDescription: 描述内容，支持段落文本
 * 支持两种变体：default（默认）和 destructive（破坏性/错误）
 * 图标通过 CSS 绝对定位在左侧
 *
 * @example
 * // 基本用法
 * <Alert>
 *   <AlertCircle className="h-4 w-4" />
 *   <AlertTitle>注意</AlertTitle>
 *   <AlertDescription>这是一条重要提示信息。</AlertDescription>
 * </Alert>
 * // 错误提示
 * <Alert variant="destructive">
 *   <AlertCircle className="h-4 w-4" />
 *   <AlertTitle>错误</AlertTitle>
 *   <AlertDescription>操作失败，请重试。</AlertDescription>
 * </Alert>
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * alertVariants - 警告提示样式变体
 *
 * 基础样式：相对定位、圆角边框、内边距、图标绝对定位
 * 变体：default（默认背景）、destructive（红色边框+文字）
 */
const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * Alert - 警告提示根容器
 *
 * @param className - 额外的 CSS 类名
 * @param variant - 变体："default" | "destructive"
 * @param props - 其他 HTML div 属性
 * @param ref - 引用到 div 元素
 */
const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

/**
 * AlertTitle - 警告提示标题
 *
 * @param className - 额外的 CSS 类名
 * @param props - 其他 HTML h5 属性
 * @param ref - 引用到 h5 元素
 */
const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

/**
 * AlertDescription - 警告提示描述
 *
 * @param className - 额外的 CSS 类名
 * @param props - 其他 HTML 段落属性
 * @param ref - 引用到 div 元素
 */
const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
