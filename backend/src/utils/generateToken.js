import jwt from "jsonwebtoken";

const JWT_ALGORITHM = "HS256";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
};

export const generateToken = (payload, expiresIn, options = {}) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("JWT payload must be an object");
  }

  if (!expiresIn) {
    throw new Error("JWT expiration is required");
  }

  const {
    issuer = process.env.JWT_ISSUER,
    audience = process.env.JWT_AUDIENCE,
  } = options;

  const signOptions = {
    algorithm: JWT_ALGORITHM,
    expiresIn,
  };

  if (issuer) {
    signOptions.issuer = issuer;
  }

  if (audience) {
    signOptions.audience = audience;
  }

  return jwt.sign(payload, getJwtSecret(), signOptions);
};

export const JWT_CONFIG = {
  algorithm: JWT_ALGORITHM,
};
