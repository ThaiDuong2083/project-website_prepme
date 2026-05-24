import type { UserRole } from '@/types/auth.types';

export const hasRole = (userRole: UserRole | undefined, requiredRole: UserRole): boolean => {
  if (!userRole) return false;
  return userRole === requiredRole;
};

export const isAdmin = (role: UserRole | undefined): boolean => hasRole(role, 'ADMIN');
export const isUser = (role: UserRole | undefined): boolean => hasRole(role, 'USER');

export const canAccess = (userRole: UserRole | undefined, allowedRoles: UserRole[]): boolean => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};
