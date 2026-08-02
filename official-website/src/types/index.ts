/**
 * 通用类型定义
 * 
 * 项目中使用的共享 TypeScript 类型和接口。
 */

/**
 * 选项接口
 * 
 * 用于下拉选择框、多选组件等场景的选项数据结构。
 */
export interface Option {
  /** 选项显示文本 */
  label: string;
  /** 选项值 */
  value: string;
  /** 可选的图标组件（如 Lucide 图标） */
  icon?: React.ComponentType<{ className?: string }>;
  /** 是否显示计数（如多选时显示已选数量） */
  withCount?: boolean;
}
