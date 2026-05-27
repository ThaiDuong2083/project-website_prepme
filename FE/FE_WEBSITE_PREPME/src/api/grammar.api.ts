import api from './index';

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
  // Lấy danh sách topics kèm progress sơ bộ
  getTopics: async () => {
    const res = await api.get<GrammarTopic[]>('/v1/grammar/topics');
    return res.data;
  },

  // Lấy danh sách câu hỏi cho 1 phiên practice
  getPracticeQuestions: async (topicId: number, limit: number = 20) => {
    const res = await api.get<PracticeQuestion[]>(`/v1/grammar/topics/${topicId}/questions?limit=${limit}`);
    return res.data;
  },

  // Submit kết quả 1 câu hỏi
  submitPracticeResult: async (data: GrammarSubmitRequest) => {
    const res = await api.post<void>('/v1/grammar/submit', data);
    return res.data;
  },

  // Lấy toàn bộ progress để vẽ màn "Tiến độ ngữ pháp"
  getGrammarProgress: async () => {
    const res = await api.get<TopicProgressDetailsResponse[]>('/v1/grammar/progress');
    return res.data;
  }
};
