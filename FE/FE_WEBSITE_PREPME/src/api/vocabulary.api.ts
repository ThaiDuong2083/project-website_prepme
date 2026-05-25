import axiosInstance from '@lib/axios.lib';
import type { ApiResponse } from '@types';

export interface CategoryDTO {
  id: number;
  name: string;
  slug: string;
  type: 'VOCAB_SET' | 'VOCAB_TOPIC' | 'GRAMMAR' | 'OTHER';
  parentId: number | null;
  wordCount?: number;
  description?: string;
  status?: 'NOT_LEARNED' | 'LEARNING' | 'LEARNED';
}

export interface VocabularyWordDTO {
  id: number;
  word: string;
  wordType: string;
  pronunciation: string;
  meaning: string;
  exampleEn: string;
  exampleVi: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  categoryId: number;
  categoryName: string;
  categoryPath: string;
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


export const vocabularyApi = {
  getVocabSets: async () => {
    const res = await axiosInstance.get<ApiResponse<CategoryDTO[]>>('/vocabulary/sets');
    return res.data;
  },

  getTopics: async (setId: number) => {
    const res = await axiosInstance.get<ApiResponse<CategoryDTO[]>>(`/vocabulary/sets/${setId}/topics`);
    return res.data;
  },

  getWords: async (params: {
    topicIds: number[];
    level?: string;
    page?: number;
    size?: number;
    shuffle?: boolean;
  }) => {
    const res = await axiosInstance.get<ApiResponse<PageResponse<VocabularyWordDTO>>>('/vocabulary/words', {
      params: { ...params, topicIds: params.topicIds.join(',') },
    });
    return res.data;
  },

  getFlashcardSession: async (topicIds: number[], shuffle?: boolean) => {
    const res = await axiosInstance.get<ApiResponse<VocabularyWordDTO[]>>('/vocabulary/flashcard', {
      params: { topicIds: topicIds.join(','), shuffle: shuffle ?? false },
    });
    return res.data;
  },

  startLearning: async (topicIds: number[]) => {
    const res = await axiosInstance.post<ApiResponse<{ updatedCount: number; topicIds: number[]; status: string }>>(
      '/vocabulary/topics/start-learning',
      null,
      { params: { topicIds: topicIds.join(',') } }
    );
    return res.data;
  },

  searchByKeyword: async (keyword: string) => {
    const res = await axiosInstance.get<ApiResponse<VocabularyWordDTO[]>>(
      '/vocabulary/search',
      {
        params: { keyword }
      }
    );
    return res.data;
  }
};
