"use client";

import { createContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import * as authService from "@/services/authService";
import { 
  User, 
  AuthResponse, 
  VerifyOTPResponse, 
  MessageResponse, 
  SessionsResponse 
} from "@/types/auth"; 

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  resetToken: string | null;
  isLoading: boolean;
  requestOTP: (phone: string) => Promise<MessageResponse>;
  verifyOTP: (phone: string, otp: string) => Promise<VerifyOTPResponse>;
  loginWithPassword: (phone: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  setPassword: (password: string) => Promise<void>;
  getSessions: () => Promise<SessionsResponse>;
  revokeSession: (id: string) => Promise<MessageResponse>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const storedAccess = sessionStorage.getItem("accessToken");
    const storedRefresh = sessionStorage.getItem("refreshToken");
    const storedReset = sessionStorage.getItem("resetToken");

    if (storedUser && storedAccess && storedRefresh) {
      try {
        setUser(JSON.parse(storedUser));
        setAccessToken(storedAccess);
        setRefreshToken(storedRefresh);
      } catch (e) {
        console.error("Failed to parse user from storage:", e);
        sessionStorage.clear();
      }
    }
    if (storedReset) {
      setResetToken(storedReset);
    }
    setIsLoading(false);
  }, []);

  const requestOTP = useCallback(async (phone: string): Promise<MessageResponse> => {
    return authService.requestOTP(phone);
  }, []);

  const verifyOTP = useCallback(async (phone: string, otp: string): Promise<VerifyOTPResponse> => {
    const data = await authService.verifyOTP(phone, otp);
    setResetToken(data.resetToken);
    sessionStorage.setItem("resetToken", data.resetToken);
    return data;
  }, []);

  const loginWithPassword = useCallback(async (phone: string, password: string): Promise<AuthResponse> => {
    const data = await authService.loginWithPassword(phone, password);
    setUser(data.user);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);

    sessionStorage.setItem("user", JSON.stringify(data.user));
    sessionStorage.setItem("accessToken", data.accessToken);
    sessionStorage.setItem("refreshToken", data.refreshToken);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setResetToken(null);
      sessionStorage.clear();
    }
  }, [refreshToken]);

  const setPassword = useCallback(async (password: string): Promise<void> => {
    if (!resetToken) throw new Error("Reset token not found");
    await authService.setPassword(password, resetToken);
    setResetToken(null);
    sessionStorage.removeItem("resetToken");
  }, [resetToken]);

  const getSessions = useCallback(async (): Promise<SessionsResponse> => {
    return authService.getSessions();
  }, []);

  const revokeSession = useCallback(async (id: string): Promise<MessageResponse> => {
    return authService.revokeSession(id);
  }, []);

  const value = useMemo(() => ({
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
    revokeSession
  }), [
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
    revokeSession
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
