/**
 * Dialog - 对话框组件
 *
 * 模态对话框，覆盖在主内容上方，阻止用户与背景交互，用于展示重要信息或收集用户输入。
 * 基于 shadcn/ui (new-york 风格) + Radix UI Dialog 原语构建。
 *
 * @remarks
 * 导出七个子组件：
 * - Dialog: 根容器，通过 open/onOpenChange 控制显示
 * - DialogTrigger: 触发器，点击打开对话框
 * - DialogPortal: 将对话框渲染到 body，避免 z-index 问题
 * - DialogClose: 关闭按钮包装器
 * - DialogOverlay: 半透明黑色遮罩层（bg-black/80）
 * - DialogContent: 对话框主体，居中定位，带缩放动画
 * - DialogHeader/Footer: 头部和底部布局
 * 关闭按钮（X 图标）内置在 DialogContent 右上角
 *
 * @example
 * // 基本用法
 * <Dialog>
 *   <DialogTrigger>打开对话框</DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>对话框标题</DialogTitle>
 *       <DialogDescription>对话框描述</DialogDescription>
 *     </DialogHeader>
 *   </DialogContent>
 * </Dialog>
 */

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

/** Dialog - 对话框根容器 */
const Dialog = DialogPrimitive.Root

/** DialogTrigger - 对话框触发器 */
const DialogTrigger = DialogPrimitive.Trigger

/** DialogPortal - 将对话框渲染到 body */
const DialogPortal = DialogPrimitive.Portal

/** DialogClose - 关闭按钮包装器 */
const DialogClose = DialogPrimitive.Close

/**
 * DialogOverlay - 对话框遮罩层
 *
 * 固定全屏半透明黑色背景，打开/关闭时有淡入淡出动画。
 */
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

/**
 * DialogContent - 对话框内容
 *
 * 居中定位的对话框主体，包含缩放+滑入动画。
 * 内置关闭按钮（X 图标，sr-only 文字供屏幕阅读器）。
 */
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

/**
 * DialogHeader - 对话框头部
 *
 * 包含标题和描述的容器，移动端居中、桌面端左对齐。
 */
const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

/**
 * DialogFooter - 对话框底部
 *
 * 操作按钮区域，移动端垂直排列、桌面端水平右对齐。
 */
const DialogFooter = ({
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
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
