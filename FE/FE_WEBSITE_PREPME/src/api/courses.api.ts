import axiosInstance from '@lib/axios.lib';
import type { ApiResponse, Course, PaginatedResponse, PaginationParams } from '@types';

export const coursesApi = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Course>>> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Course>>>('/courses', {
      params,
    });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Course>> => {
    const response = await axiosInstance.get<ApiResponse<Course>>(`/courses/${id}`);
    return response.data;
  },

  enroll: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post<ApiResponse<void>>(`/courses/${id}/enroll`);
    return response.data;
  },

  create: async (data: Partial<Course>): Promise<ApiResponse<Course>> => {
    const response = await axiosInstance.post<ApiResponse<Course>>('/courses', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Course>): Promise<ApiResponse<Course>> => {
    const response = await axiosInstance.put<ApiResponse<Course>>(`/courses/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/courses/${id}`);
    return response.data;
  },
};
