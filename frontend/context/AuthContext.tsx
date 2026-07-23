'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { storage } from '@/lib/storage';
import * as authService from '@/services/authService';
import {
  AuthContextType,
  AuthResponse,
  MessageResponse,
  SessionsResponse,
  User,
  VerifyOTPResponse,
} from '@/types/auth';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = storage.getUser();
    const storedAccess = storage.getAccessToken();
    const storedRefresh = storage.getRefreshToken();
    const storedReset = storage.getResetToken();

    if (storedUser && storedAccess && storedRefresh) {
      try {
        setUser(storedUser);
        setAccessToken(storedAccess);
        setRefreshToken(storedRefresh);
      } catch (e) {
        console.error('Failed to parse user from storage:', e);
        storage.clear();
      }
    }
    if (storedReset) {
      setResetToken(storedReset);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleTokensRefreshed = (event: Event) => {
      const { accessToken, refreshToken } = (event as CustomEvent).detail;
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
    };

    window.addEventListener('tokensRefreshed', handleTokensRefreshed);

    return () => {
      window.removeEventListener('tokensRefreshed', handleTokensRefreshed);
    };
  }, []);

  const requestOTP = useCallback(
    async (phone: string): Promise<MessageResponse> => {
      return authService.requestOTP(phone);
    },
    []
  );

  const verifyOTP = useCallback(
    async (phone: string, otp: string): Promise<VerifyOTPResponse> => {
      const data = await authService.verifyOTP(phone, otp);
      setResetToken(data.resetToken);
      storage.setResetToken(data.resetToken);
      return data;
    },
    []
  );

  const loginWithPassword = useCallback(
    async (phone: string, password: string): Promise<AuthResponse> => {
      const data = await authService.loginWithPassword(phone, password);

      const safeUser = data.user ?? null;
      const safeAccess = data.accessToken ?? null;
      const safeRefresh = data.refreshToken ?? null;

      setUser(safeUser);
      setAccessToken(safeAccess);
      setRefreshToken(safeRefresh);

      if (safeUser) storage.setUser(safeUser);
      if (safeAccess) storage.setAccessToken(safeAccess);
      if (safeRefresh) storage.setRefreshToken(safeRefresh);

      // Cookies are set by the backend (no manual intervention needed)
      document.cookie = `accessToken=${safeAccess}; path=/; max-age=900`;
      document.cookie = `userRole=${safeUser?.role || ''}; path=/; max-age=604800`;

      return data;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      const token = storage.getRefreshToken();
      if (token) await authService.logout(token);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setResetToken(null);
      storage.clear();

      document.cookie =
        'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie =
        'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  }, [refreshToken]);

  const setPassword = useCallback(
    async (password: string): Promise<void> => {
      if (!resetToken) throw new Error('Reset token not found');
      const data = await authService.setPassword(password, resetToken);

      const safeUser = data.user ?? null;
      const safeAccess = data.accessToken ?? null;
      const safeRefresh = data.refreshToken ?? null;

      setUser(safeUser);
      setAccessToken(safeAccess);
      setRefreshToken(safeRefresh);

      if (safeUser) storage.setUser(safeUser);
      if (safeAccess) storage.setAccessToken(safeAccess);
      if (safeRefresh) storage.setRefreshToken(safeRefresh);

      setResetToken(null);
      storage.removeResetToken();
    },
    [resetToken]
  );

  const getSessions = useCallback(async (): Promise<SessionsResponse> => {
    return authService.getSessions();
  }, []);

  const revokeSession = useCallback(
    async (id: string): Promise<MessageResponse> => {
      return authService.revokeSession(id);
    },
    []
  );

  const value = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      resetToken,
      isLoading,
      requestOTP,
      verifyOTP,
      loginWithPassword,
      logout,
      setPassword,
      getSessions,
      revokeSession,
    }),
    [
      user,
      accessToken,
      refreshToken,
      resetToken,
      isLoading,
      requestOTP,
      verifyOTP,
      loginWithPassword,
      logout,
      setPassword,
      getSessions,
      revokeSession,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
