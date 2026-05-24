import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { ROUTES } from '@constants/routes.constants';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-8 dark:bg-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md text-center"
      >
        {/* Animated compass */}
        <motion.div
          animate={{ rotate: [0, 20, -20, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-2xl shadow-indigo-200 dark:shadow-indigo-950"
        >
          <Compass className="h-14 w-14 text-white" />
        </motion.div>

        <div className="relative mb-6">
          <p className="text-[96px] leading-none font-black text-slate-100 select-none dark:text-slate-900">
            404
          </p>
          <div className="absolute inset-0 flex items-end justify-center pb-2">
            <div className="h-1 w-24 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
          </div>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-slate-900 dark:text-white">Page Not Found</h1>
        <p className="mb-8 text-slate-500 dark:text-slate-400">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Link to={ROUTES.HOME}>
            <Button leftIcon={<Home className="h-4 w-4" />}>Go Home</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
