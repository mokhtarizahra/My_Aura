import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it } from "vitest";

import { generateToken, JWT_CONFIG } from "./generateToken.js";

describe("Utility: generateToken", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_ISSUER = "myaura";
    process.env.JWT_AUDIENCE = "myaura-api";
  });

  it("should generate a valid JWT", () => {
    const token = generateToken(
      {
        sub: "123",
        tokenType: "access",
      },
      "15m",
    );

    expect(typeof token).toBe("string");

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: [JWT_CONFIG.algorithm],
      issuer: "myaura",
      audience: "myaura-api",
    });

    expect(decoded.sub).toBe("123");
    expect(decoded.tokenType).toBe("access");
  });

  it("should use the configured algorithm", () => {
    const token = generateToken(
      {
        sub: "123",
      },
      "15m",
    );

    const decoded = jwt.decode(token, {
      complete: true,
    });

    expect(decoded.header.alg).toBe("HS256");
  });

  it("should set expiration", () => {
    const token = generateToken(
      {
        sub: "123",
      },
      "15m",
    );

    const decoded = jwt.decode(token);

    expect(decoded.exp).toBeDefined();
    expect(decoded.iat).toBeDefined();
    expect(decoded.exp).toBeGreaterThan(decoded.iat);
  });

  it("should reject an invalid payload", () => {
    expect(() => generateToken(null, "15m")).toThrow(
      "JWT payload must be an object",
    );
  });

  it("should reject missing expiration", () => {
    expect(() => generateToken({ sub: "123" })).toThrow(
      "JWT expiration is required",
    );
  });

  it("should reject missing JWT secret", () => {
    delete process.env.JWT_SECRET;

    expect(() => generateToken({ sub: "123" }, "15m")).toThrow(
      "JWT_SECRET is not configured",
    );
  });

  it("should preserve custom issuer and audience", () => {
    const token = generateToken(
      {
        sub: "123",
      },
      "10m",
      {
        issuer: "custom-issuer",
        audience: "custom-audience",
      },
    );

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "custom-issuer",
      audience: "custom-audience",
    });

    expect(decoded.sub).toBe("123");
  });
});
