import axiosInstance from '@lib/axios.lib';
import type { ApiResponse } from '@types';

export type WeakSkill = 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING';

export interface SurveyRequest {
  ieltsTarget: number;
  currentLevel?: number;
  weakSkills: WeakSkill[];
}

export interface UserGoalsResponse {
  ieltsTarget?: number;
  currentLevel?: number;
  weakSkills?: WeakSkill[];
  surveyCompleted: boolean;
}

export interface UpdateGoalsRequest {
  ieltsTarget?: number;
  currentLevel?: number;
  weakSkills?: WeakSkill[];
}

export const surveyApi = {
  submitSurvey: async (payload: SurveyRequest): Promise<ApiResponse<UserGoalsResponse>> => {
    const response = await axiosInstance.post<ApiResponse<UserGoalsResponse>>('/survey/readiness', payload);
    return response.data;
  },
  getGoals: async (): Promise<ApiResponse<UserGoalsResponse>> => {
    const response = await axiosInstance.get<ApiResponse<UserGoalsResponse>>('/survey/goals');
    return response.data;
  },
  updateGoals: async (payload: UpdateGoalsRequest): Promise<ApiResponse<UserGoalsResponse>> => {
    const response = await axiosInstance.put<ApiResponse<UserGoalsResponse>>('/survey/goals', payload);
    return response.data;
  },
};
