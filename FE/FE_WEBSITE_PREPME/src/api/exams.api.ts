import axiosInstance from '@lib/axios.lib';
import type { ApiResponse, Exam, ExamAttempt, PaginatedResponse, PaginationParams } from '@types';

export const examsApi = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Exam>>> => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    return {
      success: true,
      message: 'Thành công',
      data: {
        content: [{ id: 'e1', title: 'ETS 2024 Test 1', duration: 120, totalQuestions: 200 }] as any,
        totalElements: 1,
        totalPages: 1,
        currentPage: 0,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      },
      timestamp: new Date().toISOString(),
    };
  },

  getById: async (id: string): Promise<ApiResponse<Exam>> => ({
    success: true,
    message: 'Thành công',
    data: { id, title: 'Đề thi Mock', duration: 120 } as Exam,
    timestamp: new Date().toISOString(),
  }),

  startAttempt: async (examId: string): Promise<ApiResponse<ExamAttempt>> => {
    return {
      success: true,
      message: 'Bắt đầu làm bài',
      data: { id: 'att-1', examId, status: 'IN_PROGRESS', startTime: new Date().toISOString() } as any,
      timestamp: new Date().toISOString(),
    };
  },

  submitAttempt: async (
    examId: string,
    attemptId: string,
    answers: Record<string, string>,
  ): Promise<ApiResponse<ExamAttempt>> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      success: true,
      message: 'Nộp bài thành công',
      data: { id: attemptId, examId, score: 750, status: 'COMPLETED' } as any,
      timestamp: new Date().toISOString(),
    };
  },

  getAttemptResult: async (
    examId: string,
    attemptId: string,
  ): Promise<ApiResponse<ExamAttempt>> => {
    return {
      success: true,
      message: 'Lấy kết quả thành công',
      data: { id: attemptId, score: 750, status: 'COMPLETED' } as any,
      timestamp: new Date().toISOString(),
    };
  },

  getHistory: async (
    params?: PaginationParams,
  ): Promise<ApiResponse<PaginatedResponse<ExamAttempt>>> => {
    return {
      success: true,
      message: 'Thành công',
      data: {
        content: [
          { id: 'h1', score: 800, createdAt: new Date().toISOString() },
          { id: 'h2', score: 650, createdAt: new Date().toISOString() },
        ] as any,
        totalElements: 2,
        totalPages: 1,
        currentPage: 0,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      },
      timestamp: new Date().toISOString(),
    };
  },
};
