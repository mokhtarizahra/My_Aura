import express from "express";

import request from "supertest";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { authenticateAccessToken } from "./auth.middleware.js";

import { verifyAccessToken } from "../utils/verifyAccessToken.js";

vi.mock("../utils/verifyAccessToken.js", () => ({
  verifyAccessToken: vi.fn(),
}));

describe("Authentication: auth.middleware", () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();

    app = express();

    app.get("/protected", authenticateAccessToken, (req, res) => {
      res.status(200).json({
        success: true,
        auth: req.auth,
      });
    });
  });

  describe("Authorization header", () => {
    it("should reject a request without Authorization header", async () => {
      const response = await request(app).get("/protected");

      expect(response.status).toBe(401);

      expect(response.body.success).toBe(false);

      expect(response.body.message).toBe("Access token required");

      expect(verifyAccessToken).not.toHaveBeenCalled();
    });

    it("should reject an invalid Authorization scheme", async () => {
      const response = await request(app)
        .get("/protected")
        .set("Authorization", "Basic some-token");

      expect(response.status).toBe(401);

      expect(response.body.success).toBe(false);

      expect(response.body.message).toBe("Access token required");

      expect(verifyAccessToken).not.toHaveBeenCalled();
    });

    it("should reject an empty Bearer token", async () => {
      const response = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer");

      expect(response.status).toBe(401);

      expect(response.body.message).toBe("Access token required");

      expect(verifyAccessToken).not.toHaveBeenCalled();
    });

    it("should reject an empty token after Bearer", async () => {
      const response = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer ");

      expect(response.status).toBe(401);

      expect(response.body.message).toBe("Access token required");
    });
  });

  describe("Access token verification", () => {
    it("should verify a valid access token", async () => {
      verifyAccessToken.mockReturnValue({
        sub: "account-1",
        accountType: "personal",
        tokenType: "access",
      });

      const response = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);

      expect(verifyAccessToken).toHaveBeenCalledTimes(1);

      expect(verifyAccessToken).toHaveBeenCalledWith("valid-token");
    });

    it("should reject an invalid access token", async () => {
      verifyAccessToken.mockImplementation(() => {
        throw new Error("Invalid or expired access token");
      });

      const response = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);

      expect(response.body.success).toBe(false);

      expect(response.body.message).toBe("Invalid or expired access token");
    });

    it("should reject when verification returns a falsy payload (defensive)", async () => {
      verifyAccessToken.mockReturnValue(null);

      const response = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer token");

      expect(response.status).toBe(401);
      // Since the payload is null, accessing payload.sub throws a TypeError
      // which is caught and converted to the generic "Invalid or expired"
      expect(response.body.message).toBe("Invalid or expired access token");
    });
  });

    describe("Access token payload validation", () => {
    /*
     * Note: The actual validation of sub/accountType/tokenType is done
     * inside verifyAccessToken (which throws AppError). The middleware
     * only propagates those errors to the 401 response.
     */

    it("should propagate ACCESS_TOKEN_SUBJECT_MISSING error", async () => {
      const { AppError } = await import("../errors/AppError.js");
      verifyAccessToken.mockImplementation(() => {
        throw new AppError(
          "ACCESS_TOKEN_SUBJECT_MISSING",
          401,
          "Access token subject is missing",
        );
      });

      const response = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer token");

      expect(response.status).toBe(401);
      expect(response.body.code).toBe("ACCESS_TOKEN_SUBJECT_MISSING");
    });

    it("should propagate ACCOUNT_TYPE_INVALID error", async () => {
      const { AppError } = await import("../errors/AppError.js");
      verifyAccessToken.mockImplementation(() => {
        throw new AppError(
          "ACCOUNT_TYPE_INVALID",
          400,
          "Invalid account type",
        );
      });

      const response = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer token");

      // Auth failures always return 401, regardless of AppError.status
      expect(response.status).toBe(401);
      expect(response.body.code).toBe("ACCOUNT_TYPE_INVALID");
    });

    it("should propagate ACCESS_TOKEN_INVALID_TYPE error", async () => {
      const { AppError } = await import("../errors/AppError.js");
      verifyAccessToken.mockImplementation(() => {
        throw new AppError(
          "ACCESS_TOKEN_INVALID_TYPE",
          401,
          "Invalid access token type",
        );
      });

      const response = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer token");

      expect(response.status).toBe(401);
      expect(response.body.code).toBe("ACCESS_TOKEN_INVALID_TYPE");
    });
  });

  describe("Authentication context", () => {
    it("should attach personal account authentication context to req.auth", async () => {
      verifyAccessToken.mockReturnValue({
        sub: "account-1",
        accountType: "personal",
        tokenType: "access",
      });

      const response = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);

      expect(response.body.auth).toEqual({
        accountId: "account-1",
        accountType: "personal",
      });
    });

    it("should attach organization account authentication context", async () => {
      verifyAccessToken.mockReturnValue({
        sub: "organization-account-1",
        accountType: "organization",
        tokenType: "access",
      });

      const response = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);

      expect(response.body.auth).toEqual({
        accountId: "organization-account-1",
        accountType: "organization",
      });
    });

    it("should attach staff account authentication context", async () => {
      verifyAccessToken.mockReturnValue({
        sub: "staff-account-1",
        accountType: "staff",
        tokenType: "access",
      });

      const response = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);

      expect(response.body.auth).toEqual({
        accountId: "staff-account-1",
        accountType: "staff",
      });
    });
  });

  describe("Middleware control flow", () => {
    it("should call next by allowing the protected controller to execute", async () => {
      verifyAccessToken.mockReturnValue({
        sub: "account-1",
        accountType: "personal",
        tokenType: "access",
      });

      const response = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);

      expect(response.body.success).toBe(true);
    });

    it("should not expose the raw token through req.auth", async () => {
      verifyAccessToken.mockReturnValue({
        sub: "account-1",
        accountType: "personal",
        tokenType: "access",
      });

      const response = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer secret-token");

      expect(response.status).toBe(200);

      expect(response.body.auth).not.toHaveProperty("token");

      expect(response.body.auth).not.toHaveProperty("accessToken");
    });
  });
});
