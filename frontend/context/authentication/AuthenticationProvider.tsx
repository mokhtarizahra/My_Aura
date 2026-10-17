'use client';

import axios from 'axios';

import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { storage } from '@/lib/storage';
import * as authService from '@/services/authentication/auth.Service';
import * as sessionService from '@/services/authentication/session.service';
import {
  AccountType,
  AuthContextType,
  AuthResponse,
  IdentifierType,
  MessageResponse,
  Session,
  SessionsResponse,
} from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Bootstrap: restore session on mount ────────────────────────
  useEffect(() => {
    const bootstrap = async () => {
      const storedSession = storage.getSession();
      const storedAccess = storage.getAccessToken();

      if (storedSession && storedAccess) {
        setSession(storedSession);
        setAccessToken(storedAccess);
      } else if (
        typeof window !== 'undefined' &&
        document.cookie.includes('isLoggedIn=1')
      ) {
        try {
          const res = await axios.post(
            `${API_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );
          const { accessToken: newAccessToken } = res.data.data;
          setAccessToken(newAccessToken);
          storage.setAccessToken(newAccessToken);
        } catch {
          storage.clear();
          document.cookie = 'isLoggedIn=; path=/; max-age=0';
          document.cookie = 'accountType=; path=/; max-age=0';
        }
      }

      setIsLoading(false);
    };

    bootstrap();
  }, []);

  // ─── Listen for token refresh events ────────────────────────────
  useEffect(() => {
    const handleTokensRefreshed = (event: Event) => {
      const { accessToken } = (event as CustomEvent).detail;
      setAccessToken(accessToken);
    };

    window.addEventListener('tokensRefreshed', handleTokensRefreshed);

    return () => {
      window.removeEventListener('tokensRefreshed', handleTokensRefreshed);
    };
  }, []);

  // ─── Helper: store auth result ──────────────────────────────────
  const persistAuth = useCallback(
  (data: AuthResponse) => {
    if (!data.success) return;

    setSession(data.data.session);
    setAccessToken(data.data.accessToken);

    storage.setSession(data.data.session);
    storage.setAccessToken(data.data.accessToken);

    document.cookie = `isLoggedIn=1; path=/; max-age=604800`;
    document.cookie = `accountType=${data.data.session.accountType}; path=/; max-age=604800`;
  },
  []
);
  // ─── Login ──────────────────────────────────────────────────────
  const loginWithPassword = useCallback(
    async (
      identifier: string,
      password: string,
      identifierType: IdentifierType = 'phone',
      accountType: AccountType = 'personal'
    ): Promise<AuthResponse> => {
      const data = await authService.loginWithPassword(
        identifier,
        password,
        identifierType,
        accountType
      );

      persistAuth(data);

      return data;
    },
    [persistAuth]
  );

  // ─── Register ───────────────────────────────────────────────────
  const register = useCallback(
    async (
      verificationToken: string,
      firstName: string,
      lastName: string,
      password: string
    ): Promise<AuthResponse> => {
      const data = await authService.register(
        verificationToken,
        firstName,
        lastName,
        password
      );

      persistAuth(data);

      return data;
    },
    [persistAuth]
  );

  // ─── Logout ─────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore — clean up locally regardless
    } finally {
      setSession(null);
      setAccessToken(null);
      storage.clear();

      document.cookie =
        'isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie =
        'accountType=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  }, []);

  // ─── Sessions ───────────────────────────────────────────────────
  const getSessions = useCallback(async (): Promise<SessionsResponse> => {
    return sessionService.getSessions();
  }, []);

  const revokeSession = useCallback(async (): Promise<MessageResponse> => {
    return sessionService.revokeSession();
  }, []);

  const revokeAllSessions = useCallback(
    async (): Promise<MessageResponse> => {
      return sessionService.revokeAllSessions();
    },
    []
  );

  // ─── Context value ──────────────────────────────────────────────
  const value = useMemo(
    () => ({
      session,
      accessToken,
      isLoading,
      loginWithPassword,
      register,
      logout,
      getSessions,
      revokeSession,
      revokeAllSessions,
    }),
    [
      session,
      accessToken,
      isLoading,
      loginWithPassword,
      register,
      logout,
      getSessions,
      revokeSession,
      revokeAllSessions,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};