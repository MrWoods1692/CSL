import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  accent?: 'primary' | 'accent' | 'secondary';
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  align = 'center',
  accent = 'accent',
}) => {
  const accentClass =
    accent === 'primary'
      ? 'bg-primary'
      : accent === 'secondary'
        ? 'bg-secondary'
        : 'bg-accent';

  return (
    <div className={`mb-10 md:mb-14 ${align === 'center' ? 'text-center' : 'text-left'}`}>
      <div className={`mb-3 flex items-center gap-3 ${align === 'center' ? 'justify-center' : ''}`}>
        <span className={`h-1.5 w-8 ${accentClass}`} />
        <span className={`h-1.5 w-1.5 ${accentClass}`} />
      </div>
      <h2 className="relative inline-block font-display text-3xl font-bold tracking-tight md:text-5xl">
        <span className="relative z-10">{title}</span>
        <span
          className={`absolute -bottom-2 left-0 h-3 w-full ${accentClass} -z-0 opacity-80`}
        />
      </h2>
      {subtitle && (
        <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
