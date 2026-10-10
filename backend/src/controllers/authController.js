import { registerPersonalAccount } from "../services/authentication/registration.service.js";

import {
  comparePassword,
  findAccountById,
  findAccountForLogin,
  findPersonalAccount,
  requireActiveAccount,
  setAccountPassword,
  updateLastLogin,
} from "../services/authentication/account.service.js";

import { sendOTP, verifyOTP } from "../services/authentication/otp.service.js";

import {
  generateAccessToken,
  verifyVerificationToken,
} from "../services/authentication/token.service.js";

import {
  createRefreshToken,
  getActiveSessions,
  getSessionHistory,
  revokeAllRefreshTokens,
  revokeRefreshToken,
  rotateRefreshToken,
  validateRefreshToken,
} from "../services/authentication/refreshToken.service.js";

import { serializeAccount } from "../utils/serializers/account.serializer.js";

import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from "../utils/cookie.js";

/*
 * --------------------------------------------------------------------------
 * HTTP helpers
 * --------------------------------------------------------------------------
 */

/**
 * Return the first non-empty value from the provided values.
 *
 * This is intentionally kept at the HTTP layer.
 * Business validation belongs to the underlying services.
 */
const getString = (...values) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
};

/**
 * Extract user-agent from the HTTP request.
 */
const getUserAgent = (req) => req.headers?.["user-agent"] ?? null;

/**
 * Extract client IP from the HTTP request.
 *
 * req.ip is preferred because Express may already
 * normalize the address according to proxy configuration.
 */
const getClientIp = (req) => req.ip ?? null;

/**
 * Return a consistent JSON success response.
 */
const success = (res, data = {}, status = 200) => {
  return res.status(status).json({
    success: true,
    ...data,
  });
};

/**
 * Return a consistent JSON error response.
 */
const failure = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

/*
 * --------------------------------------------------------------------------
 * Error mapping
 * --------------------------------------------------------------------------
 *
 * Services throw domain errors.
 * Controllers translate those errors into HTTP responses.
 *
 * The controller does NOT reproduce the validation logic
 * implemented by the services.
 */

const getErrorStatus = (error) => {
  const message = error?.message;

  switch (message) {
    case "Account already exists":
      return 409;

    case "Account not found":
      return 404;

    case "Invalid credentials":
      return 401;

    case "Account is not active":
      return 403;

    case "Invalid or expired OTP request":
    case "OTP expired":
    case "Maximum OTP attempts exceeded":
    case "Invalid OTP":
    case "Invalid or expired verification token":
    case "Invalid verification token type":
    case "Invalid verification token identifier":
    case "Invalid verification token identifier type":
    case "Invalid verification token purpose":
    case "Verification token purpose mismatch":
    case "Invalid refresh token":
    case "Invalid token type":
    case "Invalid refresh token subject":
    case "Invalid refresh token account type":
    case "Refresh token revoked or expired":
      return 401;

    case "OTP resend cooldown active":
      return 429;

    case "Identifier is required":
    case "Invalid identifier type":
    case "Invalid OTP":
    case "Invalid OTP purpose":
    case "Password is required":
    case "Password must be at least 6 characters":
    case "Verification token is required":
    case "Refresh token is required":
    case "Account ID is required":
    case "Invalid account type":
    case "First name is required":
    case "Last name is required":
      return 400;

    default:
      return 500;
  }
};

const handleError = (res, error) => {
  const status = getErrorStatus(error);

  /*
   * Never expose unexpected internal errors.
   */
  const message = status === 500 ? "Internal server error" : error.message;

  return failure(res, status, message);
};

/*
 * --------------------------------------------------------------------------
 * Registration
 * --------------------------------------------------------------------------
 */

/**
 * Request an OTP for Personal Account registration.
 *
 * Business rules are delegated to otp.service.js.
 */
