import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * --------------------------------------------------------------------------
 * Service mocks
 * --------------------------------------------------------------------------
 */

vi.mock("../services/authentication/registration.service.js", () => ({
  registerPersonalAccount: vi.fn(),
}));

vi.mock("../services/authentication/account.service.js", () => ({
  findAccountForLogin: vi.fn(),
  findPersonalAccount: vi.fn(),
  findAccountById: vi.fn(),
  comparePassword: vi.fn(),
  setAccountPassword: vi.fn(),
  requireActiveAccount: vi.fn(),
  updateLastLogin: vi.fn(),
}));

vi.mock("../services/authentication/otp.service.js", () => ({
  sendOTP: vi.fn(),
  verifyOTP: vi.fn(),
}));

vi.mock("../services/authentication/token.service.js", () => ({
  generateAccessToken: vi.fn(),
  verifyVerificationToken: vi.fn(),
}));

vi.mock("../services/authentication/refreshToken.service.js", () => ({
  createRefreshToken: vi.fn(),
  validateRefreshToken: vi.fn(),
  rotateRefreshToken: vi.fn(),
  revokeRefreshToken: vi.fn(),
  revokeAllRefreshTokens: vi.fn(),
  getActiveSessions: vi.fn(),
  getSessionHistory: vi.fn(),
}));

/*
 * --------------------------------------------------------------------------
 * Imports
 * --------------------------------------------------------------------------
 */

import { registerPersonalAccount } from "../services/authentication/registration.service.js";

import {
  comparePassword,
  findAccountById,
  findAccountForLogin,
  findPersonalAccount,
  requireActiveAccount,
  setAccountPassword,
  updateLastLogin,
} from "../services/authentication/account.service.js";

import { sendOTP, verifyOTP } from "../services/authentication/otp.service.js";

import {
  generateAccessToken,
  verifyVerificationToken,
} from "../services/authentication/token.service.js";

import {
  createRefreshToken,
  getActiveSessions,
  getSessionHistory,
  revokeAllRefreshTokens,
  revokeRefreshToken,
  rotateRefreshToken,
  validateRefreshToken,
} from "../services/authentication/refreshToken.service.js";

import {
  getSessionHistoryController,
  getSessions,
  loginWithPassword,
  logout,
  refreshAccessToken,
  register,
  requestOTP,
  revokeAllSessions,
  revokeSession,
  setPassword,
  verifyOTPController,
} from "./authController.js";

/*
 * --------------------------------------------------------------------------
 * HTTP mocks
 * --------------------------------------------------------------------------
 */

const createRes = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
  cookie: vi.fn().mockReturnThis(),
  clearCookie: vi.fn().mockReturnThis(),
});

const createReq = ({
  body = {},
  headers = {},
  cookies = {},
  ip = "127.0.0.1",
  auth = undefined,
} = {}) => ({
  body,
  headers,
  cookies,
  ip,
  auth,
});

/*
 * --------------------------------------------------------------------------
 * Test suite
 * --------------------------------------------------------------------------
 */

