import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  BarChart2,
  Settings,
  LogOut,
  GraduationCap,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '@utils/isValidPhoneNumber.ts';
import { useAuth } from '@hooks/useAuth';
import { useTheme } from '@hooks/useTheme';
import { Avatar } from '@components/ui/Avatar';
import { ROUTES } from '@constants/routes.constants';
import { APP_NAME } from '@constants/env.constants';
import toast from 'react-hot-toast';

const adminNav = [
  { label: 'Dashboard', href: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard },
  { label: 'Users', href: ROUTES.ADMIN.USERS, icon: Users },
  { label: 'Courses', href: ROUTES.ADMIN.COURSES, icon: BookOpen },
  { label: 'Exams', href: ROUTES.ADMIN.EXAMS, icon: FileText },
  { label: 'Analytics', href: ROUTES.ADMIN.ANALYTICS, icon: BarChart2 },
  { label: 'Settings', href: ROUTES.ADMIN.SETTINGS, icon: Settings },
];

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Admin Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-700/50 bg-slate-900 dark:bg-slate-950">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-700/50 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white">{APP_NAME}</p>
            <p className="text-[11px] font-medium tracking-widest text-slate-400 uppercase">
              Admin
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
          {adminNav.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === ROUTES.ADMIN.DASHBOARD}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="space-y-1 border-t border-slate-700/50 p-3">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
          >
            {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-950/30"
          >
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </div>

        {/* Admin user info */}
        <div className="border-t border-slate-700/50 p-4">
          <div className="flex items-center gap-3">
            <Avatar src={user?.avatarUrl} name={user?.fullName} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.fullName}</p>
              <p className="text-xs font-medium text-slate-400">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex min-h-screen flex-1 flex-col pl-64">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="max-w-screen-2xl flex-1 p-6 lg:p-8"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};
