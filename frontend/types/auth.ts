// ─────────────────────────────────────────────────────────────────
// Account Types & Status
// ─────────────────────────────────────────────────────────────────

/**
 * Backend account type.
 * Personal: normal user
 * Organization: sports complex / club
 * Staff: platform staff member
 */
export type AccountType = 'personal' | 'organization' | 'staff';

/**
 * Backend account status.
 */
export type AccountStatus = 'pending' | 'active' | 'inactive' | 'suspended';

/**
 * Identifier types accepted by the backend.
 */
export type IdentifierType = 'phone' | 'email';

/**
 * OTP purposes.
 */
export type OTPPurpose = 'registration' | 'password_reset';

// ─────────────────────────────────────────────────────────────────
// Session
// ─────────────────────────────────────────────────────────────────

/**
 * Refresh-token session as returned by the backend.
 *
 * The backend stores sessions alongside refresh tokens
 * and returns the full session object on login and registration.
 */
export interface Session {
  _id: string;
  accountId: string;
  accountType: AccountType;
  userAgent?: string;
  ip?: string;
  expiresAt: string;
  revokedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────
// Auth Responses
// ─────────────────────────────────────────────────────────────────

/**
 * Successful auth response (login or registration).
 */
export interface AuthSuccessResponse {
  success: true;
  data: {
    accessToken: string;
    refreshToken: string;
    session: Session;
  };
}
/**
 * Failed auth response.
 *
 * `code` is the translatable error code sent by the backend
 * (e.g. INVALID_CREDENTIALS, ACCOUNT_SUSPENDED, ...).
 */
export interface AuthErrorResponse {
  success: false;
  code?: string;
  message?: string;
}

export type AuthResponse = AuthSuccessResponse | AuthErrorResponse;

export interface RequestOTPResponse {
  success: boolean;
  identifier?: string;
  identifierType?: IdentifierType;
  purpose?: OTPPurpose;
  expiresIn?: number;
}

/**
 * Backend response for OTP verification.
 * Contains the verification token used to prove the identifier.
 */
export interface VerifyOTPResponse {
  success: boolean;
  verificationToken: string;
  identifier: string;
  identifierType: IdentifierType;
  purpose: OTPPurpose;
}

export interface SessionsResponse {
  sessions: Session[];
}

/**
 * Generic message response (logout, revoke, etc.).
 */
export interface MessageResponse {
  success: boolean;
  code?: string;
  message?: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  accessToken: string;
}

// ─────────────────────────────────────────────────────────────────
// Inputs
// ─────────────────────────────────────────────────────────────────

export type RequestOTPInput = {
  identifier: string;
  identifierType: IdentifierType;
  purpose?: OTPPurpose;
};

export type VerifyOTPInput = {
  identifier: string;
  identifierType: IdentifierType;
  otp: string;
  purpose?: OTPPurpose;
};

export type LoginInput = {
  identifier: string;
  identifierType?: IdentifierType;
  accountType?: AccountType;
  password: string;
};

export type SetPasswordInput = {
  verificationToken: string;
  password: string;
};

// ─────────────────────────────────────────────────────────────────
// Auth Context
// ─────────────────────────────────────────────────────────────────

/**
 * Auth context contract.
 *
 * The context stores the current session (not a full user object),
 * because the backend no longer returns user data on login.
 * User profile data must be fetched separately when needed.
 */
export interface AuthContextType {
  session: Session | null;
  accessToken: string | null;
  isLoading: boolean;

  loginWithPassword: (
    identifier: string,
    password: string,
    identifierType?: IdentifierType,
    accountType?: AccountType
  ) => Promise<AuthResponse>;

  register: (
    verificationToken: string,
    firstName: string,
    lastName: string,
    password: string
  ) => Promise<AuthResponse>;

  logout: () => Promise<void>;

  getSessions: () => Promise<SessionsResponse>;
  revokeSession: () => Promise<MessageResponse>;
  revokeAllSessions: () => Promise<MessageResponse>;
}