describe("Authentication: authController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /*
   * ======================================================================
   * requestOTP
   * ======================================================================
   */

  describe("requestOTP", () => {
    it("should send registration OTP", async () => {
      sendOTP.mockResolvedValue({
        success: true,
        identifier: "09121111111",
        identifierType: "phone",
        purpose: "registration",
        expiresIn: 120000,
      });

      const req = createReq({
        body: {
          identifier: "09121111111",
          identifierType: "phone",
        },
      });

      const res = createRes();

      await requestOTP(req, res);

      expect(sendOTP).toHaveBeenCalledWith({
        identifier: "09121111111",
        identifierType: "phone",
        purpose: "registration",
      });

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should reject missing identifier", async () => {
      const req = createReq({
        body: {
          identifierType: "phone",
        },
      });

      const res = createRes();

      await requestOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(sendOTP).not.toHaveBeenCalled();
    });

    it("should return conflict when account already exists", async () => {
      sendOTP.mockRejectedValue(new Error("Account already exists"));

      const req = createReq({
        body: {
          identifier: "09121111111",
          identifierType: "phone",
        },
      });

      const res = createRes();

      await requestOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });

    it("should return rate-limit when OTP cooldown is active", async () => {
      sendOTP.mockRejectedValue(new Error("OTP resend cooldown active"));

      const req = createReq({
        body: {
          identifier: "09121111111",
          identifierType: "phone",
        },
      });

      const res = createRes();

      await requestOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(429);
    });
  });

  /*
   * ======================================================================
   * verifyOTPController
   * ======================================================================
   */

  describe("verifyOTPController", () => {
    it("should verify OTP and return verification token", async () => {
      verifyOTP.mockResolvedValue({
        success: true,
        verificationToken: "verification-token",
        identifier: "09121111111",
        identifierType: "phone",
        purpose: "registration",
      });

      const req = createReq({
        body: {
          identifier: "09121111111",
          identifierType: "phone",
          purpose: "registration",
          otp: "1234",
        },
      });

      const res = createRes();

      await verifyOTPController(req, res);

      expect(verifyOTP).toHaveBeenCalledWith({
        identifier: "09121111111",
        identifierType: "phone",
        purpose: "registration",
        otp: "1234",
      });

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should reject missing OTP", async () => {
      const req = createReq({
        body: {
          identifier: "09121111111",
          identifierType: "phone",
          purpose: "registration",
        },
      });

      const res = createRes();

      await verifyOTPController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(verifyOTP).not.toHaveBeenCalled();
    });

    it("should return 401 for invalid OTP", async () => {
      verifyOTP.mockRejectedValue(new Error("Invalid OTP"));

      const req = createReq({
        body: {
          identifier: "09121111111",
          identifierType: "phone",
          purpose: "registration",
          otp: "9999",
        },
      });

      const res = createRes();

      await verifyOTPController(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  /*
   * ======================================================================
   * register
   * ======================================================================
   */

  describe("register", () => {
    it("should register a Personal Account using the verified identifier", async () => {
      verifyVerificationToken.mockReturnValue({
        tokenType: "verification",
        purpose: "registration",
        identifier: "09121111111",
        identifierType: "phone",
      });

      const result = {
        user: {
          _id: "user-id",
          firstName: "Zahra",
          lastName: "Test",
        },
        account: {
          _id: "account-id",
          accountType: "personal",
        },
      };

      registerPersonalAccount.mockResolvedValue(result);

      const req = createReq({
        body: {
          verificationToken: "verification-token",
          firstName: "Zahra",
          lastName: "Test",
          password: "secret123",
        },
      });

      const res = createRes();

      await register(req, res);

      expect(verifyVerificationToken).toHaveBeenCalledWith(
        "verification-token",
        "registration",
      );

      expect(registerPersonalAccount).toHaveBeenCalledWith({
        firstName: "Zahra",
        lastName: "Test",
        identifier: "09121111111",
        identifierType: "phone",
        password: "secret123",
      });

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should reject missing verification token", async () => {
      const req = createReq({
        body: {
          firstName: "Zahra",
          lastName: "Test",
          password: "secret123",
        },
      });

      const res = createRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(verifyVerificationToken).not.toHaveBeenCalled();

      expect(registerPersonalAccount).not.toHaveBeenCalled();
    });

    it("should not trust identifier supplied by the client", async () => {
      verifyVerificationToken.mockReturnValue({
        tokenType: "verification",
        purpose: "registration",
        identifier: "09121111111",
        identifierType: "phone",
      });

      registerPersonalAccount.mockResolvedValue({
        user: {},
        account: {},
      });

      const req = createReq({
        body: {
          verificationToken: "verification-token",
          identifier: "attacker@example.com",
          identifierType: "email",
          firstName: "Zahra",
          lastName: "Test",
          password: "secret123",
        },
      });

      const res = createRes();

      await register(req, res);

      expect(registerPersonalAccount).toHaveBeenCalledWith(
        expect.objectContaining({
          identifier: "09121111111",
          identifierType: "phone",
        }),
      );
    });

    it("should return 401 for invalid verification token", async () => {
      verifyVerificationToken.mockImplementation(() => {
        throw new Error("Invalid or expired verification token");
      });

      const req = createReq({
        body: {
          verificationToken: "bad-token",
          firstName: "Zahra",
          lastName: "Test",
          password: "secret123",
        },
      });

      const res = createRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(401);

      expect(registerPersonalAccount).not.toHaveBeenCalled();
    });
  });

  /*
   * ======================================================================
   * loginWithPassword
   * ======================================================================
   */

  describe("loginWithPassword", () => {
    it("should login a personal account", async () => {
      const account = {
        _id: "personal-account-id",
        status: "active",
        passwordHash: "hashed-password",
      };

      findAccountForLogin.mockResolvedValue(account);

      requireActiveAccount.mockReturnValue(account);

      comparePassword.mockResolvedValue(true);

      generateAccessToken.mockReturnValue("access-token");

      createRefreshToken.mockResolvedValue({
        refreshToken: "refresh-token",
        session: {
          _id: "session-id",
        },
      });

      updateLastLogin.mockResolvedValue(account);

      const req = createReq({
        body: {
          identifier: "09121111111",
          identifierType: "phone",
          accountType: "personal",
          password: "secret123",
        },
        headers: {
          "user-agent": "Vitest",
        },
      });

      const res = createRes();

      await loginWithPassword(req, res);

      expect(findAccountForLogin).toHaveBeenCalledWith({
        identifier: "09121111111",
        identifierType: "phone",
        accountType: "personal",
      });

      expect(requireActiveAccount).toHaveBeenCalledWith(account);

      expect(comparePassword).toHaveBeenCalledWith(
        "secret123",
        "hashed-password",
      );

      expect(generateAccessToken).toHaveBeenCalledWith(
        "personal-account-id",
        "personal",
      );

      expect(createRefreshToken).toHaveBeenCalledWith({
        accountId: "personal-account-id",
        accountType: "personal",
        userAgent: "Vitest",
        ip: "127.0.0.1",
      });

      expect(updateLastLogin).toHaveBeenCalledWith({
        accountId: "personal-account-id",
        accountType: "personal",
      });

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should reject invalid credentials", async () => {
      findAccountForLogin.mockResolvedValue({
        _id: "account-id",
        status: "active",
        passwordHash: "hashed",
      });

      requireActiveAccount.mockReturnValue(true);

      comparePassword.mockResolvedValue(false);

      const req = createReq({
        body: {
          identifier: "09121111111",
          identifierType: "phone",
          accountType: "personal",
          password: "wrong",
        },
      });

      const res = createRes();

      await loginWithPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(401);

      expect(generateAccessToken).not.toHaveBeenCalled();

      expect(createRefreshToken).not.toHaveBeenCalled();

      expect(updateLastLogin).not.toHaveBeenCalled();
    });

    it("should reject a missing account without revealing account existence", async () => {
      findAccountForLogin.mockResolvedValue(null);

      const req = createReq({
        body: {
          identifier: "09121111111",
          identifierType: "phone",
          accountType: "personal",
          password: "secret123",
        },
      });

      const res = createRes();

      await loginWithPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("should reject an inactive account", async () => {
      findAccountForLogin.mockResolvedValue({
        _id: "account-id",
        status: "suspended",
        passwordHash: "hashed",
      });

      requireActiveAccount.mockImplementation(() => {
        throw new Error("Account is not active");
      });

      const req = createReq({
        body: {
          identifier: "09121111111",
          identifierType: "phone",
          accountType: "personal",
          password: "secret123",
        },
      });

      const res = createRes();

      await loginWithPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(403);

      expect(comparePassword).not.toHaveBeenCalled();
    });
  });

  /*
   * ======================================================================
   * setPassword
   * ======================================================================
   */

  describe("setPassword", () => {
    it("should reset password and revoke all sessions", async () => {
      verifyVerificationToken.mockReturnValue({
        tokenType: "verification",
        purpose: "password_reset",
        identifier: "09121111111",
        identifierType: "phone",
      });

      const account = {
        _id: "personal-account-id",
        status: "active",
      };

      findPersonalAccount.mockResolvedValue(account);

      setAccountPassword.mockResolvedValue(account);

      revokeAllRefreshTokens.mockResolvedValue(2);

      const req = createReq({
        body: {
          verificationToken: "verification-token",
          password: "newpassword",
        },
      });

      const res = createRes();

      await setPassword(req, res);

      expect(verifyVerificationToken).toHaveBeenCalledWith(
        "verification-token",
        "password_reset",
      );

      expect(findPersonalAccount).toHaveBeenCalledWith({
        phone: "09121111111",
      });

      expect(setAccountPassword).toHaveBeenCalledWith({
        accountId: "personal-account-id",
        accountType: "personal",
        password: "newpassword",
      });

      expect(revokeAllRefreshTokens).toHaveBeenCalledWith({
        accountId: "personal-account-id",
        accountType: "personal",
      });

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should reject missing verification token", async () => {
      const req = createReq({
        body: {
          password: "newpassword",
        },
      });

      const res = createRes();

      await setPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(verifyVerificationToken).not.toHaveBeenCalled();
    });

    it("should reject a short password", async () => {
      const req = createReq({
        body: {
          verificationToken: "token",
          password: "123",
        },
      });

      const res = createRes();

      await setPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(verifyVerificationToken).not.toHaveBeenCalled();
    });

    it("should return 404 when the account does not exist", async () => {
      verifyVerificationToken.mockReturnValue({
        tokenType: "verification",
        purpose: "password_reset",
        identifier: "09121111111",
        identifierType: "phone",
      });

      findPersonalAccount.mockResolvedValue(null);

      const req = createReq({
        body: {
          verificationToken: "verification-token",
          password: "newpassword",
        },
      });

      const res = createRes();

      await setPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);

      expect(setAccountPassword).not.toHaveBeenCalled();

      expect(revokeAllRefreshTokens).not.toHaveBeenCalled();
    });
  });

  /*
   * ======================================================================
   * refreshAccessToken
   * ======================================================================
   */

  describe("refreshAccessToken", () => {
    it("should rotate a valid refresh token", async () => {
      validateRefreshToken.mockResolvedValue({
        payload: {
          sub: "personal-account-id",
          accountType: "personal",
          tokenType: "refresh",
        },
        session: {},
      });

      findAccountById.mockResolvedValue({
        _id: "personal-account-id",
        status: "active",
      });

      requireActiveAccount.mockReturnValue(true);

      rotateRefreshToken.mockResolvedValue({
        refreshToken: "new-refresh-token",
        session: {
          _id: "new-session",
        },
      });

      generateAccessToken.mockReturnValue("new-access-token");

      const req = createReq({
        body: {
          refreshToken: "old-refresh-token",
        },
      });

      const res = createRes();

      await refreshAccessToken(req, res);

      expect(validateRefreshToken).toHaveBeenCalledWith("old-refresh-token");

      expect(findAccountById).toHaveBeenCalledWith({
        accountId: "personal-account-id",
        accountType: "personal",
      });

      expect(rotateRefreshToken).toHaveBeenCalledWith({
        refreshToken: "old-refresh-token",
        userAgent: null,
        ip: "127.0.0.1",
      });

      expect(generateAccessToken).toHaveBeenCalledWith(
        "personal-account-id",
        "personal",
      );

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should accept refresh token from cookie", async () => {
      validateRefreshToken.mockResolvedValue({
        payload: {
          sub: "account-id",
          accountType: "personal",
          tokenType: "refresh",
        },
        session: {},
      });

      findAccountById.mockResolvedValue({
        _id: "account-id",
        status: "active",
      });

      requireActiveAccount.mockReturnValue(true);

      rotateRefreshToken.mockResolvedValue({
        refreshToken: "new-token",
        session: {},
      });

      generateAccessToken.mockReturnValue("access-token");

      const req = createReq({
        cookies: {
          refreshToken: "cookie-token",
        },
      });

      const res = createRes();

      await refreshAccessToken(req, res);

      expect(validateRefreshToken).toHaveBeenCalledWith("cookie-token");
    });

    it("should reject missing refresh token", async () => {
      const req = createReq({
        body: {},
      });

      const res = createRes();

      await refreshAccessToken(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(validateRefreshToken).not.toHaveBeenCalled();
    });
  });

  /*
   * ======================================================================
   * logout
   * ======================================================================
   */

  describe("logout", () => {
    it("should revoke refresh token and clear authentication cookies", async () => {
      revokeRefreshToken.mockResolvedValue(true);

      const req = createReq({
        body: {
          refreshToken: "refresh-token",
        },
      });

      const res = createRes();

      await logout(req, res);

      expect(revokeRefreshToken).toHaveBeenCalledWith("refresh-token");

      expect(res.clearCookie).toHaveBeenCalledWith("accessToken");

      expect(res.clearCookie).toHaveBeenCalledWith("refreshToken", {
        path: "/api/auth",
      });

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should reject missing refresh token", async () => {
      const req = createReq({
        body: {},
      });

      const res = createRes();

      await logout(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(revokeRefreshToken).not.toHaveBeenCalled();
    });
  });

  /*
   * ======================================================================
   * getSessions
   * ======================================================================
   */

  describe("getSessions", () => {
    it("should return active sessions", async () => {
      const sessions = [
        {
          _id: "session-1",
          accountId: "account-id",
          revokedAt: null,
        },
      ];

      getActiveSessions.mockResolvedValue(sessions);

      const req = createReq({
        auth: {
          accountId: "account-id",
          accountType: "personal",
        },
      });

      const res = createRes();

      await getSessions(req, res);

      expect(getActiveSessions).toHaveBeenCalledWith({
        accountId: "account-id",
        accountType: "personal",
      });

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should reject unauthenticated request", async () => {
      const req = createReq();

      const res = createRes();

      await getSessions(req, res);

      expect(res.status).toHaveBeenCalledWith(401);

      expect(getActiveSessions).not.toHaveBeenCalled();
    });
  });

  /*
   * ======================================================================
   * getSessionHistoryController
   * ======================================================================
   */

  describe("getSessionHistoryController", () => {
    it("should return session history", async () => {
      const sessions = [
        {
          _id: "session-1",
          accountId: "account-id",
        },
        {
          _id: "session-2",
          accountId: "account-id",
          revokedAt: new Date(),
        },
      ];

      getSessionHistory.mockResolvedValue(sessions);

      const req = createReq({
        auth: {
          accountId: "account-id",
          accountType: "personal",
        },
      });

      const res = createRes();

      await getSessionHistoryController(req, res);

      expect(getSessionHistory).toHaveBeenCalledWith({
        accountId: "account-id",
        accountType: "personal",
      });

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should reject unauthenticated request", async () => {
      const req = createReq();

      const res = createRes();

      await getSessionHistoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(401);

      expect(getSessionHistory).not.toHaveBeenCalled();
    });
  });

  /*
   * ======================================================================
   * revokeSession
   * ======================================================================
   */

  describe("revokeSession", () => {
    it("should revoke a session", async () => {
      revokeRefreshToken.mockResolvedValue(true);

      const req = createReq({
        body: {
          refreshToken: "refresh-token",
        },
      });

      const res = createRes();

      await revokeSession(req, res);

      expect(revokeRefreshToken).toHaveBeenCalledWith("refresh-token");

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 for missing session", async () => {
      revokeRefreshToken.mockResolvedValue(false);

      const req = createReq({
        body: {
          refreshToken: "unknown-token",
        },
      });

      const res = createRes();

      await revokeSession(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should reject missing refresh token", async () => {
      const req = createReq({
        body: {},
      });

      const res = createRes();

      await revokeSession(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(revokeRefreshToken).not.toHaveBeenCalled();
    });
  });

  /*
   * ======================================================================
   * revokeAllSessions
   * ======================================================================
   */

  describe("revokeAllSessions", () => {
    it("should revoke all sessions", async () => {
      revokeAllRefreshTokens.mockResolvedValue(3);

      const req = createReq({
        auth: {
          accountId: "account-id",
          accountType: "personal",
        },
      });

      const res = createRes();

      await revokeAllSessions(req, res);

      expect(revokeAllRefreshTokens).toHaveBeenCalledWith({
        accountId: "account-id",
        accountType: "personal",
      });

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should reject unauthenticated request", async () => {
      const req = createReq();

      const res = createRes();

      await revokeAllSessions(req, res);

      expect(res.status).toHaveBeenCalledWith(401);

      expect(revokeAllRefreshTokens).not.toHaveBeenCalled();
    });
  });
});
