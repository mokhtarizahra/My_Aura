import jwt from "jsonwebtoken";
import { authErrors } from "../errors/authErrors.js";

const JWT_ALGORITHM = "HS256";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw authErrors.jwtSecretNotConfigured();
  return secret;
};

export const generateToken = (payload, expiresIn, options = {}) => {
  if (!payload || typeof payload !== "object") {
    throw authErrors.jwtPayloadInvalid();
  }

  if (!expiresIn) {
    throw authErrors.jwtExpirationRequired();
  }

  const {
    issuer = process.env.JWT_ISSUER,
    audience = process.env.JWT_AUDIENCE,
  } = options;

  const signOptions = { algorithm: JWT_ALGORITHM, expiresIn };
  if (issuer) signOptions.issuer = issuer;
  if (audience) signOptions.audience = audience;

  return jwt.sign(payload, getJwtSecret(), signOptions);
};

export const JWT_CONFIG = { algorithm: JWT_ALGORITHM };