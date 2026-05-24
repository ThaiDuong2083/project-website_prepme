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
    const response = await axiosInstance.post<ApiResponse<AuthTokens>>('/auth/login', payload);
    return response.data;
  },

  loginWithGoogle: async (payload: LoginWithGooglePayload): Promise<ApiResponse<AuthTokens>> => {
    const response = await axiosInstance.post<ApiResponse<AuthTokens>>('/auth/google', payload);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },
};
