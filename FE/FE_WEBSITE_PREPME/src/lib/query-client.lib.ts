import { QueryClient } from '@tanstack/react-query';
import { QUERY_STALE_TIME, QUERY_CACHE_TIME } from '@constants/app.constants';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME,
      gcTime: QUERY_CACHE_TIME,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
