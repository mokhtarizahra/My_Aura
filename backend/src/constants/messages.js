/**
 * Centralized message codes.
 *
 * These codes are sent to the client instead of human-readable text.
 * The client is responsible for translating them based on the user's
 * locale (e.g. using i18next).
 *
 * Naming convention: UPPER_SNAKE_CASE
 * Grouped by domain.
 */

export const MESSAGES = {
  // ---------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------
  VALIDATION_FAILED: "VALIDATION_FAILED",

  // Identifier
  IDENTIFIER_REQUIRED: "IDENTIFIER_REQUIRED",
  IDENTIFIER_EMPTY: "IDENTIFIER_EMPTY",
  IDENTIFIER_TYPE_INVALID: "IDENTIFIER_TYPE_INVALID",

  // Account
  ACCOUNT_TYPE_INVALID: "ACCOUNT_TYPE_INVALID",

  // Password
  PASSWORD_REQUIRED: "PASSWORD_REQUIRED",
  PASSWORD_EMPTY: "PASSWORD_EMPTY",
  PASSWORD_TOO_LONG: "PASSWORD_TOO_LONG",

  // ---------------------------------------------------------------
  // Auth (placeholder — will be filled in later)
  // ---------------------------------------------------------------
  // INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  // ACCESS_TOKEN_REQUIRED: "ACCESS_TOKEN_REQUIRED",
  // ...

  // ---------------------------------------------------------------
  // OTP (placeholder — will be filled in later)
  // ---------------------------------------------------------------
  // OTP_INVALID_OR_EXPIRED: "OTP_INVALID_OR_EXPIRED",
  // ...

  // ---------------------------------------------------------------
  // Success (placeholder — will be filled in later)
  // ---------------------------------------------------------------
  // LOGIN_SUCCESS: "LOGIN_SUCCESS",
  // ...
};
