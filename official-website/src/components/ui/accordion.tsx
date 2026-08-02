/**
 * Accordion - 手风琴折叠面板组件
 *
 * 可折叠/展开的内容区域，默认一次只能展开一个项目（手风琴模式）。
 * 基于 shadcn/ui (new-york 风格) + Radix UI Accordion 原语构建。
 *
 * @remarks
 * 导出四个子组件：
 * - Accordion: 根容器，通过 type="single" 实现手风琴模式
 * - AccordionItem: 单个折叠项，底部有边框分隔
 * - AccordionTrigger: 触发器，包含 ChevronDown 图标，展开时旋转 180°
 * - AccordionContent: 折叠内容，展开/折叠有自定义动画（accordion-up/accordion-down）
 *
 * @example
 * // 基本用法
 * <Accordion type="single" collapsible>
 *   <AccordionItem value="item-1">
 *     <AccordionTrigger>标题一</AccordionTrigger>
 *     <AccordionContent>内容一</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 */

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

/** Accordion - 手风琴根容器，直接导出 Radix Accordion Root */
const Accordion = AccordionPrimitive.Root

/**
 * AccordionItem - 单个折叠项
 *
 * @param className - 额外的 CSS 类名
 * @param props - 其他 Radix Accordion Item 属性（如 value）
 * @param ref - 引用到 Radix Accordion Item
 */
const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

/**
 * AccordionTrigger - 折叠触发器
 *
 * 点击展开/折叠对应内容。包含 ChevronDown 图标，展开时旋转 180°。
 *
 * @param className - 额外的 CSS 类名
 * @param children - 触发器显示内容
 * @param props - 其他 Radix Accordion Trigger 属性
 * @param ref - 引用到 Radix Accordion Trigger
 */
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

/**
 * AccordionContent - 折叠内容区域
 *
 * 展开/折叠时使用自定义动画（accordion-up/accordion-down 关键帧）。
 *
 * @param className - 额外的 CSS 类名
 * @param children - 折叠内容
 * @param props - 其他 Radix Accordion Content 属性
 * @param ref - 引用到 Radix Accordion Content
 */
const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
