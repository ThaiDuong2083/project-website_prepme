import axiosInstance from '@lib/axios.lib';
import type { ApiResponse } from '@types';

export interface FileDTO {
  id: number;
  title: string;
  fileName: string;
  url: string;
  size: number;
  publicId?: string;
  type?: string;
  category?: string;
  uploadedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
}

export const filesApi = {
  getFiles: async (params: { page?: number; size?: number; category?: string }) => {
    const response = await axiosInstance.get<ApiResponse<PageResponse<FileDTO>>>('/files', { params });
    return response.data;
  },
};
