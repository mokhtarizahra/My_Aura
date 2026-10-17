import { Session } from '@/types/auth';

const SESSION_KEY = 'session';
const ACCESS_TOKEN_KEY = 'accessToken';
const RESET_TOKEN_KEY = 'resetToken';
const ACCOUNT_TYPE_KEY = 'accountType';

export const storage = {
  // ─── Session ──────────────────────────────────────────────
  getSession: (): Session | null => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch (e) {
      console.error('Failed to parse session from storage', e);
      return null;
    }
  },

  setSession: (session: Session) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  // ─── Account Type ─────────────────────────────────────────
  getAccountType: (): string | null => {
    const session = storage.getSession();
    return session?.accountType || null;
  },

  // ─── Access Token ─────────────────────────────────────────
  getAccessToken: (): string | null =>
    sessionStorage.getItem(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string) =>
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token),
  removeAccessToken: () => {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  // ─── Reset Token (password reset flow) ────────────────────
  getResetToken: (): string | null =>
    sessionStorage.getItem(RESET_TOKEN_KEY),
  setResetToken: (token: string) =>
    sessionStorage.setItem(RESET_TOKEN_KEY, token),
  removeResetToken: () => {
    sessionStorage.removeItem(RESET_TOKEN_KEY);
  },

  // ─── Clear all ────────────────────────────────────────────
  clear: () => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(RESET_TOKEN_KEY);
    sessionStorage.removeItem(ACCOUNT_TYPE_KEY);
  },
};