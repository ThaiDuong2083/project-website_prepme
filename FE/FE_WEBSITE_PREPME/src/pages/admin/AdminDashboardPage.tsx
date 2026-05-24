import { motion } from 'framer-motion';
import { Users, BookOpen, FileText, TrendingUp, Activity, ArrowUpRight } from 'lucide-react';
import { Card, CardBody } from '@components/ui/Card';
import { Badge } from '@components/ui/Badge';
import { Avatar } from '@components/ui/Avatar';
import { Progress } from '@components/ui/Progress';

const kpis = [
  {
    label: 'Total Users',
    value: '12,480',
    change: '+8.2%',
    up: true,
    icon: Users,
    color: 'bg-indigo-500',
  },
  {
    label: 'Active Courses',
    value: '48',
    change: '+3',
    up: true,
    icon: BookOpen,
    color: 'bg-violet-500',
  },
  {
    label: 'Exams Today',
    value: '1,204',
    change: '+12%',
    up: true,
    icon: FileText,
    color: 'bg-emerald-500',
  },
  {
    label: 'Avg Band Score',
    value: '6.3',
    change: '+0.2',
    up: true,
    icon: TrendingUp,
    color: 'bg-amber-500',
  },
];

const recentUsers = [
  { name: 'Nguyen Van A', phone: '0912345678', role: 'USER', joined: '2m ago' },
  { name: 'Tran Thi B', phone: '0987654321', role: 'USER', joined: '15m ago' },
  { name: 'Le Van C', phone: '0934567890', role: 'ADMIN', joined: '1h ago' },
  { name: 'Pham Thi D', phone: '0923456789', role: 'USER', joined: '2h ago' },
];

const moduleStats = [
  { module: 'Listening', attempts: 4200, pass: 78 },
  { module: 'Reading', attempts: 3900, pass: 71 },
  { module: 'Writing', attempts: 2800, pass: 63 },
  { module: 'Speaking', attempts: 2100, pass: 68 },
];

export const AdminDashboardPage = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Platform overview and analytics</p>
      </div>
      <Badge variant="success" dot>
        Live
      </Badge>
    </div>

    {/* KPIs */}
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {kpis.map((kpi, i) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
        >
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.color}`}>
                <kpi.icon className="h-5 w-5 text-white" />
              </div>
              <span
                className={`flex items-center gap-1 text-xs font-semibold ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}
              >
                <ArrowUpRight className="h-3 w-3" />
                {kpi.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</p>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{kpi.label}</p>
          </Card>
        </motion.div>
      ))}
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Module Stats */}
      <Card>
        <div className="p-6 pb-2">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Module Performance
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pass rates across all modules
          </p>
        </div>
        <CardBody className="space-y-5 pt-4">
          {moduleStats.map((m) => (
            <div key={m.module}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {m.module}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    {m.attempts.toLocaleString()} attempts
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {m.pass}%
                  </span>
                </div>
              </div>
              <Progress value={m.pass} size="sm" color={m.pass >= 70 ? 'success' : 'primary'} />
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Recent Users */}
      <Card>
        <div className="flex items-center justify-between p-6 pb-2">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Recent Registrations
          </h2>
          <Activity className="h-4 w-4 text-slate-400" />
        </div>
        <CardBody className="-mx-6 -mb-6 divide-y divide-slate-100 px-0 pt-4 dark:divide-slate-800">
          {recentUsers.map((u) => (
            <div key={u.phone} className="flex items-center gap-3 px-6 py-3">
              <Avatar name={u.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                  {u.name}
                </p>
                <p className="text-xs text-slate-400">{u.phone}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={u.role === 'ADMIN' ? 'danger' : 'primary'}>{u.role}</Badge>
                <span className="text-xs text-slate-400">{u.joined}</span>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  </div>
);
