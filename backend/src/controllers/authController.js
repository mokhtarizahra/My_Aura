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

import { AppError } from "../errors/AppError.js";
import { authErrors } from "../errors/authErrors.js";

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

const handleError = (res, error) => {
  // Handle AppError instances (services throw these)
  if (error instanceof AppError) {
    return res.status(error.status).json({
      success: false,
      code: error.code,
      message: error.message,
    });
  }

  // Unknown errors → generic 500
  return res.status(500).json({
    success: false,
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
  });
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
      throw authErrors.identifierRequired();
    }

    if (!identifierType) {
      throw authErrors.identifierTypeInvalid();
    }

    const result = await sendOTP({
      identifier,
      identifierType,
      purpose: req.body.purpose || "registration",
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
      throw authErrors.identifierRequired();
    }

    if (!identifierType) {
      throw authErrors.identifierTypeInvalid();
    }

    if (otp === undefined || otp === null || otp === "") {
      throw authErrors.otpRequired();
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
      throw authErrors.verificationTokenRequired();
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
      throw authErrors.identifierRequired();
    }

    if (!identifierType) {
      throw authErrors.identifierTypeInvalid();
    }

    if (typeof password !== "string" || !password) {
      throw authErrors.passwordRequired();
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
      throw authErrors.invalidCredentials();
    }

    requireActiveAccount(account);

    const passwordValid = await comparePassword(password, account.passwordHash);

    if (!passwordValid) {
      throw authErrors.invalidCredentials();
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
      throw authErrors.verificationTokenRequired();
    }

    if (typeof password !== "string" || password.length < 6) {
      throw authErrors.passwordTooShort();
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
      throw authErrors.accountNotFound();
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
      throw authErrors.refreshTokenRequired();
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
      throw authErrors.refreshTokenRequired();
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
      throw authErrors.authenticationRequired();
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
      throw authErrors.authenticationRequired();
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
      throw authErrors.refreshTokenRequired();
    }

    const revoked = await revokeRefreshToken(refreshToken);

    if (!revoked) {
      throw authErrors.sessionNotFound();
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
      throw authErrors.authenticationRequired();
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
