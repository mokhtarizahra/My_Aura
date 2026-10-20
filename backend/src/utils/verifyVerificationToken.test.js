import { beforeEach, describe, expect, it } from "vitest";

import {
  generateAccessToken,
  generateVerificationToken,
} from "../services/authentication/token.service.js";

import { verifyVerificationToken } from "./verifyVerificationToken.js";

describe("Utility: verifyVerificationToken", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";

    process.env.JWT_ISSUER = "myaura";
    process.env.JWT_AUDIENCE = "myaura-api";
  });

  it("should verify a valid registration token", () => {
    const token = generateVerificationToken({
      identifier: "09123456789",
      identifierType: "phone",
      purpose: "registration",
    });

    const payload = verifyVerificationToken(token, "registration");

    expect(payload.tokenType).toBe("verification");

    expect(payload.purpose).toBe("registration");
  });

  it("should verify a valid password reset token", () => {
    const token = generateVerificationToken({
      identifier: "09123456789",
      identifierType: "phone",
      purpose: "password_reset",
    });

    const payload = verifyVerificationToken(token, "password_reset");

    expect(payload.purpose).toBe("password_reset");
  });

  it("should reject a token with the wrong purpose", () => {
    const token = generateVerificationToken({
      identifier: "09123456789",
      identifierType: "phone",
      purpose: "registration",
    });

    expect(() => verifyVerificationToken(token, "password_reset")).toThrow(
      "Verification token purpose mismatch",
    );
  });

  it("should reject an access token", () => {
    const token = generateAccessToken("123", "personal");

    expect(() => verifyVerificationToken(token, "registration")).toThrow(
      "Invalid verification token type",
    );
  });

  it("should reject an invalid token", () => {
    expect(() =>
      verifyVerificationToken("invalid-token", "registration"),
    ).toThrow("Invalid or expired verification token");
  });

  it("should reject a missing token", () => {
    expect(() => verifyVerificationToken(null, "registration")).toThrow(
      "Verification token is required",
    );
  });
});
