/**
 * 通用工具函数库
 * 
 * 提供项目中常用的工具函数：
 * - cn()：类名合并（clsx + tailwind-merge）
 * - createQueryString()：URL 查询参数构建
 * - formatDate()：日期格式化（中文）
 */

// clsx：条件类名拼接工具
import { clsx, type ClassValue } from "clsx"
// tailwind-merge：智能合并 Tailwind CSS 类名，解决样式冲突
import { twMerge } from "tailwind-merge"

/**
 * 类名合并工具函数
 * 
 * 结合 clsx 和 tailwind-merge 的功能：
 * 1. clsx 处理条件类名（如 cn('text-red', isActive && 'font-bold')）
 * 2. twMerge 解决 Tailwind 类名冲突（如后面的 'px-4' 会覆盖前面的 'px-2'）
 * 
 * @param inputs - 类名参数（字符串、对象、数组等）
 * @returns 合并后的类名字符串
 * 
 * @example
 * cn('px-2 py-1', isActive && 'bg-blue-500', 'px-4')  // => 'py-1 bg-blue-500 px-4'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** URL 查询参数类型 */
export type Params = Partial<
  Record<keyof URLSearchParams, string | number | null | undefined>
>;

/**
 * 创建 URL 查询字符串
 * 
 * 基于现有的 searchParams 创建新的查询字符串，
 * 支持添加、修改和删除参数。
 * 
 * @param params - 要设置的参数键值对（值为 null/undefined 时删除该参数）
 * @param searchParams - 现有的 URLSearchParams 对象
 * @returns 新的查询字符串（不含 '?' 前缀）
 * 
 * @example
 * createQueryString({ page: 2 }, new URLSearchParams('?page=1&sort=asc'))
 * // 返回 'page=2&sort=asc'
 */
export function createQueryString(
  params: Params,
  searchParams: URLSearchParams
) {
  // 复制现有的查询参数
  const newSearchParams = new URLSearchParams(searchParams?.toString());

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      // 值为空时删除该参数
      newSearchParams.delete(key);
    } else {
      // 设置新值
      newSearchParams.set(key, String(value));
    }
  }

  return newSearchParams.toString();
}

/**
 * 格式化日期（中文）
 * 
 * 使用 Intl.DateTimeFormat 进行本地化日期格式化。
 * 
 * @param date - 日期值（Date 对象、时间戳或日期字符串）
 * @param opts - Intl.DateTimeFormat 选项（默认显示年月日）
 * @returns 格式化后的日期字符串（如 "2024年1月15日"）
 * 
 * @example
 * formatDate(new Date('2024-01-15'))  // "2024年1月15日"
 * formatDate('2024-01-15', { month: 'short' })  // "2024年1月15日"
 */
export function formatDate(
  date: Date | string | number,
  opts: Intl.DateTimeFormatOptions = {}
) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: opts.month ?? "long",
    day: opts.day ?? "numeric",
    year: opts.year ?? "numeric",
    ...opts,
  }).format(new Date(date));
}
