import crypto from "crypto";
import jwt from "jsonwebtoken";

import { generateToken } from "../../utils/generateToken.js";

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";
const VERIFICATION_TOKEN_EXPIRES_IN = "10m";

const ACCOUNT_TYPES = ["personal", "organization", "staff"];

const VERIFICATION_PURPOSES = ["registration", "password_reset"];

const IDENTIFIER_TYPES = ["phone", "email"];

/**
 * Validate account type.
 */
const validateAccountType = (accountType) => {
  if (!ACCOUNT_TYPES.includes(accountType)) {
    throw new Error("Invalid account type");
  }
};

/**
 * Validate account identifier.
 */
const validateAccountId = (accountId) => {
  if (!accountId) {
    throw new Error("Account ID is required");
  }
};

/**
 * Validate identifier type.
 */
const validateIdentifierType = (identifierType) => {
  if (!IDENTIFIER_TYPES.includes(identifierType)) {
    throw new Error("Invalid identifier type");
  }
};

/**
 * Validate verification purpose.
 */
const validateVerificationPurpose = (purpose) => {
  if (!VERIFICATION_PURPOSES.includes(purpose)) {
    throw new Error("Invalid verification purpose");
  }
};

/**
 * Generate an access token.
 *
 * Access tokens identify an authenticated account.
 */
export const generateAccessToken = (accountId, accountType) => {
  validateAccountId(accountId);
  validateAccountType(accountType);

  return generateToken(
    {
      sub: accountId.toString(),
      accountType,
      tokenType: "access",
    },
    ACCESS_TOKEN_EXPIRES_IN,
  );
};

/**
 * Generate a refresh token.
 *
 * Every refresh token receives a unique JTI.
 */
export const generateRefreshToken = (accountId, accountType) => {
  validateAccountId(accountId);
  validateAccountType(accountType);

  return generateToken(
    {
      sub: accountId.toString(),
      accountType,
      tokenType: "refresh",
      jti: crypto.randomUUID(),
    },
    REFRESH_TOKEN_EXPIRES_IN,
  );
};

/**
 * Generate a verification token.
 *
 * This token proves that a specific identifier
 * has successfully passed OTP verification
 * for a specific purpose.
 */
export const generateVerificationToken = ({
  identifier,
  identifierType,
  purpose,
}) => {
  if (!identifier) {
    throw new Error("Identifier is required");
  }

  validateIdentifierType(identifierType);

  validateVerificationPurpose(purpose);

  return generateToken(
    {
      tokenType: "verification",
      purpose,
      identifier,
      identifierType,
    },
    VERIFICATION_TOKEN_EXPIRES_IN,
  );
};

/**
 * Verify a verification token.
 *
 * The controller must never call jwt.verify()
 * directly. All verification-token cryptographic
 * validation belongs to this service.
 *
 * If expectedPurpose is provided, the token must
 * belong to that exact purpose.
 */
export const verifyVerificationToken = (token, expectedPurpose = null) => {
  if (!token) {
    throw new Error("Verification token is required");
  }

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });
  } catch {
    throw new Error("Invalid or expired verification token");
  }

  if (payload.tokenType !== "verification") {
    throw new Error("Invalid verification token type");
  }

  if (!payload.identifier) {
    throw new Error("Invalid verification token identifier");
  }

  if (!payload.identifierType) {
    throw new Error("Invalid verification token identifier type");
  }

  if (!payload.purpose) {
    throw new Error("Invalid verification token purpose");
  }

  validateIdentifierType(payload.identifierType);

  validateVerificationPurpose(payload.purpose);

  if (expectedPurpose !== null) {
    validateVerificationPurpose(expectedPurpose);

    if (payload.purpose !== expectedPurpose) {
      throw new Error("Verification token purpose mismatch");
    }
  }

  return payload;
};

/**
 * Token configuration.
 */
export const TOKEN_CONFIG = {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  VERIFICATION_TOKEN_EXPIRES_IN,
  ACCOUNT_TYPES,
  VERIFICATION_PURPOSES,
  IDENTIFIER_TYPES,
};
