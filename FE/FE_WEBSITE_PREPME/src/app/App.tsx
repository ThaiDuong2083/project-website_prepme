import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@lib/query-client.lib';
import { AppRouter } from './router';
import { ErrorBoundary } from '@components/shared/ErrorBoundary';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { TOAST_DURATION } from '@constants/app.constants';
import { IS_DEV, GOOGLE_CLIENT_ID } from '@constants/env.constants';
import { useAuthStore } from '@store/auth.store';

export const App = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const incrementVisit = useAuthStore((s) => s.incrementVisit);

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchProfile().catch(() => {});
    }
  }, [isAuthenticated, user, fetchProfile]);

  useEffect(() => {
    if (isAuthenticated) {
      const visited = sessionStorage.getItem('visited_session');
      if (!visited) {
        incrementVisit().then(() => {
          sessionStorage.setItem('visited_session', 'true');
        });
      }
    }
  }, [isAuthenticated, incrementVisit]);

  return (
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <QueryClientProvider client={queryClient}>
          <AppRouter />

        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          gutter={8}
          containerStyle={{ top: 80 }}
          toastOptions={{
            duration: TOAST_DURATION,
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '12px',
              padding: '12px 16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
              style: {
                background: '#f0fdf4',
                color: '#166534',
                border: '1px solid #bbf7d0',
              },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
              style: {
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
              },
            },
          }}
        />

        {/* Dev tools */}
        {IS_DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
};
