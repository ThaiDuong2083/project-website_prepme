import { Sun, Moon, Bell, Menu, Search } from 'lucide-react';
import { useTheme } from '@hooks/useTheme';
import { useAppStore } from '@store/app.store';
import { useAuth } from '@hooks/useAuth';
import { Avatar } from '@components/ui/Avatar';
import { cn } from '@utils/isValidPhoneNumber.ts';

interface TopbarProps {
  title?: string;
}

export const Topbar = ({ title }: TopbarProps) => {
  const { toggleTheme, isDark } = useTheme();
  const { toggleSidebar, sidebarCollapsed } = useAppStore();
  const { user } = useAuth();

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md transition-all duration-300 dark:border-slate-800 dark:bg-slate-950/80',
        'left-0 lg:left-[260px]',
        sidebarCollapsed && 'lg:left-[72px]',
      )}
    >
      {/* Mobile menu toggle */}
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {title && (
        <h1 className="hidden text-base font-semibold text-slate-900 sm:block dark:text-slate-100">
          {title}
        </h1>
      )}

      {/* Search */}
      <div className="hidden max-w-xs flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 md:flex dark:border-slate-700 dark:bg-slate-900">
        <Search className="h-4 w-4 shrink-0" />
        <span>Search anything...</span>
        <kbd className="ml-auto rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs dark:border-slate-700 dark:bg-slate-800">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <button
          className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-950" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Avatar */}
        <Avatar src={user?.avatarUrl} name={user?.fullName} size="sm" />
      </div>
    </header>
  );
};
