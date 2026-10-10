import { beforeEach, describe, expect, it } from "vitest";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/authentication/token.service.js";

import { verifyRefreshToken } from "./verifyRefreshToken.js";

describe("Utility: verifyRefreshToken", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";

    process.env.JWT_ISSUER = "myaura";

    process.env.JWT_AUDIENCE = "myaura-api";
  });

  it("should verify a valid refresh token", () => {
    const token = generateRefreshToken("123", "personal");

    const payload = verifyRefreshToken(token);

    expect(payload.sub).toBe("123");

    expect(payload.accountType).toBe("personal");

    expect(payload.tokenType).toBe("refresh");
  });

  it("should reject an access token", () => {
    const token = generateAccessToken("123", "personal");

    expect(() => verifyRefreshToken(token)).toThrow(
      "Invalid refresh token type",
    );
  });

  it("should reject an invalid token", () => {
    expect(() => verifyRefreshToken("invalid-token")).toThrow(
      "Invalid or expired refresh token",
    );
  });

  it("should reject a missing token", () => {
    expect(() => verifyRefreshToken(null)).toThrow("Refresh token is required");
  });

  it("should reject an invalid account type", () => {
    const jwt = require("jsonwebtoken");

    const token = jwt.sign(
      {
        sub: "123",
        accountType: "admin",
        tokenType: "refresh",
      },
      process.env.JWT_SECRET,
      {
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE,
      },
    );

    expect(() => verifyRefreshToken(token)).toThrow("Invalid account type");
  });
});
