import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { THEME_KEY } from '@constants/app.constants';
import type { Theme } from '@types';

interface AppStore {
  theme: Theme;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleSidebarCollapsed: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      sidebarOpen: true,
      sidebarCollapsed: false,

      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },

      toggleTheme: () => {
        const next: Theme = get().theme === 'light' ? 'dark' : 'light';
        get().setTheme(next);
      },

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    {
      name: THEME_KEY,
      partialize: (state) => ({ theme: state.theme, sidebarCollapsed: state.sidebarCollapsed }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.classList.toggle('dark', state.theme === 'dark');
        }
      },
    },
  ),
);
