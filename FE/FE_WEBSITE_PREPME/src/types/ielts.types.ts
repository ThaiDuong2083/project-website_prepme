export type IeltsModule = 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING';

export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type ExamStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE_NOT_GIVEN'
  | 'FILL_IN_THE_BLANK'
  | 'MATCHING'
  | 'SHORT_ANSWER'
  | 'ESSAY';

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  module: IeltsModule;
  difficulty: DifficultyLevel;
  totalLessons: number;
  completedLessons?: number;
  duration: number; // minutes
  instructor: string;
  rating: number;
  enrollmentCount: number;
  isEnrolled?: boolean;
  price?: number;
  isFree: boolean;
  createdAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  duration: number;
  videoUrl?: string;
  contentUrl?: string;
  isCompleted?: boolean;
  isLocked?: boolean;
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  module: IeltsModule;
  difficulty: DifficultyLevel;
  duration: number; // seconds
  totalQuestions: number;
  passingScore: number;
  status: ExamStatus;
  startTime?: string;
  endTime?: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  userId: string;
  score: number;
  band: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  status: 'PASSED' | 'FAILED';
  completedAt: string;
}

export interface StudyProgress {
  userId: string;
  totalStudyTime: number;
  currentStreak: number;
  longestStreak: number;
  coursesCompleted: number;
  examsCompleted: number;
  averageBand: number;
  moduleProgress: Record<IeltsModule, number>;
  weeklyGoal: number;
  weeklyProgress: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  avatarUrl?: string;
  score: number;
  band: number;
  examsCompleted: number;
}
