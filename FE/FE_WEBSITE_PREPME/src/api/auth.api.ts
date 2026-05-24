import axiosInstance from '@lib/axios.lib';
import type {
  ApiResponse,
  AuthTokens,
  User,
  LoginWithPhonePayload,
  LoginWithGooglePayload,
} from '@types';

export const authApi = {
  loginWithPhone: async (payload: LoginWithPhonePayload): Promise<ApiResponse<AuthTokens>> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      success: true,
      message: 'Đăng nhập thành công (Mock)',
      data: {
        accessToken: 'mock_access_token_' + Date.now(),
        expiresIn: 3600
      },
      timestamp: new Date().toISOString(),
    };
  },

  loginWithGoogle: async (payload: LoginWithGooglePayload): Promise<ApiResponse<AuthTokens>> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      success: true,
      message: 'Đăng nhập Google thành công (Mock)',
      data: {
        accessToken: 'mock_google_token',
        expiresIn: 3600
      },
      timestamp: new Date().toISOString(),
    };
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    return {
      success: true,
      message: 'Lấy thông tin thành công',
      data: {
        id: 'u-123',
        phone: '0912345678',
        fullName: 'Charn Is Here',
        role: 'USER',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charn',
      } as User,
      timestamp: new Date().toISOString(),
    };
  },

  logout: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
  },
};
