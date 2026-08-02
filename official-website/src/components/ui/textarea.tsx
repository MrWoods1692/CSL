/**
 * Textarea - 文本域组件
 *
 * 多行文本输入组件，适用于需要用户输入较长文本的场景（如评论、描述、备注）。
 * 基于 shadcn/ui (new-york 风格) 构建。
 *
 * @remarks
 * 最小高度 60px，支持通过 className 自定义高度
 * 使用 forwardRef 转发引用，方便表单库集成
 * 禁用状态：cursor-not-allowed + opacity-50
 *
 * @example
 * // 基本用法
 * <Textarea placeholder="请输入描述信息" />
 * <Textarea rows={5} disabled />
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Textarea - 文本域渲染组件
 *
 * @param className - 额外的 CSS 类名
 * @param props - 其他原生 textarea 属性
 * @param ref - 引用到原生 textarea 元素
 */
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
