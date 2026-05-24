import { type ComponentType } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Trophy,
  BarChart2,
  Bot,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  GraduationCap,
  History,
  X,
} from 'lucide-react';
import { type LucideProps } from 'lucide-react';
import { cn } from '@utils/isValidPhoneNumber.ts';
import { useAuth } from '@hooks/useAuth';
import { useAppStore } from '@store/app.store';
import { Avatar } from '@components/ui/Avatar';
import { Badge } from '@components/ui/Badge';
import { ROUTES } from '@constants/routes.constants';
import { APP_NAME } from '@constants/env.constants';
import toast from 'react-hot-toast';

interface NavItemDef {
  label: string;
  href: string;
  icon: ComponentType<LucideProps>;
  badge?: string;
}

const navItems: NavItemDef[] = [
  { label: 'Dashboard', href: ROUTES.USER.DASHBOARD, icon: LayoutDashboard },
  { label: 'Courses', href: ROUTES.USER.COURSES, icon: BookOpen },
  { label: 'Exams', href: ROUTES.USER.EXAMS, icon: FileText },
  { label: 'History', href: ROUTES.USER.HISTORY, icon: History },
  { label: 'Leaderboard', href: ROUTES.USER.LEADERBOARD, icon: Trophy },
  { label: 'AI Assistant', href: ROUTES.USER.AI_ASSISTANT, icon: Bot, badge: 'AI' },
  { label: 'Analytics', href: ROUTES.USER.HISTORY, icon: BarChart2 },
];

const bottomItems: NavItemDef[] = [
  { label: 'Profile', href: ROUTES.USER.PROFILE, icon: User },
  { label: 'Settings', href: ROUTES.USER.SETTINGS, icon: Settings },
];

interface SidebarNavItemProps {
  item: NavItemDef;
  collapsed: boolean;
}

const SidebarNavItem = ({ item, collapsed }: SidebarNavItemProps) => (
  <NavLink
    to={item.href}
    className={({ isActive }) =>
      cn(
        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-900'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
        collapsed && 'justify-center px-2',
      )
    }
    title={collapsed ? item.label : undefined}
  >
    <item.icon className="h-5 w-5 shrink-0" />
    {!collapsed && (
      <>
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge && (
          <Badge variant="primary" className="px-1.5 py-0 text-[10px]">
            {item.badge}
          </Badge>
        )}
      </>
    )}
  </NavLink>
);

export const UserSidebar = () => {
  const { user, logout } = useAuth();
  const { sidebarCollapsed, toggleSidebarCollapsed, sidebarOpen, setSidebarOpen } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate(ROUTES.LOGIN);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-slate-200 px-4 dark:border-slate-800',
          sidebarCollapsed && 'justify-center px-2',
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        {!sidebarCollapsed && (
          <span className="text-gradient ml-2.5 text-lg font-bold">{APP_NAME}</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <SidebarNavItem
            key={`${item.label}-${item.href}`}
            item={item}
            collapsed={sidebarCollapsed}
          />
        ))}
      </nav>

      {/* Bottom */}
      <div className="space-y-1 border-t border-slate-200 p-3 dark:border-slate-800">
        {bottomItems.map((item) => (
          <SidebarNavItem key={item.label} item={item} collapsed={sidebarCollapsed} />
        ))}
        <button
          onClick={handleLogout}
          className={cn(
            'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
            'text-red-500 transition-all duration-150 hover:bg-red-50 dark:hover:bg-red-950/30',
            sidebarCollapsed && 'justify-center px-2',
          )}
          title={sidebarCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!sidebarCollapsed && <span>Log out</span>}
        </button>
      </div>

      {/* User info */}
      {!sidebarCollapsed && (
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Avatar src={user?.avatarUrl} name={user?.fullName} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {user?.fullName}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {user?.phone}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden flex-col lg:flex',
          'border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950',
          'transition-all duration-300',
          sidebarCollapsed ? 'w-[72px]' : 'w-[260px]',
        )}
      >
        {sidebarContent}
        {/* Collapse toggle */}
        <button
          onClick={toggleSidebarCollapsed}
          className="absolute top-20 -right-3 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:hover:text-slate-300"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            className={cn('h-3.5 w-3.5 transition-transform', sidebarCollapsed && 'rotate-180')}
          />
        </button>
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-[260px] border-r border-slate-200 bg-white lg:hidden dark:border-slate-800 dark:bg-slate-950"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
