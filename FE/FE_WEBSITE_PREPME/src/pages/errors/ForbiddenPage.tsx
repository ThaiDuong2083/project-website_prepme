import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { ROUTES } from '@constants/routes.constants';
import { useAuth } from '@hooks/useAuth';

export const ForbiddenPage = () => {
  const { user } = useAuth();
  const home = user?.role === 'ADMIN' ? ROUTES.ADMIN.DASHBOARD : ROUTES.USER.DASHBOARD;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-8 dark:bg-slate-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-md text-center"
      >
        {/* Number */}
        <div className="relative mb-8">
          <p className="text-[120px] leading-none font-black text-slate-100 select-none dark:text-slate-900">
            403
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 shadow-2xl shadow-red-200 dark:shadow-red-950">
              <ShieldOff className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-slate-900 dark:text-white">Access Forbidden</h1>
        <p className="mb-8 text-slate-500 dark:text-slate-400">
          You don't have permission to access this page. Please contact your administrator if you
          think this is a mistake.
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link to={home}>
            <Button leftIcon={<ArrowLeft className="h-4 w-4" />}>Back to Dashboard</Button>
          </Link>
          <Link to={ROUTES.LOGIN}>
            <Button variant="secondary">Switch Account</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
