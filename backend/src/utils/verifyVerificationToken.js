import jwt from "jsonwebtoken";

const JWT_ALGORITHM = "HS256";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
};

export const verifyVerificationToken = (token, expectedPurpose) => {
  if (!token) {
    throw new Error("Verification token is required");
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
    throw new Error("Invalid or expired verification token");
  }

  if (payload.tokenType !== "verification") {
    throw new Error("Invalid verification token type");
  }

  if (!["registration", "password_reset"].includes(payload.purpose)) {
    throw new Error("Invalid verification purpose");
  }

  if (expectedPurpose && payload.purpose !== expectedPurpose) {
    throw new Error("Verification token purpose mismatch");
  }

  if (!payload.identifier) {
    throw new Error("Verification token identifier is missing");
  }

  if (!["phone", "email"].includes(payload.identifierType)) {
    throw new Error("Invalid verification identifier type");
  }

  return payload;
};
