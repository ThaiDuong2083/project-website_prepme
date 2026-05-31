import axiosInstance from '@lib/axios.lib';
import type { ApiResponse } from '@types';

export interface GrammarTopic {
  id: number;
  name: string;
  done: number;
  total: number;
  accuracy: number;
}

export interface PracticeQuestion {
  id: number;
  topicId: number;
  text: string;
  options: string[];
  answer: string;
  explanation: string;
  translation: string;
  vocabulary: { word: string; meaning: string }[];
}

export interface GrammarSubmitRequest {
  questionId: number;
  selectedAnswer: string;
}

export interface GrammarProgressHistoryResponse {
  id: number;
  questionText: string;
  done: number;
  correct: number;
  accuracy: number;
  recentChoices: string[];
}

export interface TopicProgressDetailsResponse {
  id: number;
  name: string;
  done: number;
  total: number;
  accuracy: number;
  questions: GrammarProgressHistoryResponse[];
}

export interface GrammarTopicCategory {
  id: number;
  name: string;
  description: string;
}

export interface AiGrammarQuestionDTO {
  id?: number;
  topicId: number;
  questionText: string;
  options: string[];
  answer: string;
  explanation: string;
  translation: string;
  vocabulary?: { word: string; meaning: string }[];
}

export const grammarApi = {
  getTopics: async (userId: number) => {
    const res = await axiosInstance.get<ApiResponse<GrammarTopic[]>>('/grammar/topics', { params: { userId } });
    return res.data;
  },

  getPracticeQuestions: async (topicId: number, limit: number = 20) => {
    const res = await axiosInstance.get<ApiResponse<PracticeQuestion[]>>(`/grammar/topics/${topicId}/questions`, { params: { limit } });
    return res.data;
  },

  submitPracticeResult: async (userId: number, data: GrammarSubmitRequest) => {
    const res = await axiosInstance.post<ApiResponse<void>>('/grammar/submit', data, { params: { userId } });
    return res.data;
  },

  getGrammarProgress: async (userId: number) => {
    const res = await axiosInstance.get<ApiResponse<TopicProgressDetailsResponse[]>>('/grammar/progress', { params: { userId } });
    return res.data;
  },

  // ── AI Grammar Generation ──────────────────────────────────────────────────
  getAiTopics: async () => {
    const res = await axiosInstance.get<ApiResponse<GrammarTopicCategory[]>>('/admin/grammar/ai/topics');
    return res.data;
  },

  aiGenerate: async (payload: { prompt: string; topicId: number }) => {
    const res = await axiosInstance.post<ApiResponse<AiGrammarQuestionDTO[]>>(
      '/admin/grammar/ai/generate',
      payload,
      { timeout: 120_000 },
    );
    return res.data;
  },

  aiSave: async (payload: { questions: AiGrammarQuestionDTO[]; topicId: number }) => {
    const res = await axiosInstance.post<ApiResponse<{ savedCount: number; topicId: number; topicName: string }>>(
      '/admin/grammar/ai/save',
      payload,
    );
    return res.data;
  },
};
