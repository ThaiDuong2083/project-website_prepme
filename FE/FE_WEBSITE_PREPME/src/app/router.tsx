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
const SettingsPage = lazy(() =>
  import('@pages/user/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);
const PaymentSuccessPage = lazy(() =>
  import('@pages/user/PaymentSuccessPage').then((m) => ({ default: m.PaymentSuccessPage })),
);
const AdminDashboardPage = lazy(() =>
  import('@pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
);
const AdminVocabAiPage = lazy(() =>
  import('@pages/admin/AdminVocabAiPage').then((m) => ({ default: m.AdminVocabAiPage })),
);
const AdminGrammarAiPage = lazy(() =>
  import('@pages/admin/AdminGrammarAiPage').then((m) => ({ default: m.AdminGrammarAiPage })),
);
const AdminFilesPage = lazy(() =>
  import('@pages/admin/AdminFilesPage').then((m) => ({ default: m.AdminFilesPage })),
);
const AdminExamsPage = lazy(() =>
  import('@pages/admin/AdminExamsPage').then((m) => ({ default: m.AdminExamsPage })),
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
      { path: ROUTES.USER.SETTINGS, element: withSuspense(SettingsPage) },
      { path: ROUTES.SUCCESS, element: withSuspense(PaymentSuccessPage) },
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
    children: [
      { path: ROUTES.ADMIN.DASHBOARD, element: withSuspense(AdminDashboardPage) },
      { path: ROUTES.ADMIN.VOCAB_AI, element: withSuspense(AdminVocabAiPage) },
      { path: ROUTES.ADMIN.GRAMMAR_AI, element: withSuspense(AdminGrammarAiPage) },
      { path: ROUTES.ADMIN.FILES, element: withSuspense(AdminFilesPage) },
      { path: ROUTES.ADMIN.EXAMS, element: withSuspense(AdminExamsPage) },
    ],
  },

  // Error pages
  { path: ROUTES.FORBIDDEN, element: withSuspense(ForbiddenPage) },
  { path: ROUTES.SERVER_ERROR, element: withSuspense(ServerErrorPage) },
  { path: '*', element: withSuspense(NotFoundPage) },
]);

export const AppRouter = () => <RouterProvider router={router} />;
