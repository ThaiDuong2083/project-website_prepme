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

  createFile: async (file: File, data: { title: string; category?: string }): Promise<ApiResponse<FileDTO>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    const response = await axiosInstance.post<ApiResponse<FileDTO>>('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateFile: async (id: number, data: { title?: string; category?: string }, file?: File): Promise<ApiResponse<FileDTO>> => {
    const formData = new FormData();
    if (file) formData.append('file', file);
    formData.append('title', data.title ?? '');
    if (data.category) formData.append('category', data.category);
    const response = await axiosInstance.put<ApiResponse<FileDTO>>(`/files/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteFile: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/files/${id}/record`);
  },

  upload: async (file: File): Promise<ApiResponse<{ url: string; publicId: string; originalName: string; type: string }>> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post<ApiResponse<{ url: string; publicId: string; originalName: string; type: string }>>(
      '/uploads/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },
};

