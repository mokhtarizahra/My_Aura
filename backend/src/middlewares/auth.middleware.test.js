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

    it("should reject when verification returns no payload", async () => {
      verifyAccessToken.mockReturnValue(null);

      const response = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer token");

      expect(response.status).toBe(401);

      expect(response.body.message).toBe("Invalid access token");
    });
  });

  describe("Access token payload validation", () => {
    it("should reject a token without subject", async () => {
      verifyAccessToken.mockReturnValue({
        accountType: "personal",
        tokenType: "access",
      });

      const response = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer token");

      expect(response.status).toBe(401);

      expect(response.body.message).toBe("Invalid access token");
    });

    it("should reject a token without account type", async () => {
      verifyAccessToken.mockReturnValue({
        sub: "account-1",
        tokenType: "access",
      });

      const response = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer token");

      expect(response.status).toBe(401);

      expect(response.body.message).toBe("Invalid access token");
    });

    it("should reject a non-access token", async () => {
      verifyAccessToken.mockReturnValue({
        sub: "account-1",
        accountType: "personal",
        tokenType: "refresh",
      });

      const response = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer token");

      expect(response.status).toBe(401);

      expect(response.body.message).toBe("Invalid access token");
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
