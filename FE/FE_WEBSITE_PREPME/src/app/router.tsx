import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PageLoading } from '@components/ui/Loading';
import { ProtectedRoute, PublicRoute } from '@components/shared/ProtectedRoute';
import { UserLayout } from '@layouts/UserLayout';
import { AdminLayout } from '@layouts/AdminLayout';
import { AuthLayout } from '@layouts/AuthLayout';
import { IndexRedirect } from '@pages/IndexRedirect';
import { ROUTES } from '@constants/routes.constants';

// ─── Lazy page imports ───────────────────────────────────────────────────────
const LoginPage = lazy(() =>
  import('@pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('@pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })),
);
const DashboardPage = lazy(() =>
  import('@pages/user/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const ExamsPage = lazy(() =>
  import('@pages/user/ExamsPage').then((m) => ({ default: m.ExamsPage })),
);
const LeaderboardPage = lazy(() =>
  import('@pages/user/LeaderboardPage').then((m) => ({ default: m.LeaderboardPage })),
);
const AdminDashboardPage = lazy(() =>
  import('@pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
);
const ForbiddenPage = lazy(() =>
  import('@pages/errors/ForbiddenPage').then((m) => ({ default: m.ForbiddenPage })),
);
const NotFoundPage = lazy(() =>
  import('@pages/errors/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);
const ServerErrorPage = lazy(() =>
  import('@pages/errors/ServerErrorPage').then((m) => ({ default: m.ServerErrorPage })),
);

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoading />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  // Root redirect
  { path: ROUTES.HOME, element: <IndexRedirect /> },

  // Auth routes (redirect if already logged in)
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <PublicRoute>{withSuspense(LoginPage)}</PublicRoute>,
      },
      {
        path: ROUTES.REGISTER,
        element: <PublicRoute>{withSuspense(RegisterPage)}</PublicRoute>,
      },
    ],
  },

  // User protected routes
  {
    element: (
      <ProtectedRoute allowedRoles={['USER']}>
        <UserLayout />
      </ProtectedRoute>
    ),
    errorElement: <ServerErrorPage />,
    children: [
      { path: ROUTES.USER.DASHBOARD, element: withSuspense(DashboardPage) },
      { path: ROUTES.USER.EXAMS, element: withSuspense(ExamsPage) },
      { path: ROUTES.USER.LEADERBOARD, element: withSuspense(LeaderboardPage) },
    ],
  },

  // Admin protected routes
  {
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <ServerErrorPage />,
    children: [{ path: ROUTES.ADMIN.DASHBOARD, element: withSuspense(AdminDashboardPage) }],
  },

  // Error pages
  { path: ROUTES.FORBIDDEN, element: withSuspense(ForbiddenPage) },
  { path: ROUTES.SERVER_ERROR, element: withSuspense(ServerErrorPage) },
  { path: '*', element: withSuspense(NotFoundPage) },
]);

export const AppRouter = () => <RouterProvider router={router} />;
