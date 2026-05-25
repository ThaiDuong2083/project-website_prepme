export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',

  // Error pages
  FORBIDDEN: '/403',
  NOT_FOUND: '/404',
  SERVER_ERROR: '/500',

  // User routes
  USER: {
    DASHBOARD: '/dashboard',
    EXAMS: '/exams',
    EXAM_DETAIL: '/exams/:examId',
    EXAM_TAKE: '/exams/:examId/take',
    EXAM_RESULT: '/exams/:examId/result/:attemptId',
    LEADERBOARD: '/leaderboard',
    SETTINGS: '/settings',
    COURSES: '/courses',
    HISTORY: '/history',
    AI_ASSISTANT: '/ai-assistant',
  },

  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    USER_DETAIL: '/admin/users/:userId',
    COURSES: '/admin/courses',
    COURSE_DETAIL: '/admin/courses/:courseId',
    EXAMS: '/admin/exams',
    EXAM_DETAIL: '/admin/exams/:examId',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings',
  },
} as const;
