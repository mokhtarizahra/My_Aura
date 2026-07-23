import { User } from '@/types/auth';

const USER_KEY = 'user';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const RESET_TOKEN_KEY = 'resetToken';
const USER_ROLE_KEY = 'userRole';

export const storage = {
  // User Management
  getUser: (): User | null => {
    try {
      const raw = sessionStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch (e) {
      console.error('Failed to parse user from storage', e);
      return null;
    }
  },

  setUser: (user: User) => {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Role Management
  getUserRole: (): string | null => {
    const user = storage.getUser();
    return user?.role || null;
  },

  // Token Management
  getAccessToken: (): string | null => sessionStorage.getItem(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string) =>
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token),

  getRefreshToken: (): string | null =>
    sessionStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) =>
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token),

  getResetToken: (): string | null => sessionStorage.getItem(RESET_TOKEN_KEY),
  setResetToken: (token: string) =>
    sessionStorage.setItem(RESET_TOKEN_KEY, token),

  clear: () => {
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(RESET_TOKEN_KEY);
    sessionStorage.removeItem(USER_ROLE_KEY);
  },
};
