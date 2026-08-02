/**
 * Collapsible - 可折叠区域组件
 *
 * 可展开/折叠的内容区域，点击触发器切换内容的显示与隐藏。
 * 基于 shadcn/ui (new-york 风格) + Radix UI Collapsible 原语构建。
 *
 * @remarks
 * 导出三个子组件：
 * - Collapsible: 根容器，管理展开/折叠状态
 * - CollapsibleTrigger: 触发器，点击切换展开状态
 * - CollapsibleContent: 可折叠的内容区域，展开/折叠时有动画
 *
 * @example
 * // 基本用法
 * <Collapsible>
 *   <CollapsibleTrigger>展开更多</CollapsibleTrigger>
 *   <CollapsibleContent>隐藏的内容...</CollapsibleContent>
 * </Collapsible>
 */

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
