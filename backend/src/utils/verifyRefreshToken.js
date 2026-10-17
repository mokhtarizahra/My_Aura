import jwt from "jsonwebtoken";
import { authErrors } from "../errors/authErrors.js";

const JWT_ALGORITHM = "HS256";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw authErrors.jwtSecretNotConfigured();
  return secret;
};

export const verifyRefreshToken = (token) => {
  if (!token) throw authErrors.refreshTokenRequired();

  const verifyOptions = { algorithms: [JWT_ALGORITHM] };
  if (process.env.JWT_ISSUER) verifyOptions.issuer = process.env.JWT_ISSUER;
  if (process.env.JWT_AUDIENCE)
    verifyOptions.audience = process.env.JWT_AUDIENCE;

  let payload;
  try {
    payload = jwt.verify(token, getJwtSecret(), verifyOptions);
  } catch {
    throw authErrors.refreshTokenInvalidOrExpired();
  }

  if (payload.tokenType !== "refresh")
    throw authErrors.refreshTokenInvalidType();
  if (!payload.sub) throw authErrors.refreshTokenSubjectMissing();

  if (!["personal", "organization", "staff"].includes(payload.accountType)) {
    throw authErrors.accountTypeInvalid();
  }

  return payload;
};
