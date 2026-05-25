import axiosInstance from '@lib/axios.lib';
import type { ApiResponse, PageResponse, TestListDTO, TestDetailDTO, TestSubmitRequest, PracticeHistoryDTO } from '@types';

export const examsApi = {
  getAll: async (params?: { type?: string; search?: string; page?: number; size?: number }): Promise<ApiResponse<PageResponse<TestListDTO>>> => {
    const response = await axiosInstance.get<ApiResponse<PageResponse<TestListDTO>>>('/exams', {
      params,
    });
    return response.data;
  },

  getById: async (id: string | number): Promise<ApiResponse<TestDetailDTO>> => {
    const response = await axiosInstance.get<ApiResponse<TestDetailDTO>>(`/exams/${id}`);
    return response.data;
  },

  submit: async (
    id: string | number,
    request: TestSubmitRequest
  ): Promise<ApiResponse<PracticeHistoryDTO>> => {
    const response = await axiosInstance.post<ApiResponse<PracticeHistoryDTO>>(
      `/exams/${id}/submit`,
      request
    );
    return response.data;
  },

  seedDemoExams: async (): Promise<ApiResponse<string>> => {
    const response = await axiosInstance.post<ApiResponse<string>>('/exams/seed');
    return response.data;
  },
};
