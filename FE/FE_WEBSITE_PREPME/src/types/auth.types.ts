export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  phone: string;
  email?: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}

export interface LoginWithPhonePayload {
  phone: string;
  password: string;
}

export interface LoginWithGooglePayload {
  idToken: string;
}

export interface RegisterPayload {
  fullName: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
