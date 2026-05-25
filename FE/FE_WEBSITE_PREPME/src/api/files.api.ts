import axiosInstance from '@lib/axios.lib';
import type { ApiResponse, PageResponse } from '@types';

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


export const filesApi = {
  getFiles: async (params: { page?: number; size?: number; category?: string }) => {
    const response = await axiosInstance.get<ApiResponse<PageResponse<FileDTO>>>('/files', { params });
    return response.data;
  },

  upload: async (file: File): Promise<ApiResponse<{ url: string; publicId: string; originalName: string; type: string }>> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post<ApiResponse<{ url: string; publicId: string; originalName: string; type: string }>>(
      '/uploads/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};

