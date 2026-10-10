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
import * as authService from '@/services/authentication/auth.Service';
import {
  AuthContextType,
  AuthResponse,
  MessageResponse,
  SessionsResponse,
  User,
  VerifyOTPResponse,
} from '@/types/auth';

import axios from 'axios';
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  const bootstrap = async () => {
    const storedUser = storage.getUser();
    const storedAccess = storage.getAccessToken();
    const storedReset = storage.getResetToken();

    if (storedUser && storedAccess) {
      setUser(storedUser);
      setAccessToken(storedAccess);
    } else if (typeof window !== 'undefined' && document.cookie.includes('isLoggedIn=1')) {
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
        document.cookie = 'userRole=; path=/; max-age=0';
      }
    }

    if (storedReset) setResetToken(storedReset);
    setIsLoading(false);
  };

  bootstrap();
}, []);

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

      setUser(safeUser);
      setAccessToken(safeAccess);

      if (safeUser) storage.setUser(safeUser);
      if (safeAccess) storage.setAccessToken(safeAccess);

      // Cookies for Next.js middleware (existence-only, not for authentication)
document.cookie = `isLoggedIn=1; path=/; max-age=604800`;
document.cookie = `userRole=${safeUser?.role || ''}; path=/; max-age=604800`;

      return data;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
       await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setResetToken(null);
      storage.clear();

      document.cookie =
  'isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
document.cookie =
  'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    }
  }, []);

  const setPassword = useCallback(
    async (password: string): Promise<void> => {
      if (!resetToken) throw new Error('Reset token not found');
      const data = await authService.setPassword(password, resetToken);

      const safeUser = data.user ?? null;
      const safeAccess = data.accessToken ?? null;

      setUser(safeUser);
      setAccessToken(safeAccess);

      if (safeUser) storage.setUser(safeUser);
      if (safeAccess) storage.setAccessToken(safeAccess);

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

  const resendOTP = useCallback(
    async (phone: string): Promise<MessageResponse> => {
      return authService.resendOTP(phone);
    },
    []
  );

  const value = useMemo(
    () => ({
      user,
      accessToken,
      resetToken,
      isLoading,
      requestOTP,
      verifyOTP,
      resendOTP, 
      loginWithPassword,
      logout,
      setPassword,
      getSessions,
      revokeSession,
    }),
    [
      user,
      accessToken,
      resetToken,
      isLoading,
      requestOTP,
      verifyOTP,
      resendOTP, 
      loginWithPassword,
      logout,
      setPassword,
      getSessions,
      revokeSession,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
