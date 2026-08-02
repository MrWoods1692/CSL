/**
 * 移动端检测 Hook
 * 
 * 通过 matchMedia 监听视口宽度变化，判断当前是否为移动端。
 * 移动端断点：< 768px（与 Tailwind 的 md 断点一致）
 * 
 * @returns 是否为移动端（boolean）
 */

import * as React from "react"

/** 移动端断点：768px（与 Tailwind md 断点一致） */
const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // 创建媒体查询：宽度 < 768px
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    // 监听媒体查询变化（如设备旋转、窗口缩放）
    mql.addEventListener("change", onChange)
    // 初始化状态
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    // 清理监听器
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
