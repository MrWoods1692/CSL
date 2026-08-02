/**
 * Input - 输入框组件
 *
 * 基础文本输入框组件，支持所有原生 HTML input 属性（type、placeholder、disabled 等）。
 * 基于 shadcn/ui (new-york 风格) 构建。
 *
 * @remarks
 * 使用 forwardRef 转发引用，方便表单库（如 react-hook-form）直接获取 DOM 引用
 * 支持文件输入样式（file: 前缀的 Tailwind 变体）
 * 禁用状态：cursor-not-allowed + opacity-50
 *
 * @example
 * // 基本用法
 * <Input type="email" placeholder="请输入邮箱" />
 * <Input type="file" />
 * <Input disabled value="禁用状态" />
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Input - 输入框渲染组件
 *
 * @param className - 额外的 CSS 类名
 * @param type - HTML input type 属性（text, email, password, file 等）
 * @param props - 其他原生 input 属性
 * @param ref - 转发到原生 input 元素的引用
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
