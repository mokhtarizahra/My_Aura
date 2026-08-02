export type UserRole = "athlete" | "sportsComplex_admin" | "super_admin";

export type UserStatus = "active" | "inactive" | "suspended" | "pending_verification";

export interface User {
  id: string;
  name?: string;
  phone: string;
  email?: string;
  avatar?: string; // nullable
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  clinicId?: string; // برای نقش athlete یا sportsComplex_admin
  lastLogin?: string; // ISO date
  createdAt: string;
  updatedAt: string;
}

// ========== احراز هویت ==========
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type AuthResponse = 
  | {
      success: true;
      accessToken: string;
      refreshToken: string;
      user: User;
    }
  | {
      success: false;
      message: string;
      accessToken?: never;
      refreshToken?: never;
      user?: never;
    };

// ========== درخواست‌ها ==========
export type RequestOTPInput = {
  phone: string;
};

export type VerifyOTPInput = {
  phone: string;
  otp: string;
};

export type LoginInput = {
  phone: string;
  password: string;
};

export type SetPasswordInput = {
  password: string;
};

// ========== پاسخ‌های خاص ==========
export type VerifyOTPResponse = {
  success: true;
  resetToken: string;
  user: { id: string; phone: string };
};

export type SessionsResponse = {
  sessions: Session[];
};

export type MessageResponse = {
  success: boolean;
  message: string;
};

export type RefreshTokenResponse = {
  success: boolean;
  accessToken: string;
  refreshToken: string;
};

// ========== سایر موجودیت‌ها ==========
export interface Session {
  _id: string;
  user: string;
  userAgent?: string;
  ip?: string;
  isValid: boolean;
  createdAt: string;
  updatedAt: string;
};

// ========== Context ==========
export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  resetToken: string | null;
  isLoading: boolean;
  requestOTP: (phone: string) => Promise<MessageResponse>;
  verifyOTP: (phone: string, otp: string) => Promise<VerifyOTPResponse>;
  resendOTP: (phone: string) => Promise<MessageResponse>;
  loginWithPassword: (phone: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  setPassword: (password: string) => Promise<void>;
  getSessions: () => Promise<SessionsResponse>;
  revokeSession: (id: string) => Promise<MessageResponse>;
}
