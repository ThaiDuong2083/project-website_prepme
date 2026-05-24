export const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'PrepMe';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? '1.0.0';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';
export const APP_ENV = import.meta.env.VITE_APP_ENV ?? 'development';
export const IS_DEV = APP_ENV === 'development';
