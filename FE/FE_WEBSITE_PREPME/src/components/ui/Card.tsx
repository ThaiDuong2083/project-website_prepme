import { cn } from '@utils/isValidPhoneNumber.ts';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva('rounded-xl bg-white dark:bg-slate-900 transition-all duration-200', {
  variants: {
    variant: {
      default: 'border border-slate-200 dark:border-slate-700 shadow-sm',
      elevated: 'shadow-md dark:shadow-slate-900/50',
      glass: 'glass',
      flat: 'bg-slate-50 dark:bg-slate-800/60',
    },
    hover: {
      true: 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
      false: '',
    },
  },
  defaultVariants: { variant: 'default', hover: false },
});

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export const Card = ({ className, variant, hover, ...props }: CardProps) => (
  <div className={cn(cardVariants({ variant, hover }), className)} {...props} />
);

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800',
      className,
    )}
    {...props}
  />
);

export const CardBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6', className)} {...props} />
);

export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex items-center gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800',
      className,
    )}
    {...props}
  />
);

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn('text-base font-semibold text-slate-900 dark:text-slate-100', className)}
    {...props}
  />
);
