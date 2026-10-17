import jwt from "jsonwebtoken";
import { authErrors } from "../errors/authErrors.js";

const JWT_ALGORITHM = "HS256";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw authErrors.jwtSecretNotConfigured();
  return secret;
};

export const verifyVerificationToken = (token, expectedPurpose) => {
  if (!token) throw authErrors.verificationTokenRequired();

  const verifyOptions = { algorithms: [JWT_ALGORITHM] };
  if (process.env.JWT_ISSUER) verifyOptions.issuer = process.env.JWT_ISSUER;
  if (process.env.JWT_AUDIENCE) verifyOptions.audience = process.env.JWT_AUDIENCE;

  let payload;
  try {
    payload = jwt.verify(token, getJwtSecret(), verifyOptions);
  } catch {
    throw authErrors.verificationTokenInvalidOrExpired();
  }

  if (payload.tokenType !== "verification") {
    throw authErrors.verificationTokenInvalidType();
  }

  if (!["registration", "password_reset"].includes(payload.purpose)) {
    throw authErrors.verificationPurposeInvalid();
  }

  if (expectedPurpose && payload.purpose !== expectedPurpose) {
    throw authErrors.verificationTokenPurposeMismatch();
  }

  if (!payload.identifier) {
    throw authErrors.verificationTokenIdentifierMissing();
  }

  if (!["phone", "email"].includes(payload.identifierType)) {
    throw authErrors.verificationIdentifierTypeInvalid();
  }

  return payload;
};