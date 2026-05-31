import axiosInstance from '@lib/axios.lib';
import type {
  ApiResponse, PageResponse, TestListDTO, TestDetailDTO, TestSectionDTO,
  TestQuestionDTO, TestSubmitRequest, PracticeHistoryDTO, BEExamType, BEQuestionType,
} from '@types';

// ─── Request types ────────────────────────────────────────────────────────────
export interface AdminCreateTestRequest {
  title: string;
  examType: BEExamType;
  duration: number; // seconds
  isPro?: boolean;
  description?: string;
  audioUrl?: string;
}

export interface AdminCreateSectionRequest {
  sectionNumber: number;
  title?: string;
  audioUrl?: string;
  passage?: string;
  cueCard?: string;
  sampleAnswer?: string;
}

export interface AdminCreateQuestionRequest {
  questionNumber: number;
  questionType: BEQuestionType;
  questionText?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

export const examsApi = {
  getAll: async (params?: { type?: string; search?: string; page?: number; size?: number }): Promise<ApiResponse<PageResponse<TestListDTO>>> => {
    const response = await axiosInstance.get<ApiResponse<PageResponse<TestListDTO>>>('/exams', { params });
    return response.data;
  },

  getById: async (id: string | number, hideAnswers = true): Promise<ApiResponse<TestDetailDTO>> => {
    const response = await axiosInstance.get<ApiResponse<TestDetailDTO>>(`/exams/${id}`, {
      params: { hideAnswers },
    });
    return response.data;
  },

  submit: async (id: string | number, request: TestSubmitRequest): Promise<ApiResponse<PracticeHistoryDTO>> => {
    const response = await axiosInstance.post<ApiResponse<PracticeHistoryDTO>>(`/exams/${id}/submit`, request);
    return response.data;
  },

  seedDemoExams: async (): Promise<ApiResponse<string>> => {
    const response = await axiosInstance.post<ApiResponse<string>>('/exams/seed');
    return response.data;
  },

  // ─── Admin CRUD ─────────────────────────────────────────────────────────────

  admin: {
    createTest: async (data: AdminCreateTestRequest): Promise<ApiResponse<TestDetailDTO>> => {
      const response = await axiosInstance.post<ApiResponse<TestDetailDTO>>('/admin/exams', data);
      return response.data;
    },

    updateTest: async (id: number, data: Partial<AdminCreateTestRequest>): Promise<ApiResponse<TestDetailDTO>> => {
      const response = await axiosInstance.put<ApiResponse<TestDetailDTO>>(`/admin/exams/${id}`, data);
      return response.data;
    },

    deleteTest: async (id: number): Promise<ApiResponse<string>> => {
      const response = await axiosInstance.delete<ApiResponse<string>>(`/admin/exams/${id}`);
      return response.data;
    },

    createSection: async (testId: number, data: AdminCreateSectionRequest): Promise<ApiResponse<TestSectionDTO>> => {
      const response = await axiosInstance.post<ApiResponse<TestSectionDTO>>(`/admin/exams/${testId}/sections`, data);
      return response.data;
    },

    updateSection: async (sectionId: number, data: Partial<AdminCreateSectionRequest>): Promise<ApiResponse<TestSectionDTO>> => {
      const response = await axiosInstance.put<ApiResponse<TestSectionDTO>>(`/admin/exams/sections/${sectionId}`, data);
      return response.data;
    },

    deleteSection: async (sectionId: number): Promise<ApiResponse<string>> => {
      const response = await axiosInstance.delete<ApiResponse<string>>(`/admin/exams/sections/${sectionId}`);
      return response.data;
    },

    createQuestion: async (sectionId: number, data: AdminCreateQuestionRequest): Promise<ApiResponse<TestQuestionDTO>> => {
      const response = await axiosInstance.post<ApiResponse<TestQuestionDTO>>(`/admin/exams/sections/${sectionId}/questions`, data);
      return response.data;
    },

    updateQuestion: async (questionId: number, data: Partial<AdminCreateQuestionRequest>): Promise<ApiResponse<TestQuestionDTO>> => {
      const response = await axiosInstance.put<ApiResponse<TestQuestionDTO>>(`/admin/exams/questions/${questionId}`, data);
      return response.data;
    },

    deleteQuestion: async (questionId: number): Promise<ApiResponse<string>> => {
      const response = await axiosInstance.delete<ApiResponse<string>>(`/admin/exams/questions/${questionId}`);
      return response.data;
    },
  },
};


