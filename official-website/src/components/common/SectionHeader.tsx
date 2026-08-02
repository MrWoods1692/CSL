/**
 * 区块标题组件
 * 
 * 统一的页面区块标题样式：
 * - 左侧装饰条（双色块）
 * - 大号标题文字 + 底部色块下划线
 * - 可选副标题
 * - 支持左对齐/居中对齐
 * - 支持三种强调色：primary / accent / secondary
 */

import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  /** 对齐方式 */
  align?: 'left' | 'center';
  /** 强调色 */
  accent?: 'primary' | 'accent' | 'secondary';
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  align = 'center',
  accent = 'accent',
}) => {
  // 强调色映射
  const accentClass =
    accent === 'primary'
      ? 'bg-primary'
      : accent === 'secondary'
        ? 'bg-secondary'
        : 'bg-accent';

  return (
    <div className={`mb-10 md:mb-14 ${align === 'center' ? 'text-center' : 'text-left'}`}>
      {/* 装饰条：粗线 + 细点 */}
      <div className={`mb-3 flex items-center gap-3 ${align === 'center' ? 'justify-center' : ''}`}>
        <span className={`h-1.5 w-8 ${accentClass}`} />
        <span className={`h-1.5 w-1.5 ${accentClass}`} />
      </div>
      {/* 标题 + 下划线色块 */}
      <h2 className="relative inline-block font-display text-3xl font-bold tracking-tight md:text-5xl">
        <span className="relative z-10">{title}</span>
        <span
          className={`absolute -bottom-2 left-0 h-3 w-full ${accentClass} -z-0 opacity-80`}
        />
      </h2>
      {/* 可选副标题 */}
      {subtitle && (
        <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
