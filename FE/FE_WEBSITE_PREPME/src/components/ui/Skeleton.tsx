import { cn } from '@utils/isValidPhoneNumber.ts';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = ({ className, ...props }: SkeletonProps) => (
  <div className={cn('skeleton min-h-4', className)} {...props} />
);

export const SkeletonCard = () => (
  <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center gap-3">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-4 w-2/3" />
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-8 w-24 rounded-lg" />
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  </div>
);

export const SkeletonText = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className="h-4" style={{ width: i === lines - 1 ? '60%' : '100%' }} />
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => (
  <div className="space-y-3">
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, row) => (
      <div key={row} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, col) => (
          <Skeleton key={col} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    ))}
  </div>
);
