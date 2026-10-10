import jwt from "jsonwebtoken";

const JWT_ALGORITHM = "HS256";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
};

export const verifyAccessToken = (token) => {
  if (!token) {
    throw new Error("Access token is required");
  }

  const verifyOptions = {
    algorithms: [JWT_ALGORITHM],
  };

  if (process.env.JWT_ISSUER) {
    verifyOptions.issuer = process.env.JWT_ISSUER;
  }

  if (process.env.JWT_AUDIENCE) {
    verifyOptions.audience = process.env.JWT_AUDIENCE;
  }

  let payload;

  try {
    payload = jwt.verify(token, getJwtSecret(), verifyOptions);
  } catch {
    throw new Error("Invalid or expired access token");
  }

  if (payload.tokenType !== "access") {
    throw new Error("Invalid access token type");
  }

  if (!payload.sub) {
    throw new Error("Access token subject is missing");
  }

  if (!["personal", "organization", "staff"].includes(payload.accountType)) {
    throw new Error("Invalid account type");
  }

  return payload;
};
