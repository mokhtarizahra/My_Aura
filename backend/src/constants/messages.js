/**
 * Centralized message codes.
 *
 * These codes are sent to the client instead of human-readable text.
 * The client is responsible for translating them based on the user's
 * locale (e.g. using next-intl).
 *
 * Naming convention: UPPER_SNAKE_CASE
 * Grouped by domain.
 */

export const MESSAGES = {
  // ---------------------------------------------------------------
  // General validation
  // ---------------------------------------------------------------
  VALIDATION_FAILED: "VALIDATION_FAILED",

  // ---------------------------------------------------------------
  // Identifier
  // ---------------------------------------------------------------
  IDENTIFIER_REQUIRED: "IDENTIFIER_REQUIRED",
  IDENTIFIER_EMPTY: "IDENTIFIER_EMPTY",
  IDENTIFIER_TYPE_INVALID: "IDENTIFIER_TYPE_INVALID",

  // ---------------------------------------------------------------
  // Account
  // ---------------------------------------------------------------
  ACCOUNT_TYPE_INVALID: "ACCOUNT_TYPE_INVALID",

  // ---------------------------------------------------------------
  // Password
  // ---------------------------------------------------------------
  PASSWORD_REQUIRED: "PASSWORD_REQUIRED",
  PASSWORD_EMPTY: "PASSWORD_EMPTY",
  PASSWORD_TOO_SHORT: "PASSWORD_TOO_SHORT",
  PASSWORD_TOO_LONG: "PASSWORD_TOO_LONG",
  CURRENT_PASSWORD_REQUIRED: "CURRENT_PASSWORD_REQUIRED", 

  // ---------------------------------------------------------------
  // OTP
  // ---------------------------------------------------------------
  OTP_REQUIRED: "OTP_REQUIRED",
  OTP_FORMAT_INVALID: "OTP_FORMAT_INVALID",
  OTP_PURPOSE_INVALID: "OTP_PURPOSE_INVALID",

  // ---------------------------------------------------------------
  // Verification token
  // ---------------------------------------------------------------
  VERIFICATION_TOKEN_REQUIRED: "VERIFICATION_TOKEN_REQUIRED",

  // ---------------------------------------------------------------
  // Personal name
  // ---------------------------------------------------------------
  FIRST_NAME_REQUIRED: "FIRST_NAME_REQUIRED",
  FIRST_NAME_TOO_SHORT: "FIRST_NAME_TOO_SHORT",
  FIRST_NAME_TOO_LONG: "FIRST_NAME_TOO_LONG",

  LAST_NAME_REQUIRED: "LAST_NAME_REQUIRED",
  LAST_NAME_TOO_SHORT: "LAST_NAME_TOO_SHORT",
  LAST_NAME_TOO_LONG: "LAST_NAME_TOO_LONG",

  // ---------------------------------------------------------------
  // Session
  // ---------------------------------------------------------------
  SESSION_ID_INVALID: "SESSION_ID_INVALID",
};
