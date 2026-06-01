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

// ─── Backend DTO mappings ───────────────────────────────────────────────────
export type BEExamType = 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING' | 'IELTS';

export type BEQuestionType =
  | 'TRUE_FALSE_NOT_GIVEN'
  | 'YES_NO_NOT_GIVEN'
  | 'MATCHING_HEADINGS'
  | 'MULTIPLE_CHOICE'
  | 'FILL_IN_THE_BLANK'
  | 'SHORT_ANSWER';

export interface TestListDTO {
  id: number;
  title: string;
  examType: BEExamType;
  duration: number; // in seconds
  description?: string;
  sectionCount: number;
  questionCount: number;
  createdAt: string;
  isPro?: boolean;
}

export interface TestQuestionDTO {
  id: number;
  questionNumber: number;
  questionType: BEQuestionType;
  questionText: string;
  imageUrl?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

export interface TestSectionDTO {
  id: number;
  sectionNumber: number;
  title?: string;
  passage?: string;
  cueCard?: string;
  audioUrl?: string;
  sampleAnswer?: string;
  questions: TestQuestionDTO[];
}

export interface TestDetailDTO {
  id: number;
  title: string;
  examType: BEExamType;
  duration: number; // in seconds
  audioUrl?: string;
  description?: string;
  sections: TestSectionDTO[];
  childTests?: TestDetailDTO[];
  isPro?: boolean;
  questionCount: number;
}

export interface TestSubmitRequest {
  answers: Record<string, string>;
  submissionContent?: string;
  recordingUrl?: string;
  completionTime: number; // in seconds
  status?: 'DRAFT' | 'COMPLETED';
}

export interface PracticeHistoryDTO {
  id: number;
  userId: number;
  testId?: number;
  testTitle?: string;
  skillType: BEExamType;
  score?: number;
  completionTime?: number; // in seconds
  answers?: Record<string, string>;
  submissionContent?: string;
  recordingUrl?: string;
  aiAnalysis?: string;
  status: 'DRAFT' | 'COMPLETED';
  createdAt: string;
}

export interface PracticeStatisticsDTO {
  totalPracticeCount: number;
  averageScore?: number;
  skillAverages?: Record<string, number>;
  dailyHistory?: Record<string, number>;
}

