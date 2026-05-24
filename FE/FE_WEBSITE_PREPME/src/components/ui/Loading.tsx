import { Loader2 } from 'lucide-react';
import { cn } from '@utils/isValidPhoneNumber.ts';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const sizeMap = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8', xl: 'h-12 w-12' };
const textSizeMap = { sm: 'text-xs', md: 'text-sm', lg: 'text-base', xl: 'text-lg' };

export const Loading = ({ size = 'md', text, fullScreen, className }: LoadingProps) => {
  const content = (
    <div
      className={cn('flex flex-col items-center justify-center gap-3', !fullScreen && className)}
    >
      <Loader2 className={cn('animate-spin text-indigo-600', sizeMap[size])} />
      {text && (
        <p className={cn('font-medium text-slate-500 dark:text-slate-400', textSizeMap[size])}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center',
          'bg-white/80 backdrop-blur-sm dark:bg-slate-950/80',
          className,
        )}
      >
        {content}
      </div>
    );
  }

  return content;
};

export const PageLoading = () => <Loading fullScreen size="lg" text="Loading..." />;
