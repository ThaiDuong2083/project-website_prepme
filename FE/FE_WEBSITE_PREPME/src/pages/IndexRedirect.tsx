import { Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@constants/routes.constants';

export const IndexRedirect = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  if (user?.role === 'ADMIN') return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />;
  return <Navigate to={ROUTES.USER.DASHBOARD} replace />;
};
