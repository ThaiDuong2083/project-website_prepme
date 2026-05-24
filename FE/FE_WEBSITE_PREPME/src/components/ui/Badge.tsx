import { cn } from '@utils/isValidPhoneNumber.ts';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        primary: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400',
        success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
        danger: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
        info: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400',
        outline: 'border border-current text-slate-600 dark:text-slate-400',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export const Badge = ({ className, variant, dot, children, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props}>
    {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
    {children}
  </span>
);