export const requestOTP = async (req, res) => {
  try {
    const { identifier, identifierType } = req.body ?? {};

    if (typeof identifier !== "string" || !identifier.trim()) {
      return failure(res, 400, "Identifier is required");
    }

    if (!identifierType) {
      return failure(res, 400, "Identifier type is required");
    }

    const result = await sendOTP({
      identifier,
      identifierType,
      purpose: "registration",
    });

    return success(res, {
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * Verify a registration OTP.
 *
 * otp.service.js is responsible for OTP validation,
 * expiration, attempt limits and token generation.
 */
export const verifyOTPController = async (req, res) => {
  try {
    const {
      identifier,
      identifierType,
      purpose = "registration",
      otp,
    } = req.body ?? {};

    if (typeof identifier !== "string" || !identifier.trim()) {
      return failure(res, 400, "Identifier is required");
    }

    if (!identifierType) {
      return failure(res, 400, "Identifier type is required");
    }

    if (otp === undefined || otp === null || otp === "") {
      return failure(res, 400, "OTP is required");
    }

    const result = await verifyOTP({
      identifier,
      identifierType,
      purpose,
      otp,
    });

    return success(res, {
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * Complete Personal Account registration.
 *
 * The verification token is the source of truth for
 * the verified identifier.
 */
export const register = async (req, res) => {
  try {
    const { verificationToken, firstName, lastName, password } = req.body ?? {};

    if (!verificationToken) {
      return failure(res, 400, "Verification token is required");
    }

    const verification = verifyVerificationToken(
      verificationToken,
      "registration",
    );

    const result = await registerPersonalAccount({
      firstName,
      lastName,
      identifier: verification.identifier,
      identifierType: verification.identifierType,
      password,
    });

    return success(
      res,
      {
        data: {
          user: result.user,
          account: serializeAccount(result.account),
        },
      },
      201,
    );
  } catch (error) {
    return handleError(res, error);
  }
};

/*
 * --------------------------------------------------------------------------
 * Login
 * --------------------------------------------------------------------------
 */

/**
 * Login using an account identifier and password.
 */
export const loginWithPassword = async (req, res) => {
  try {
    const {
      identifier,
      identifierType,
      accountType = "personal",
      password,
    } = req.body ?? {};

    if (typeof identifier !== "string" || !identifier.trim()) {
      return failure(res, 400, "Identifier is required");
    }

    if (!identifierType) {
      return failure(res, 400, "Identifier type is required");
    }

    if (typeof password !== "string" || !password) {
      return failure(res, 400, "Password is required");
    }

    const account = await findAccountForLogin({
      identifier,
      identifierType,
      accountType,
    });

    /*
     * Do not reveal whether the account exists.
     */
    if (!account) {
      return failure(res, 401, "Invalid credentials");
    }

    requireActiveAccount(account);

    const passwordValid = await comparePassword(password, account.passwordHash);

    if (!passwordValid) {
      return failure(res, 401, "Invalid credentials");
    }

    const accessToken = generateAccessToken(account._id, accountType);

    const { refreshToken, session } = await createRefreshToken({
      accountId: account._id,
      accountType,
      userAgent: getUserAgent(req),
      ip: getClientIp(req),
    });

    setRefreshTokenCookie(res, refreshToken);

    await updateLastLogin({
      accountId: account._id,
      accountType,
    });

    return success(res, {
      data: {
        accessToken,
        refreshToken,
        session,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

/*
 * --------------------------------------------------------------------------
 * Password
 * --------------------------------------------------------------------------
 */

/**
 * Set/reset a Personal Account password using
 * a password-reset verification token.
 */
export const setPassword = async (req, res) => {
  try {
    const { verificationToken, password } = req.body ?? {};

    if (!verificationToken) {
      return failure(res, 400, "Verification token is required");
    }

    if (typeof password !== "string" || password.length < 6) {
      return failure(res, 400, "Password must be at least 6 characters");
    }

    const verification = verifyVerificationToken(
      verificationToken,
      "password_reset",
    );

    const account = await findPersonalAccount(
      verification.identifierType === "phone"
        ? {
            phone: verification.identifier,
          }
        : {
            email: verification.identifier,
          },
    );

    if (!account) {
      return failure(res, 404, "Account not found");
    }

    await setAccountPassword({
      accountId: account._id,
      accountType: "personal",
      password,
    });

    /*
     * Password change invalidates every existing
     * refresh-token session for this account.
     */
    const revokedSessions = await revokeAllRefreshTokens({
      accountId: account._id,
      accountType: "personal",
    });

    return success(res, {
      data: {
        revokedSessions,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

/*
 * --------------------------------------------------------------------------
 * Refresh
 * --------------------------------------------------------------------------
 */

/**
 * Exchange a valid refresh token for a new
 * access token and rotated refresh token.
 */
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = getString(
      req.body?.refreshToken,
      req.cookies?.refreshToken,
    );

    if (!refreshToken) {
      return failure(res, 400, "Refresh token is required");
    }

    const { payload } = await validateRefreshToken(refreshToken);

    const account = await findAccountById({
      accountId: payload.sub,
      accountType: payload.accountType,
    });

    requireActiveAccount(account);

    const { refreshToken: newRefreshToken, session } = await rotateRefreshToken(
      {
        refreshToken,
        userAgent: getUserAgent(req),
        ip: getClientIp(req),
      },
    );

    setRefreshTokenCookie(res, newRefreshToken);

    const accessToken = generateAccessToken(payload.sub, payload.accountType);

    return success(res, {
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        session,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

/*
 * --------------------------------------------------------------------------
 * Logout
 * --------------------------------------------------------------------------
 */

/**
 * Logout the current session.
 */
export const logout = async (req, res) => {
  try {
    const refreshToken = getString(
      req.body?.refreshToken,
      req.cookies?.refreshToken,
    );

    if (!refreshToken) {
      return failure(res, 400, "Refresh token is required");
    }

    await revokeRefreshToken(refreshToken);

    res.clearCookie("accessToken");

    clearRefreshTokenCookie(res);

    return success(res);
  } catch (error) {
    return handleError(res, error);
  }
};

/*
 * --------------------------------------------------------------------------
 * Sessions
 * --------------------------------------------------------------------------
 */

/**
 * Return all active sessions for the authenticated account.
 */
export const getSessions = async (req, res) => {
  try {
    if (!req.auth?.accountId) {
      return failure(res, 401, "Authentication required");
    }

    const sessions = await getActiveSessions({
      accountId: req.auth.accountId,
      accountType: req.auth.accountType,
    });

    return success(res, {
      data: {
        sessions,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * Return session history for the authenticated account.
 */
export const getSessionHistoryController = async (req, res) => {
  try {
    if (!req.auth?.accountId) {
      return failure(res, 401, "Authentication required");
    }

    const sessions = await getSessionHistory({
      accountId: req.auth.accountId,
      accountType: req.auth.accountType,
    });

    return success(res, {
      data: {
        sessions,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * Revoke one session using its refresh token.
 *
 * The service owns the actual revocation logic.
 */
export const revokeSession = async (req, res) => {
  try {
    const refreshToken = getString(req.body?.refreshToken);

    if (!refreshToken) {
      return failure(res, 400, "Refresh token is required");
    }

    const revoked = await revokeRefreshToken(refreshToken);

    if (!revoked) {
      return failure(res, 404, "Session not found");
    }

    return success(res);
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * Revoke all active sessions for the authenticated account.
 */
export const revokeAllSessions = async (req, res) => {
  try {
    if (!req.auth?.accountId) {
      return failure(res, 401, "Authentication required");
    }

    const revokedSessions = await revokeAllRefreshTokens({
      accountId: req.auth.accountId,
      accountType: req.auth.accountType,
    });

    return success(res, {
      data: {
        revokedSessions,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};
