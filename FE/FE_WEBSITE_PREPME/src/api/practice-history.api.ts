import axiosInstance from '@lib/axios.lib';
import type { ApiResponse, PageResponse, PracticeHistoryDTO, PracticeStatisticsDTO } from '@types';

export const practiceHistoryApi = {
  getAll: async (params?: { skillType?: string; page?: number; size?: number }): Promise<ApiResponse<PageResponse<PracticeHistoryDTO>>> => {
    const response = await axiosInstance.get<ApiResponse<PageResponse<PracticeHistoryDTO>>>('/practice-histories', {
      params,
    });
    return response.data;
  },

  getById: async (id: string | number): Promise<ApiResponse<PracticeHistoryDTO>> => {
    const response = await axiosInstance.get<ApiResponse<PracticeHistoryDTO>>(`/practice-histories/${id}`);
    return response.data;
  },

  getStatistics: async (): Promise<ApiResponse<PracticeStatisticsDTO>> => {
    const response = await axiosInstance.get<ApiResponse<PracticeStatisticsDTO>>('/practice-histories/statistics');
    return response.data;
  },
};
