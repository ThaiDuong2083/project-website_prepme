import { cn } from '@utils/isValidPhoneNumber.ts';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

const sizeMap = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
const colorMap = {
  primary: 'bg-indigo-600',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
};

export const Progress = ({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  showLabel,
  label,
  animated,
  className,
  ...props
}: ProgressProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)} {...props}>
      {(showLabel || label) && (
        <div className="mb-1.5 flex items-center justify-between gap-2">
          {label && <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>}
          {showLabel && (
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(
          'w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800',
          sizeMap[size],
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorMap[color],
            animated && 'animate-pulse',
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
