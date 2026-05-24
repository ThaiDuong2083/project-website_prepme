import { cn } from '@utils/isValidPhoneNumber.ts';
import { FileSearch } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => (
  <div
    className={cn('flex flex-col items-center justify-center px-8 py-16 text-center', className)}
  >
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
      {icon ?? <FileSearch className="h-8 w-8" />}
    </div>
    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
    {description && (
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
    )}
    {action && (
      <Button className="mt-4" size="sm" onClick={action.onClick}>
        {action.label}
      </Button>
    )}
  </div>
);
