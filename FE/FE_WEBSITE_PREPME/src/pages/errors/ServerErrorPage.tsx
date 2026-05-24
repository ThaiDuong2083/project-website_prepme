import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ServerCrash, RefreshCw, Home } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { ROUTES } from '@constants/routes.constants';

export const ServerErrorPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-8 dark:bg-slate-950">
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-md text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-red-500 to-rose-600 shadow-2xl shadow-red-200 dark:shadow-red-950"
      >
        <ServerCrash className="h-14 w-14 text-white" />
      </motion.div>

      <p className="mb-6 text-[96px] leading-none font-black text-slate-100 select-none dark:text-slate-900">
        500
      </p>

      <h1 className="mb-3 text-3xl font-bold text-slate-900 dark:text-white">Server Error</h1>
      <p className="mb-8 text-slate-500 dark:text-slate-400">
        Something went wrong on our end. Our team has been notified and is working on a fix. Please
        try again in a moment.
      </p>

      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Button
          leftIcon={<RefreshCw className="h-4 w-4" />}
          variant="secondary"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
        <Link to={ROUTES.HOME}>
          <Button leftIcon={<Home className="h-4 w-4" />}>Go Home</Button>
        </Link>
      </div>
    </motion.div>
  </div>
);
