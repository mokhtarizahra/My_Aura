import { Router } from "express";

import {
  changePassword,
  getSessionHistoryController,
  getSessions,
  loginWithPassword,
  logout,
  refreshAccessToken,
  register,
  requestOTP,
  revokeAllSessions,
  revokeSession,
  revokeSessionByIdController,
  setPassword,
  verifyOTPController,
} from "../controllers/authController.js";

import {
  otpLimiter,
  otpVerifyLimiter,
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  refreshLimiter,
} from "../middlewares/rateLimiter.js";

import { authenticateAccessToken } from "../middlewares/auth.middleware.js";

import {
  changePasswordSchema,
  loginSchema,
  passwordResetSchema,
  registerSchema,
  requestOTPSchema,
  sessionIdParamSchema,
  verifyOTPSchema,
} from "../validators/auth.validator.js";

import { validateBody, validateParams } from "../middlewares/validate.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public Authentication
|--------------------------------------------------------------------------
*/

/**
 * Request OTP
 *
 * POST /api/auth/otp/request
 */
router.post(
  "/otp/request",
  otpLimiter,
  validateBody(requestOTPSchema),
  requestOTP,
);
/**
 * Verify OTP
 *
 * POST /api/auth/otp/verify
 */
router.post(
  "/otp/verify",
  otpVerifyLimiter,
  validateBody(verifyOTPSchema),
  verifyOTPController,
);

/**
 * Register Personal Account
 *
 * POST /api/auth/register
 *
 * Public registration is only available for
 * Personal Accounts.
 */
router.post(
  "/register",
  registerLimiter,
  validateBody(registerSchema),
  register,
);

/**
 * Login
 *
 * POST /api/auth/login
 */
router.post(
  "/login",
  loginLimiter,
  validateBody(loginSchema),
  loginWithPassword,
);

/**
 * Reset password
 *
 * POST /api/auth/password/reset
 *
 * The controller validates the verification token
 * generated after OTP verification.
 */
router.post(
  "/password/reset",
  passwordResetLimiter,
  validateBody(passwordResetSchema),
  setPassword,
);

/**
 * Change password for an authenticated account.
 *
 * POST /api/auth/password/change
 *
 * Requires a valid access token.
 * The body must contain both the current and the new password.
 */
router.post(
  "/password/change",
  authenticateAccessToken,
  validateBody(changePasswordSchema),
  changePassword,
);

/*
|--------------------------------------------------------------------------
| Token / Session Authentication
|--------------------------------------------------------------------------
*/

/**
 * Refresh access token.
 *
 * POST /api/auth/refresh
 *
 * Authentication is performed using the refresh token,
 * normally supplied through the HTTP-only refresh-token cookie.
 */
router.post("/refresh", refreshLimiter, refreshAccessToken);

/**
 * Logout current refresh-token session.
 *
 * POST /api/auth/logout
 */
router.post("/logout", logout);

/*
|--------------------------------------------------------------------------
| Authenticated Session Management
|--------------------------------------------------------------------------
*/

/**
 * Get currently active sessions.
 *
 * GET /api/auth/sessions
 *
 * Requires a valid access token.
 */
router.get("/sessions", authenticateAccessToken, getSessions);

/**
 * Get complete session history.
 *
 * GET /api/auth/sessions/history
 *
 * Requires a valid access token.
 */
router.get(
  "/sessions/history",
  authenticateAccessToken,
  getSessionHistoryController,
);

/**
 * Revoke current refresh-token session.
 *
 * DELETE /api/auth/sessions/current
 *
 * The controller uses the refresh token to identify
 * the session that must be revoked.
 */
router.delete("/sessions/current", revokeSession);

/**
 * Revoke all active sessions.
 *
 * DELETE /api/auth/sessions
 *
 * Requires a valid access token because the operation
 * applies to the authenticated account.
 */
router.delete("/sessions", authenticateAccessToken, revokeAllSessions);

/**
 * Revoke a specific session by ID.
 *
 * DELETE /api/auth/sessions/:id
 *
 * The session must belong to the currently authenticated account.
 */
router.delete(
  "/sessions/:id",
  authenticateAccessToken,
  validateParams(sessionIdParamSchema),
  revokeSessionByIdController,
);

export default router;
