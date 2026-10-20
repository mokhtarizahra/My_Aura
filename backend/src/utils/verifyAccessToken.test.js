import { beforeEach, describe, expect, it } from "vitest";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/authentication/token.service.js";

import { verifyAccessToken } from "./verifyAccessToken.js";

describe("Utility: verifyAccessToken", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";

    process.env.JWT_ISSUER = "myaura";

    process.env.JWT_AUDIENCE = "myaura-api";
  });

  it("should verify a valid access token", () => {
    const token = generateAccessToken("123", "personal");

    const payload = verifyAccessToken(token);

    expect(payload.sub).toBe("123");

    expect(payload.accountType).toBe("personal");

    expect(payload.tokenType).toBe("access");
  });

  it("should reject a refresh token", () => {
    const token = generateRefreshToken("123", "personal");

    expect(() => verifyAccessToken(token)).toThrow("Invalid access token type");
  });

  it("should reject an invalid token", () => {
    expect(() => verifyAccessToken("invalid-token")).toThrow(
      "Invalid or expired access token",
    );
  });

  it("should reject a missing token", () => {
    expect(() => verifyAccessToken(null)).toThrow("Access token is required");
  });

  it("should reject an invalid account type", () => {
    const jwt = require("jsonwebtoken");

    const token = jwt.sign(
      {
        sub: "123",
        accountType: "admin",
        tokenType: "access",
      },
      process.env.JWT_SECRET,
      {
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE,
      },
    );

    expect(() => verifyAccessToken(token)).toThrow("Invalid account type");
  });
});
