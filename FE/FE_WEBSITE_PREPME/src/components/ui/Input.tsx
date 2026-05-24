import { forwardRef, useState } from 'react';
import { cn } from '@utils/isValidPhoneNumber.ts';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isRequired?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, isRequired, type, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
            {isRequired && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 text-slate-400">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={id}
            type={inputType}
            className={cn(
              'h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400',
              'transition-all duration-150 outline-none',
              'border-slate-200 hover:border-slate-300',
              'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20',
              'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500',
              'dark:hover:border-slate-600 dark:focus:border-indigo-400',
              'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50 dark:disabled:bg-slate-800',
              error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
              leftIcon && 'pl-10',
              (rightIcon || isPassword) && 'pr-10',
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
          {!isPassword && rightIcon && (
            <span className="absolute right-3 text-slate-400">{rightIcon}</span>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {!error && hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
