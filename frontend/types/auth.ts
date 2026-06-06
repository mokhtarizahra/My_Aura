export type UserRole = "user" | "admin";

export type UserStatus = "active" | "inactive" | "suspended";

export type User = {
  id: string;
  name?: string;
  phone: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = {
  success: true;
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type RequestOTPInput = {
  phone: string;
};

export type VerifyOTPInput = {
  phone: string;
  otp: string;
};

export type VerifyOTPResponse = {
  success: true;
  resetToken: string;
  user: { id: string; phone: string };
};

export type LoginInput = {
  phone: string;
  password: string;
};

export type SetPasswordInput = {
  password: string;
};

export type Session = {
  _id: string;
  user: string;
  userAgent?: string;
  ip?: string;
  isValid: boolean;
  createdAt: string;
  updatedAt: string;
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
