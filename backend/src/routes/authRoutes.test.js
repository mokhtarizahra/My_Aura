import express from "express";

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../controllers/authController.js", () => ({
  requestOTP: vi.fn((req, res) =>
    res.status(200).json({ controller: "requestOTP" }),
  ),

  verifyOTPController: vi.fn((req, res) =>
    res.status(200).json({ controller: "verifyOTPController" }),
  ),

  register: vi.fn((req, res) =>
    res.status(200).json({ controller: "register" }),
  ),

  loginWithPassword: vi.fn((req, res) =>
    res.status(200).json({ controller: "loginWithPassword" }),
  ),

  setPassword: vi.fn((req, res) =>
    res.status(200).json({ controller: "setPassword" }),
  ),

  changePassword: vi.fn((req, res) =>
    res.status(200).json({ controller: "changePassword" }),
  ),

  revokeSessionByIdController: vi.fn((req, res) =>
    res.status(200).json({ controller: "revokeSessionByIdController" }),
  ),

  refreshAccessToken: vi.fn((req, res) =>
    res.status(200).json({ controller: "refreshAccessToken" }),
  ),

  logout: vi.fn((req, res) => res.status(200).json({ controller: "logout" })),

  getSessions: vi.fn((req, res) =>
    res.status(200).json({ controller: "getSessions" }),
  ),

  getSessionHistoryController: vi.fn((req, res) =>
    res.status(200).json({
      controller: "getSessionHistoryController",
    }),
  ),

  revokeSession: vi.fn((req, res) =>
    res.status(200).json({ controller: "revokeSession" }),
  ),

  revokeAllSessions: vi.fn((req, res) =>
    res.status(200).json({
      controller: "revokeAllSessions",
    }),
  ),
}));

vi.mock("../middlewares/auth.middleware.js", () => ({
  authenticateAccessToken: vi.fn((req, res, next) => {
    req.auth = {
      accountId: "account-1",
      accountType: "personal",
    };

    next();
  }),
}));

import request from "supertest";

import authRoutes from "./authRoutes.js";

describe("Authentication: authRoutes", () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();

    app = express();

    app.use(express.json());

    app.use("/api/auth", authRoutes);
  });

  describe("Public Authentication Routes", () => {
    it("should route POST /otp/request to requestOTP", async () => {
      const response = await request(app).post("/api/auth/otp/request").send({
        identifier: "+989121234567",
        identifierType: "phone",
        purpose: "registration",
      });

      expect(response.status).toBe(200);

      expect(response.body.controller).toBe("requestOTP");
    });

    it("should route POST /otp/verify to verifyOTPController", async () => {
      const response = await request(app).post("/api/auth/otp/verify").send({
        identifier: "+989121234567",
        identifierType: "phone",
        purpose: "registration",
        otp: "1234",
      });

      expect(response.status).toBe(200);

      expect(response.body.controller).toBe("verifyOTPController");
    });

    it("should route POST /register to register", async () => {
      const response = await request(app).post("/api/auth/register").send({
        verificationToken: "verification-token",
        firstName: "Ali",
        lastName: "Rezaei",
        password: "StrongPassword123!",
      });

      expect(response.status).toBe(200);

      expect(response.body.controller).toBe("register");
    });

    it("should route POST /login to loginWithPassword", async () => {
      const response = await request(app).post("/api/auth/login").send({
        identifier: "+989121234567",
        identifierType: "phone",
        password: "StrongPassword123!",
      });

      expect(response.status).toBe(200);

      expect(response.body.controller).toBe("loginWithPassword");
    });

    it("should route POST /password/reset to setPassword", async () => {
      const response = await request(app)
        .post("/api/auth/password/reset")
        .send({
          verificationToken: "verification-token",
          password: "NewStrongPassword123!",
        });

      expect(response.status).toBe(200);

      expect(response.body.controller).toBe("setPassword");
    });
  });

  describe("Token Routes", () => {
    it("should route POST /refresh to refreshAccessToken", async () => {
      const response = await request(app).post("/api/auth/refresh");

      expect(response.status).toBe(200);

      expect(response.body.controller).toBe("refreshAccessToken");
    });

    it("should route POST /logout to logout", async () => {
      const response = await request(app).post("/api/auth/logout");

      expect(response.status).toBe(200);

      expect(response.body.controller).toBe("logout");
    });
  });

  describe("Session Routes", () => {
    it("should route GET /sessions to getSessions", async () => {
      const response = await request(app).get("/api/auth/sessions");

      expect(response.status).toBe(200);

      expect(response.body.controller).toBe("getSessions");
    });

    it("should route GET /sessions/history to getSessionHistoryController", async () => {
      const response = await request(app).get("/api/auth/sessions/history");

      expect(response.status).toBe(200);

      expect(response.body.controller).toBe("getSessionHistoryController");
    });

    it("should route DELETE /sessions/current to revokeSession", async () => {
      const response = await request(app).delete("/api/auth/sessions/current");

      expect(response.status).toBe(200);

      expect(response.body.controller).toBe("revokeSession");
    });

    it("should route DELETE /sessions to revokeAllSessions", async () => {
      const response = await request(app).delete("/api/auth/sessions");

      expect(response.status).toBe(200);

      expect(response.body.controller).toBe("revokeAllSessions");
    });
  });

  describe("HTTP Method Restrictions", () => {
    it("should reject GET /login", async () => {
      const response = await request(app).get("/api/auth/login");

      expect(response.status).toBe(404);
    });

    it("should reject GET /register", async () => {
      const response = await request(app).get("/api/auth/register");

      expect(response.status).toBe(404);
    });

    it("should reject POST /sessions", async () => {
      const response = await request(app).post("/api/auth/sessions");

      expect(response.status).toBe(404);
    });
  });

  describe("Route Existence", () => {
    it("should return 404 for an unknown authentication endpoint", async () => {
      const response = await request(app).get("/api/auth/unknown");

      expect(response.status).toBe(404);
    });
  });
});
