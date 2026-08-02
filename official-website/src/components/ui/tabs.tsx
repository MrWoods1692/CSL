/**
 * Tabs - 标签页组件
 *
 * 多面板切换组件，通过标签页切换显示不同内容区域，适用于在同一层级切换不同视图。
 * 基于 shadcn/ui (new-york 风格) + Radix UI Tabs 原语构建。
 *
 * @remarks
 * 导出四个子组件：
 * - Tabs: 根容器，通过 defaultValue/value 控制激活标签
 * - TabsList: 标签列表容器，bg-muted 背景，圆角
 * - TabsTrigger: 单个标签，激活时 bg-background + shadow
 * - TabsContent: 标签对应的内容面板
 *
 * @example
 * // 基本用法
 * <Tabs defaultValue="account">
 *   <TabsList>
 *     <TabsTrigger value="account">账户</TabsTrigger>
 *     <TabsTrigger value="password">密码</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="account">账户设置内容</TabsContent>
 *   <TabsContent value="password">密码设置内容</TabsContent>
 * </Tabs>
 */

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

/** Tabs - 标签页根容器 */
const Tabs = TabsPrimitive.Root

/**
 * TabsList - 标签列表容器
 *
 * @param className - 额外的 CSS 类名
 * @param props - 其他 Radix Tabs List 属性
 * @param ref - 引用到 Radix Tabs List
 */
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

/**
 * TabsTrigger - 标签触发器
 *
 * 激活时显示 bg-background + shadow 样式。
 *
 * @param className - 额外的 CSS 类名
 * @param props - 其他 Radix Tabs Trigger 属性（如 value）
 * @param ref - 引用到 Radix Tabs Trigger
 */
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

/**
 * TabsContent - 标签内容面板
 *
 * @param className - 额外的 CSS 类名
 * @param props - 其他 Radix Tabs Content 属性（如 value）
 * @param ref - 引用到 Radix Tabs Content
 */
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
