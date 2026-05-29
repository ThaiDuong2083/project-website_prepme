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
  }
};
