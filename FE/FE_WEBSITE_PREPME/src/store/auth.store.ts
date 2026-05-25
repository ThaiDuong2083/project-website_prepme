import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storage } from '@utils/storage.utils';
import { authApi } from '@api/auth.api';
import toast from 'react-hot-toast';
import type { User, LoginWithPhonePayload, AuthTokens, RegisterPayload } from '@types';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  register: (payload: RegisterPayload) => Promise<void>;
  loginWithPhone: (payload: LoginWithPhonePayload) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  fetchProfile: () => Promise<void>;
  setTokenAndProfile: (tokens: AuthTokens) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: storage.getUser(),
      accessToken: storage.getToken(),
      isAuthenticated: !!storage.getToken(),
      isLoading: false,

      setLoading: (loading) => set({ isLoading: loading }),

      register: async (payload) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register(payload);
          await get().setTokenAndProfile(response.data);
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Đăng ký thất bại');
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      setTokenAndProfile: async (tokens: AuthTokens) => {
        storage.setToken(tokens.accessToken);
        set({ accessToken: tokens.accessToken, isAuthenticated: true });
        await get().fetchProfile();
      },

      loginWithPhone: async (payload) => {
        set({ isLoading: true });
        try {
          const response = await authApi.loginWithPhone(payload);
          await get().setTokenAndProfile(response.data);
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Số điện thoại hoặc mật khẩu không chính xác');
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      loginWithGoogle: async (idToken) => {
        set({ isLoading: true });
        try {
          const response = await authApi.loginWithGoogle({ idToken });
          await get().setTokenAndProfile(response.data);
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Đăng nhập Google thất bại');
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      fetchProfile: async () => {
        try {
          const response = await authApi.getProfile();
          const user = response.data;
          storage.setUser(user);
          set({ user });
        } catch {
          get().logout();
        }
      },

      logout: () => {
        storage.clear();
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'prepme-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
