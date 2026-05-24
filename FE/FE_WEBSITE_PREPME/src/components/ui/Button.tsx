import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@utils/isValidPhoneNumber.ts';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-ring select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md',
        secondary:
          'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700',
        ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
        outline:
          'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950',
        link: 'text-indigo-600 hover:text-indigo-700 underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
        xl: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, isLoading, leftIcon, rightIcon, children, disabled, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  ),
);
Button.displayName = 'Button';
