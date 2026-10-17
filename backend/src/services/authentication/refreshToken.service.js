import jwt from "jsonwebtoken";

import RefreshToken from "../../models/authentication/RefreshToken.js";
import { hashToken } from "../../utils/hashToken.js";
import { generateRefreshToken, TOKEN_CONFIG } from "./token.service.js";
import { authErrors } from "../../errors/authErrors.js";

const ACCOUNT_TYPES = TOKEN_CONFIG.ACCOUNT_TYPES;

const validateAccountId = (accountId) => {
  if (!accountId) {
    throw authErrors.accountIdRequired();
  }
};

const validateAccountType = (accountType) => {
  if (!ACCOUNT_TYPES.includes(accountType)) {
    throw authErrors.accountTypeInvalid();
  }
};

/**
 * Converts a JWT expiration string such as "7d" into milliseconds.
 *
 * This function intentionally supports only the units required
 * by MyAura's token configuration.
 */
const getRefreshTokenLifetimeMs = () => {
  const value = TOKEN_CONFIG.REFRESH_TOKEN_EXPIRES_IN;

  const match = /^(\d+)([smhd])$/.exec(value);

  if (!match) {
    throw authErrors.refreshTokenExpirationInvalid();
  }

  const amount = Number(match[1]);
  const unit = match[2];

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * multipliers[unit];
};

/**
 * Create and persist a refresh-token session.
 *
 * The raw JWT is returned to the caller.
 * Only its SHA-256 hash is stored in the database.
 */
export const createRefreshToken = async ({
  accountId,
  accountType,
  userAgent = null,
  ip = null,
}) => {
  validateAccountId(accountId);
  validateAccountType(accountType);

  const refreshToken = generateRefreshToken(accountId, accountType);

  const expiresAt = new Date(Date.now() + getRefreshTokenLifetimeMs());

  const tokenHash = hashToken(refreshToken);

  const session = await RefreshToken.create({
    accountId,
    accountType,
    tokenHash,
    expiresAt,
    userAgent,
    ip,
  });

  return {
    refreshToken,
    session,
  };
};

/**
 * Verify a refresh JWT cryptographically and validate
 * that it is still present and active in the database.
 */
export const validateRefreshToken = async (refreshToken) => {
  if (!refreshToken) {
    throw authErrors.refreshTokenRequired();
  }

  let payload;

  try {
    payload = jwt.verify(refreshToken, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });
  } catch {
    throw authErrors.refreshTokenInvalid();
  }

  if (payload.tokenType !== "refresh") {
    throw authErrors.refreshTokenInvalidType();
  }

  if (!payload.sub) {
    throw authErrors.refreshTokenInvalidSubject();
  }

  if (!payload.accountType) {
    throw authErrors.refreshTokenInvalidAccountType();
  }

  validateAccountType(payload.accountType);

  const tokenHash = hashToken(refreshToken);

  const storedToken = await RefreshToken.findOne({
    accountId: payload.sub,
    accountType: payload.accountType,
    tokenHash,
    revokedAt: null,
    expiresAt: {
      $gt: new Date(),
    },
  }).select("+tokenHash");

  if (!storedToken) {
    throw authErrors.refreshTokenRevokedOrExpired();
  }

  return {
    payload,
    session: storedToken,
  };
};

/**
 * Rotate a refresh token.
 *
 * The old session is revoked and a new
 * refresh-token session is created.
 */
export const rotateRefreshToken = async ({
  refreshToken,
  userAgent = null,
  ip = null,
}) => {
  const { payload, session } = await validateRefreshToken(refreshToken);

  session.revokedAt = new Date();

  await session.save();

  return createRefreshToken({
    accountId: payload.sub,
    accountType: payload.accountType,
    userAgent,
    ip,
  });
};

/**
 * Revoke one refresh-token session.
 *
 * The refresh token itself is never returned.
 */
export const revokeRefreshToken = async (refreshToken) => {
  if (!refreshToken) {
    throw authErrors.refreshTokenRequired();
  }

  const tokenHash = hashToken(refreshToken);

  const session = await RefreshToken.findOne({
    tokenHash,
    revokedAt: null,
  }).select("+tokenHash");

  if (!session) {
    return false;
  }

  session.revokedAt = new Date();

  await session.save();

  return true;
};

/**
 * Revoke all active refresh-token sessions
 * belonging to one account.
 */
export const revokeAllRefreshTokens = async ({ accountId, accountType }) => {
  validateAccountId(accountId);
  validateAccountType(accountType);

  const result = await RefreshToken.updateMany(
    {
      accountId,
      accountType,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );

  return result.modifiedCount;
};

/**
 * Return all currently active sessions
 * belonging to one account.
 *
 * A session is considered active when:
 *
 *   revokedAt === null
 *   AND
 *   expiresAt > now
 *
 * Security:
 * tokenHash is deliberately excluded from
 * the returned session data.
 */
export const getActiveSessions = async ({ accountId, accountType }) => {
  validateAccountId(accountId);
  validateAccountType(accountType);

  return RefreshToken.find({
    accountId,
    accountType,
    revokedAt: null,
    expiresAt: {
      $gt: new Date(),
    },
  })
    .select("-tokenHash")
    .sort({
      createdAt: -1,
    });
};

/**
 * Return the complete refresh-token session history
 * belonging to one account.
 *
 * This includes:
 *   - active sessions
 *   - revoked sessions
 *   - expired sessions
 *
 * tokenHash is never exposed.
 */
export const getSessionHistory = async ({ accountId, accountType }) => {
  validateAccountId(accountId);
  validateAccountType(accountType);

  return RefreshToken.find({
    accountId,
    accountType,
  })
    .select("-tokenHash")
    .sort({
      createdAt: -1,
    });
};
