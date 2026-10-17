import { AppError } from "./AppError.js";

/**
 * Factory helpers for auth domain errors.
 *
 * Each helper returns a fresh AppError instance
 * so the caller can `throw` it directly.
 */
export const authErrors = {
  // ─── Account ────────────────────────────────────────────────
  accountAlreadyExists: () =>
    new AppError("ACCOUNT_ALREADY_EXISTS", 409, "Account already exists"),

  accountNotFound: () =>
    new AppError("ACCOUNT_NOT_FOUND", 404, "Account not found"),

  invalidCredentials: () =>
    new AppError("INVALID_CREDENTIALS", 401, "Invalid credentials"),

  accountNotActive: () =>
    new AppError("ACCOUNT_NOT_ACTIVE", 403, "Account is not active"),

  accountIdRequired: () =>
    new AppError("ACCOUNT_ID_REQUIRED", 400, "Account ID is required"),

  accountTypeInvalid: () =>
    new AppError("ACCOUNT_TYPE_INVALID", 400, "Invalid account type"),

  // ─── Identifier ─────────────────────────────────────────────
  identifierRequired: () =>
    new AppError("IDENTIFIER_REQUIRED", 400, "Identifier is required"),

  identifierTypeInvalid: () =>
    new AppError("IDENTIFIER_TYPE_INVALID", 400, "Invalid identifier type"),

  // ─── Password ───────────────────────────────────────────────
  passwordRequired: () =>
    new AppError("PASSWORD_REQUIRED", 400, "Password is required"),

  passwordTooShort: () =>
    new AppError(
      "PASSWORD_TOO_SHORT",
      400,
      "Password must be at least 6 characters",
    ),

  // ─── Name ───────────────────────────────────────────────────
  firstNameRequired: () =>
    new AppError("FIRST_NAME_REQUIRED", 400, "First name is required"),

  firstNameTooShort: () =>
    new AppError(
      "FIRST_NAME_TOO_SHORT",
      400,
      "First name must be at least 2 characters",
    ),

  firstNameTooLong: () =>
    new AppError(
      "FIRST_NAME_TOO_LONG",
      400,
      "First name must not exceed 50 characters",
    ),

  lastNameRequired: () =>
    new AppError("LAST_NAME_REQUIRED", 400, "Last name is required"),

  lastNameTooShort: () =>
    new AppError(
      "LAST_NAME_TOO_SHORT",
      400,
      "Last name must be at least 2 characters",
    ),

  lastNameTooLong: () =>
    new AppError(
      "LAST_NAME_TOO_LONG",
      400,
      "Last name must not exceed 50 characters",
    ),

  // ─── OTP ────────────────────────────────────────────────────
  otpInvalidOrExpired: () =>
    new AppError(
      "OTP_INVALID_OR_EXPIRED",
      401,
      "Invalid or expired OTP request",
    ),

  otpExpired: () => new AppError("OTP_EXPIRED", 401, "OTP expired"),

  otpMaxAttemptsExceeded: () =>
    new AppError(
      "OTP_MAX_ATTEMPTS_EXCEEDED",
      401,
      "Maximum OTP attempts exceeded",
    ),

  otpInvalid: () => new AppError("OTP_INVALID", 401, "Invalid OTP"),

  otpFormatInvalid: () =>
    new AppError("OTP_FORMAT_INVALID", 400, "Invalid OTP format"),

  otpPurposeInvalid: () =>
    new AppError("OTP_PURPOSE_INVALID", 400, "Invalid OTP purpose"),

  otpResendCooldown: () =>
    new AppError("OTP_RESEND_COOLDOWN", 429, "OTP resend cooldown active"),

  // ─── Verification token ────────────────────────────────────
  verificationTokenRequired: () =>
    new AppError(
      "VERIFICATION_TOKEN_REQUIRED",
      400,
      "Verification token is required",
    ),

  verificationTokenInvalidOrExpired: () =>
    new AppError(
      "VERIFICATION_TOKEN_INVALID_OR_EXPIRED",
      401,
      "Invalid or expired verification token",
    ),

  verificationTokenInvalidType: () =>
    new AppError(
      "VERIFICATION_TOKEN_INVALID_TYPE",
      401,
      "Invalid verification token type",
    ),

  verificationTokenInvalidIdentifier: () =>
    new AppError(
      "VERIFICATION_TOKEN_INVALID_IDENTIFIER",
      401,
      "Invalid verification token identifier",
    ),

  verificationTokenInvalidIdentifierType: () =>
    new AppError(
      "VERIFICATION_TOKEN_INVALID_IDENTIFIER_TYPE",
      401,
      "Invalid verification token identifier type",
    ),

  verificationTokenInvalidPurpose: () =>
    new AppError(
      "VERIFICATION_TOKEN_INVALID_PURPOSE",
      401,
      "Invalid verification token purpose",
    ),

  verificationTokenPurposeMismatch: () =>
    new AppError(
      "VERIFICATION_TOKEN_PURPOSE_MISMATCH",
      401,
      "Verification token purpose mismatch",
    ),

  // ─── Refresh token ─────────────────────────────────────────
  refreshTokenRequired: () =>
    new AppError("REFRESH_TOKEN_REQUIRED", 400, "Refresh token is required"),

  refreshTokenInvalid: () =>
    new AppError("REFRESH_TOKEN_INVALID", 401, "Invalid refresh token"),

  refreshTokenInvalidType: () =>
    new AppError("REFRESH_TOKEN_INVALID_TYPE", 401, "Invalid token type"),

  refreshTokenInvalidSubject: () =>
    new AppError(
      "REFRESH_TOKEN_INVALID_SUBJECT",
      401,
      "Invalid refresh token subject",
    ),

  refreshTokenInvalidAccountType: () =>
    new AppError(
      "REFRESH_TOKEN_INVALID_ACCOUNT_TYPE",
      401,
      "Invalid refresh token account type",
    ),

  refreshTokenRevokedOrExpired: () =>
    new AppError(
      "REFRESH_TOKEN_REVOKED_OR_EXPIRED",
      401,
      "Refresh token revoked or expired",
    ),

  // ─── JWT / token config ────────────────────────────────────
  jwtSecretNotConfigured: () =>
    new AppError(
      "JWT_SECRET_NOT_CONFIGURED",
      500,
      "JWT_SECRET is not configured",
    ),

  jwtPayloadInvalid: () =>
    new AppError("JWT_PAYLOAD_INVALID", 500, "JWT payload must be an object"),

  jwtExpirationRequired: () =>
    new AppError("JWT_EXPIRATION_REQUIRED", 500, "JWT expiration is required"),

  // ─── SMS ────────────────────────────────────────────────────
  smsInvalidOtpFormat: () =>
    new AppError("SMS_INVALID_OTP_FORMAT", 400, "Invalid OTP format"),

  // ─── Access token ────────────────────────────────────────
  accessTokenRequired: () =>
    new AppError("ACCESS_TOKEN_REQUIRED", 401, "Access token is required"),

  accessTokenInvalidOrExpired: () =>
    new AppError(
      "ACCESS_TOKEN_INVALID_OR_EXPIRED",
      401,
      "Invalid or expired access token",
    ),

  accessTokenInvalidType: () =>
    new AppError("ACCESS_TOKEN_INVALID_TYPE", 401, "Invalid access token type"),

  accessTokenSubjectMissing: () =>
    new AppError(
      "ACCESS_TOKEN_SUBJECT_MISSING",
      401,
      "Access token subject is missing",
    ),

  // ─── Refresh token (extra) ──────────────────────────────
  refreshTokenInvalidOrExpired: () =>
    new AppError(
      "REFRESH_TOKEN_INVALID_OR_EXPIRED",
      401,
      "Invalid or expired refresh token",
    ),

  refreshTokenSubjectMissing: () =>
    new AppError(
      "REFRESH_TOKEN_SUBJECT_MISSING",
      401,
      "Refresh token subject is missing",
    ),

  // ─── Verification token (extra) ─────────────────────────
  verificationPurposeInvalid: () =>
    new AppError(
      "VERIFICATION_PURPOSE_INVALID",
      401,
      "Invalid verification purpose",
    ),

  verificationTokenIdentifierMissing: () =>
    new AppError(
      "VERIFICATION_TOKEN_IDENTIFIER_MISSING",
      401,
      "Verification token identifier is missing",
    ),

  verificationIdentifierTypeInvalid: () =>
    new AppError(
      "VERIFICATION_IDENTIFIER_TYPE_INVALID",
      401,
      "Invalid verification identifier type",
    ),

  // ─── OTP (extra) ────────────────────────────────────────
  otpLengthInvalid: () =>
    new AppError(
      "OTP_LENGTH_INVALID",
      400,
      "OTP length must be an integer greater than or equal to 4",
    ),

  // ─── Account (extra) ────────────────────────────────────
  accountStatusInvalid: () =>
    new AppError("ACCOUNT_STATUS_INVALID", 400, "Invalid account status"),

  phoneOrEmailRequired: () =>
    new AppError("PHONE_OR_EMAIL_REQUIRED", 400, "Phone or email is required"),

  emailRequired: () => new AppError("EMAIL_REQUIRED", 400, "Email is required"),

  corporateEmailRequired: () =>
    new AppError(
      "CORPORATE_EMAIL_REQUIRED",
      400,
      "Corporate email is required",
    ),

  passwordHashRequired: () =>
    new AppError("PASSWORD_HASH_REQUIRED", 400, "Password hash is required"),

  // ─── Refresh token (extra) ──────────────────────────────
  refreshTokenExpirationInvalid: () =>
    new AppError(
      "REFRESH_TOKEN_EXPIRATION_INVALID",
      500,
      "Invalid refresh token expiration configuration",
    ),

  // ─── SMS ────────────────────────────────────────────────
  smsSendFailed: () =>
    new AppError("SMS_SEND_FAILED", 500, "Failed to send SMS"),

  // ─── Controller-level (missing from services) ───────────
  otpRequired: () => new AppError("OTP_REQUIRED", 400, "OTP is required"),

  authenticationRequired: () =>
    new AppError("AUTHENTICATION_REQUIRED", 401, "Authentication required"),

  sessionNotFound: () =>
    new AppError("SESSION_NOT_FOUND", 404, "Session not found"),

  passwordSameAsOld: () =>
    new AppError(
      "PASSWORD_SAME_AS_OLD",
      400,
      "New password must be different from the current one",
    ),
};
