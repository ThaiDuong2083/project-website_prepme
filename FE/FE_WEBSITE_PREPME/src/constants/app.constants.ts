export const TOKEN_KEY = 'prepme_access_token';
export const USER_KEY = 'prepme_user';
export const THEME_KEY = 'prepme_theme';

export const API_TIMEOUT = 15000; // 15s
export const API_RETRY_COUNT = 1;

export const QUERY_STALE_TIME = 1000 * 60 * 5; // 5 min
export const QUERY_CACHE_TIME = 1000 * 60 * 10; // 10 min

export const TOAST_DURATION = 4000;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;
export const DEFAULT_PAGE = 0;

export const IELTS_BAND_MIN = 0;
export const IELTS_BAND_MAX = 9;

export const MODULE_COLORS = {
  LISTENING: '#6366f1',
  READING: '#0ea5e9',
  WRITING: '#f59e0b',
  SPEAKING: '#10b981',
} as const;

export const MODULE_LABELS = {
  LISTENING: 'Listening',
  READING: 'Reading',
  WRITING: 'Writing',
  SPEAKING: 'Speaking',
} as const;

export const DIFFICULTY_COLORS = {
  BEGINNER: '#10b981',
  INTERMEDIATE: '#f59e0b',
  ADVANCED: '#ef4444',
} as const;
