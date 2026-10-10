import jwt from "jsonwebtoken";

import { beforeEach, describe, expect, it } from "vitest";

import {
  generateAccessToken,
  generateRefreshToken,
  generateVerificationToken,
  verifyVerificationToken,
  TOKEN_CONFIG,
} from "./token.service.js";

describe("Authentication: token.service", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";

    process.env.JWT_ISSUER = "myaura";

    process.env.JWT_AUDIENCE = "myaura-api";
  });

  const verifyToken = (token) =>
    jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "myaura",
      audience: "myaura-api",
    });

  describe("generateAccessToken", () => {
    it("should generate a personal access token", () => {
      const token = generateAccessToken("123", "personal");

      const decoded = verifyToken(token);

      expect(decoded.sub).toBe("123");

      expect(decoded.accountType).toBe("personal");

      expect(decoded.tokenType).toBe("access");
    });

    it("should generate an organization access token", () => {
      const token = generateAccessToken("123", "organization");

      const decoded = verifyToken(token);

      expect(decoded.accountType).toBe("organization");

      expect(decoded.tokenType).toBe("access");
    });

    it("should generate a staff access token", () => {
      const token = generateAccessToken("123", "staff");

      const decoded = verifyToken(token);

      expect(decoded.accountType).toBe("staff");

      expect(decoded.tokenType).toBe("access");
    });

    it("should reject an invalid account type", () => {
      expect(() => generateAccessToken("123", "admin")).toThrow(
        "Invalid account type",
      );
    });

    it("should reject a missing account id", () => {
      expect(() => generateAccessToken(null, "personal")).toThrow(
        "Account ID is required",
      );
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a valid refresh token", () => {
      const token = generateRefreshToken("123", "personal");

      const decoded = verifyToken(token);

      expect(decoded.sub).toBe("123");

      expect(decoded.accountType).toBe("personal");

      expect(decoded.tokenType).toBe("refresh");
    });

    it("should generate a unique jti", () => {
      const token1 = generateRefreshToken("123", "personal");

      const token2 = generateRefreshToken("123", "personal");

      const decoded1 = verifyToken(token1);

      const decoded2 = verifyToken(token2);

      expect(decoded1.jti).toBeDefined();

      expect(decoded2.jti).toBeDefined();

      expect(decoded1.jti).not.toBe(decoded2.jti);
    });

    it("should have an expiration time", () => {
      const token = generateRefreshToken("123", "personal");

      const decoded = verifyToken(token);

      expect(decoded.exp).toBeDefined();

      expect(decoded.iat).toBeDefined();

      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    it("should reject an invalid account type", () => {
      expect(() => generateRefreshToken("123", "admin")).toThrow(
        "Invalid account type",
      );
    });

    it("should reject a missing account id", () => {
      expect(() => generateRefreshToken(null, "personal")).toThrow(
        "Account ID is required",
      );
    });
  });

  describe("generateVerificationToken", () => {
    it("should generate a registration verification token", () => {
      const token = generateVerificationToken({
        identifier: "09123456789",
        identifierType: "phone",
        purpose: "registration",
      });

      const decoded = verifyToken(token);

      expect(decoded.tokenType).toBe("verification");

      expect(decoded.purpose).toBe("registration");

      expect(decoded.identifier).toBe("09123456789");

      expect(decoded.identifierType).toBe("phone");
    });

    it("should generate a password reset verification token", () => {
      const token = generateVerificationToken({
        identifier: "09123456789",
        identifierType: "phone",
        purpose: "password_reset",
      });

      const decoded = verifyToken(token);

      expect(decoded.tokenType).toBe("verification");

      expect(decoded.purpose).toBe("password_reset");
    });

    it("should support email verification", () => {
      const token = generateVerificationToken({
        identifier: "user@example.com",
        identifierType: "email",
        purpose: "registration",
      });

      const decoded = verifyToken(token);

      expect(decoded.identifier).toBe("user@example.com");

      expect(decoded.identifierType).toBe("email");
    });

    it("should reject an invalid identifier type", () => {
      expect(() =>
        generateVerificationToken({
          identifier: "123",
          identifierType: "username",
          purpose: "registration",
        }),
      ).toThrow("Invalid identifier type");
    });

    it("should reject an invalid purpose", () => {
      expect(() =>
        generateVerificationToken({
          identifier: "123",
          identifierType: "phone",
          purpose: "login",
        }),
      ).toThrow("Invalid verification purpose");
    });

    it("should reject a missing identifier", () => {
      expect(() =>
        generateVerificationToken({
          identifier: "",
          identifierType: "phone",
          purpose: "registration",
        }),
      ).toThrow("Identifier is required");
    });
  });

  describe("verifyVerificationToken", () => {
    it("should verify a valid registration verification token", () => {
      const token = generateVerificationToken({
        identifier: "09123456789",
        identifierType: "phone",
        purpose: "registration",
      });

      const payload = verifyVerificationToken(token);

      expect(payload.tokenType).toBe("verification");

      expect(payload.identifier).toBe("09123456789");

      expect(payload.identifierType).toBe("phone");

      expect(payload.purpose).toBe("registration");
    });

    it("should verify a password reset verification token", () => {
      const token = generateVerificationToken({
        identifier: "09123456789",
        identifierType: "phone",
        purpose: "password_reset",
      });

      const payload = verifyVerificationToken(token);

      expect(payload.purpose).toBe("password_reset");
    });

    it("should accept the expected purpose when it matches", () => {
      const token = generateVerificationToken({
        identifier: "09123456789",
        identifierType: "phone",
        purpose: "registration",
      });

      const payload = verifyVerificationToken(token, "registration");

      expect(payload.purpose).toBe("registration");
    });

    it("should reject a purpose mismatch", () => {
      const token = generateVerificationToken({
        identifier: "09123456789",
        identifierType: "phone",
        purpose: "registration",
      });

      expect(() => verifyVerificationToken(token, "password_reset")).toThrow(
        "Verification token purpose mismatch",
      );
    });

    it("should reject a missing verification token", () => {
      expect(() => verifyVerificationToken(null)).toThrow(
        "Verification token is required",
      );
    });

    it("should reject a malformed token", () => {
      expect(() => verifyVerificationToken("invalid-token")).toThrow(
        "Invalid or expired verification token",
      );
    });

    it("should reject a token signed with the wrong secret", () => {
      const token = jwt.sign(
        {
          tokenType: "verification",
          purpose: "registration",
          identifier: "09123456789",
          identifierType: "phone",
        },
        "wrong-secret",
        {
          expiresIn: "10m",
          issuer: "myaura",
          audience: "myaura-api",
        },
      );

      expect(() => verifyVerificationToken(token)).toThrow(
        "Invalid or expired verification token",
      );
    });

    it("should reject an expired verification token", () => {
      const token = jwt.sign(
        {
          tokenType: "verification",
          purpose: "registration",
          identifier: "09123456789",
          identifierType: "phone",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "-1s",
          issuer: "myaura",
          audience: "myaura-api",
        },
      );

      expect(() => verifyVerificationToken(token)).toThrow(
        "Invalid or expired verification token",
      );
    });

    it("should reject a non-verification token", () => {
      const token = generateAccessToken("123", "personal");

      expect(() => verifyVerificationToken(token)).toThrow(
        "Invalid verification token type",
      );
    });

    it("should reject a token with an invalid identifier type", () => {
      const token = jwt.sign(
        {
          tokenType: "verification",
          purpose: "registration",
          identifier: "09123456789",
          identifierType: "username",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "10m",
          issuer: "myaura",
          audience: "myaura-api",
        },
      );

      expect(() => verifyVerificationToken(token)).toThrow(
        "Invalid identifier type",
      );
    });

    it("should reject a token with an invalid purpose", () => {
      const token = jwt.sign(
        {
          tokenType: "verification",
          purpose: "login",
          identifier: "09123456789",
          identifierType: "phone",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "10m",
          issuer: "myaura",
          audience: "myaura-api",
        },
      );

      expect(() => verifyVerificationToken(token)).toThrow(
        "Invalid verification purpose",
      );
    });

    it("should reject a token without identifier", () => {
      const token = jwt.sign(
        {
          tokenType: "verification",
          purpose: "registration",
          identifierType: "phone",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "10m",
          issuer: "myaura",
          audience: "myaura-api",
        },
      );

      expect(() => verifyVerificationToken(token)).toThrow(
        "Invalid verification token identifier",
      );
    });

    it("should reject a token without purpose", () => {
      const token = jwt.sign(
        {
          tokenType: "verification",
          identifier: "09123456789",
          identifierType: "phone",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "10m",
          issuer: "myaura",
          audience: "myaura-api",
        },
      );

      expect(() => verifyVerificationToken(token)).toThrow(
        "Invalid verification token purpose",
      );
    });

    it("should reject an invalid expected purpose", () => {
      const token = generateVerificationToken({
        identifier: "09123456789",
        identifierType: "phone",
        purpose: "registration",
      });

      expect(() => verifyVerificationToken(token, "login")).toThrow(
        "Invalid verification purpose",
      );
    });
  });

  describe("TOKEN_CONFIG", () => {
    it("should expose configured token lifetimes", () => {
      expect(TOKEN_CONFIG.ACCESS_TOKEN_EXPIRES_IN).toBe("15m");

      expect(TOKEN_CONFIG.REFRESH_TOKEN_EXPIRES_IN).toBe("7d");

      expect(TOKEN_CONFIG.VERIFICATION_TOKEN_EXPIRES_IN).toBe("10m");
    });

    it("should expose supported account types", () => {
      expect(TOKEN_CONFIG.ACCOUNT_TYPES).toEqual([
        "personal",
        "organization",
        "staff",
      ]);
    });

    it("should expose supported verification purposes", () => {
      expect(TOKEN_CONFIG.VERIFICATION_PURPOSES).toEqual([
        "registration",
        "password_reset",
      ]);
    });

    it("should expose supported identifier types", () => {
      expect(TOKEN_CONFIG.IDENTIFIER_TYPES).toEqual(["phone", "email"]);
    });
  });
});
