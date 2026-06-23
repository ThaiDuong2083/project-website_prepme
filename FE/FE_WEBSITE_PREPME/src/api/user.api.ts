import axiosInstance from '@lib/axios.lib';
import type { ApiResponse, User } from '@types';

export const userApi = {
  checkPhone: async (): Promise<ApiResponse<{ hasPhone: boolean }>> => {
    const response = await axiosInstance.get<ApiResponse<{ hasPhone: boolean }>>('/users/check-phone');
    return response.data;
  },

  updatePhone: async (phone: string): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.put<ApiResponse<User>>('/users/phone', { phone });
    return response.data;
  },

  incrementVisit: async (): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.post<ApiResponse<User>>('/users/visit');
    return response.data;
  },
};
