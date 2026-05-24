import axiosInstance from '@lib/axios.lib';
import type { ApiResponse, Exam, ExamAttempt, PaginatedResponse, PaginationParams } from '@types';

export const examsApi = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Exam>>> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Exam>>>('/exams', {
      params,
    });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Exam>> => {
    const response = await axiosInstance.get<ApiResponse<Exam>>(`/exams/${id}`);
    return response.data;
  },

  startAttempt: async (examId: string): Promise<ApiResponse<ExamAttempt>> => {
    const response = await axiosInstance.post<ApiResponse<ExamAttempt>>(
      `/exams/${examId}/attempts`,
    );
    return response.data;
  },

  submitAttempt: async (
    examId: string,
    attemptId: string,
    answers: Record<string, string>,
  ): Promise<ApiResponse<ExamAttempt>> => {
    const response = await axiosInstance.post<ApiResponse<ExamAttempt>>(
      `/exams/${examId}/attempts/${attemptId}/submit`,
      { answers },
    );
    return response.data;
  },

  getAttemptResult: async (
    examId: string,
    attemptId: string,
  ): Promise<ApiResponse<ExamAttempt>> => {
    const response = await axiosInstance.get<ApiResponse<ExamAttempt>>(
      `/exams/${examId}/attempts/${attemptId}`,
    );
    return response.data;
  },

  getHistory: async (
    params?: PaginationParams,
  ): Promise<ApiResponse<PaginatedResponse<ExamAttempt>>> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<ExamAttempt>>>(
      '/exams/history',
      { params },
    );
    return response.data;
  },
};
