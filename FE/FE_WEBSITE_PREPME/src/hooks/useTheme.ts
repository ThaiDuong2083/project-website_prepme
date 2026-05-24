import { useAppStore } from '@store/app.store';

export const useTheme = () => {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  return { theme, setTheme, toggleTheme, isDark: theme === 'dark' };
};
