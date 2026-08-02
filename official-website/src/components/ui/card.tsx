/**
 * Card - 卡片组件
 *
 * 内容容器组件，提供结构化的卡片布局，包含标题、描述、内容和底部操作区。
 * 基于 shadcn/ui (new-york 风格) 构建。
 *
 * @remarks
 * 导出六个子组件：
 * - Card: 根容器，圆角边框 + 阴影
 * - CardHeader: 头部区域，flex 列布局，p-6 内边距
 * - CardTitle: 标题，半粗体
 * - CardDescription: 描述文字，小号 + muted 颜色
 * - CardContent: 内容区域，p-6 内边距（顶部为 0，由 Header 提供间距）
 * - CardFooter: 底部操作区，flex 行布局
 *
 * @example
 * // 基本用法
 * <Card>
 *   <CardHeader>
 *     <CardTitle>卡片标题</CardTitle>
 *     <CardDescription>卡片描述</CardDescription>
 *   </CardHeader>
 *   <CardContent>主要内容</CardContent>
 *   <CardFooter>操作按钮</CardFooter>
 * </Card>
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Card - 卡片根容器
 *
 * @param className - 额外的 CSS 类名
 * @param props - 其他 HTML div 属性
 * @param ref - 引用到 div 元素
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

/**
 * CardHeader - 卡片头部
 *
 * @param className - 额外的 CSS 类名
 * @param props - 其他 HTML div 属性
 * @param ref - 引用到 div 元素
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * CardTitle - 卡片标题
 *
 * @param className - 额外的 CSS 类名
 * @param props - 其他 HTML div 属性
 * @param ref - 引用到 div 元素
 */
const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

/**
 * CardDescription - 卡片描述
 *
 * @param className - 额外的 CSS 类名
 * @param props - 其他 HTML div 属性
 * @param ref - 引用到 div 元素
 */
const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * CardContent - 卡片内容
 *
 * @param className - 额外的 CSS 类名
 * @param props - 其他 HTML div 属性
 * @param ref - 引用到 div 元素
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * CardFooter - 卡片底部
 *
 * @param className - 额外的 CSS 类名
 * @param props - 其他 HTML div 属性
 * @param ref - 引用到 div 元素
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
