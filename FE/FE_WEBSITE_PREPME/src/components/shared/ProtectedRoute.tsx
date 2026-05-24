import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { PageLoading } from '@components/ui/Loading';
import { ROUTES } from '@constants/routes.constants';
import type { UserRole } from '@/types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoading />;

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  return <>{children}</>;
};

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    const redirect = user.role === 'ADMIN' ? ROUTES.ADMIN.DASHBOARD : ROUTES.USER.DASHBOARD;
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
};
