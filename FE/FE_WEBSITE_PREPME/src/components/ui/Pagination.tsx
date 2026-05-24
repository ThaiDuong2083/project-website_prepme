import { cn } from '@utils/isValidPhoneNumber.ts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showPageNumbers?: boolean;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showPageNumbers = true,
}: PaginationProps) => {
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    const delta = 2;
    const left = currentPage - delta;
    const right = currentPage + delta;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn('flex items-center gap-1', className)}
    >
      <Button
        variant="secondary"
        size="icon-sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {showPageNumbers &&
        getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-sm text-slate-400">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              aria-current={currentPage === page ? 'page' : undefined}
              className={cn(
                'h-8 min-w-[32px] rounded-lg px-2.5 text-sm font-medium transition-colors',
                currentPage === page
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
              )}
            >
              {page}
            </button>
          ),
        )}

      <Button
        variant="secondary"
        size="icon-sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
};
