import { useAuthStore } from '@store/auth.store';

export const useAuth = () => {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const register = useAuthStore((s) => s.register);
  const loginWithPhone = useAuthStore((s) => s.loginWithPhone);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const logout = useAuthStore((s) => s.logout);

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    isAdmin: user?.role === 'ADMIN',
    isUser: user?.role === 'USER',
    register,
    loginWithPhone,
    loginWithGoogle,
    logout,
  };
};
