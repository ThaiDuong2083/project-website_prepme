import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL } from '@constants/env.constants';
import { API_TIMEOUT } from '@constants/app.constants';
import { storage } from '@utils/storage.utils';
import { useAuthStore } from '@store/auth.store';
import toast from 'react-hot-toast';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor ────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ───────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message ?? 'Something went wrong';

    if (status === 401) {
      // Token expired — logout
      useAuthStore.getState().logout();
    } else if (status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (status === 500) {
      toast.error('Server error. Please try again later.');
    } else if (status !== 422) {
      // Don't toast validation errors (422) — let forms handle them
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
