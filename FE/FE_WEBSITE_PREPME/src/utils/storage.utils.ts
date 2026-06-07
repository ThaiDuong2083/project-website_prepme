import { TOKEN_KEY } from '@constants/app.constants';

export const storage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  removeToken: (): void => localStorage.removeItem(TOKEN_KEY),

  clear: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },
};
