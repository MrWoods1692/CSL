/**
 * Sheet - 侧边面板组件
 *
 * 从屏幕边缘滑出的面板，支持四个方向（上/下/左/右），适用于移动端菜单、设置面板等场景。
 * 基于 shadcn/ui (new-york 风格) + Radix UI Dialog + class-variance-authority 构建。
 *
 * @remarks
 * 导出六个子组件：
 * - Sheet: 根容器
 * - SheetTrigger: 触发器
 * - SheetClose: 关闭按钮包装器
 * - SheetPortal: Portal 渲染
 * - SheetOverlay: 半透明遮罩层
 * - SheetContent: 面板内容，通过 side 属性控制滑出方向
 * 支持四个方向：top（顶部滑入）、bottom（底部滑入）、left（左侧滑入）、right（右侧滑入，默认）
 * 内置关闭按钮（X 图标）
 *
 * @example
 * // 基本用法
 * <Sheet>
 *   <SheetTrigger>打开面板</SheetTrigger>
 *   <SheetContent>
 *     <SheetHeader>
 *       <SheetTitle>面板标题</SheetTitle>
 *     </SheetHeader>
 *   </SheetContent>
 * </Sheet>
 */

"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

/** Sheet - 侧边面板根容器 */
const Sheet = SheetPrimitive.Root

/** SheetTrigger - 侧边面板触发器 */
const SheetTrigger = SheetPrimitive.Trigger

/** SheetClose - 侧边面板关闭按钮 */
const SheetClose = SheetPrimitive.Close

/** SheetPortal - 将面板渲染到 body */
const SheetPortal = SheetPrimitive.Portal

/**
 * SheetOverlay - 侧边面板遮罩层
 *
 * 固定全屏半透明黑色背景，打开/关闭时有淡入淡出动画。
 */
const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

/**
 * sheetVariants - 侧边面板样式变体
 *
 * 使用 CVA 定义四个方向的滑入/滑出动画。
 * - top: 顶部滑入，底部边框
 * - bottom: 底部滑入，顶部边框
 * - left: 左侧滑入，右侧边框，宽度 3/4，最大 sm
 * - right: 右侧滑入，左侧边框，宽度 3/4，最大 sm（默认）
 */
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

/**
 * SheetContentProps - 侧边面板内容属性
 *
 * 继承 Radix Dialog Content 属性，扩展 side 变体。
 */
interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

/**
 * SheetContent - 侧边面板内容
 *
 * 包含遮罩层和面板主体，内置关闭按钮。
 *
 * @param side - 滑出方向，默认 "right"
 */
const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
