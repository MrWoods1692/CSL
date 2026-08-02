/**
 * Avatar - 头像组件
 *
 * 用于展示用户头像图片的组件，支持图片加载失败时的文字回退（Fallback）。
 * 基于 shadcn/ui (new-york 风格) + Radix UI Avatar 原语构建。
 *
 * @remarks
 * 由三个子组件组成：
 * - Avatar: 根容器，圆形裁剪区域
 * - AvatarImage: 头像图片，加载成功时显示
 * - AvatarFallback: 回退内容，图片加载失败或未提供时显示（如用户姓名首字母）
 *
 * @example
 * // 基本用法
 * <Avatar>
 *   <AvatarImage src="https://example.com/avatar.jpg" alt="用户头像" />
 *   <AvatarFallback>张三</AvatarFallback>
 * </Avatar>
 */

"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

/**
 * Avatar - 头像根容器
 *
 * 渲染一个 40x40 的圆形容器，图片超出部分裁剪隐藏。
 *
 * @param className - 额外的 CSS 类名
 * @param props - 其他 Radix Avatar Root 属性
 * @param ref - 转发到 Radix Avatar Root 的引用
 */
const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

/**
 * AvatarImage - 头像图片
 *
 * 加载并显示头像图片，保持正方形比例填充容器。
 *
 * @param className - 额外的 CSS 类名
 * @param props - 其他 Radix Avatar Image 属性（如 src, alt）
 * @param ref - 引用到 Radix Avatar Image
 */
const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

/**
 * AvatarFallback - 头像回退内容
 *
 * 当 AvatarImage 加载失败或未提供 src 时显示的替代内容。
 * 通常用于显示用户姓名首字母或默认图标。
 *
 * @param className - 额外的 CSS 类名
 * @param props - 其他 Radix Avatar Fallback 属性
 * @param ref - 引用到 Radix Avatar Fallback
 */
const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
