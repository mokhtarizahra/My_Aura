import request from "supertest";
import mongoose from "mongoose";
import { beforeAll, describe, expect, it, vi } from "vitest";

import app from "../../../app.js";

import PersonalUser from "../../../models/identity/PersonalUser.js";
import PersonalAccount from "../../../models/account/PersonalAccount.js";
import TempOTP from "../../../models/authentication/TempOTP.js";
import RefreshToken from "../../../models/authentication/RefreshToken.js";

/*
|--------------------------------------------------------------------------
| Test configuration
|--------------------------------------------------------------------------
*/

const TEST_PHONE = "+989121234567";
const TEST_PASSWORD = "Password123";
const TEST_FIRST_NAME = "Zahra";
const TEST_LAST_NAME = "Test";

const TEST_OTP = "1234";

/*
|--------------------------------------------------------------------------
| OTP control
|--------------------------------------------------------------------------
|
| generateOTP() is random in production.
| For integration tests we control only this primitive.
|
| otp.service.js itself remains REAL.
| MongoDB remains REAL.
| Controller remains REAL.
| Routes remain REAL.
|
*/

vi.mock("../../../utils/generateOTP.js", () => ({
  generateOTP: vi.fn(() => TEST_OTP),
}));

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

/**
 * Request a registration OTP.
 */
const requestRegistrationOTP = async (identifier = TEST_PHONE) => {
  return request(app).post("/api/auth/otp/request").send({
    identifier,
    identifierType: "phone",
  });
};

/**
 * Verify a registration OTP.
 */
const verifyRegistrationOTP = async (
  identifier = TEST_PHONE,
  otp = TEST_OTP,
) => {
  return request(app).post("/api/auth/otp/verify").send({
    identifier,
    identifierType: "phone",
    purpose: "registration",
    otp,
  });
};

/**
 * Complete personal registration.
 */
const registerPersonalAccount = async (verificationToken) => {
  return request(app).post("/api/auth/register").send({
    verificationToken,
    firstName: TEST_FIRST_NAME,
    lastName: TEST_LAST_NAME,
    password: TEST_PASSWORD,
  });
};

/**
 * Complete the complete registration flow.
 */
const createPersonalAccount = async () => {
  const otpResponse = await requestRegistrationOTP();

  expect(otpResponse.status).toBe(200);

  const verifyResponse = await verifyRegistrationOTP();

  expect(verifyResponse.status).toBe(200);

  const verificationToken = verifyResponse.body.data.verificationToken;

  expect(verificationToken).toBeDefined();

  const registrationResponse = await registerPersonalAccount(verificationToken);

  expect(registrationResponse.status).toBe(201);

  return {
    user: registrationResponse.body.data.user,
    account: registrationResponse.body.data.account,
  };
};

/**
 * Login and return the authentication payload.
 */
const login = async (identifier = TEST_PHONE, password = TEST_PASSWORD) => {
  return request(app).post("/api/auth/login").send({
    identifier,
    identifierType: "phone",
    accountType: "personal",
    password,
  });
};

/**
 * Return the PersonalAccount from DB.
 */
const getPersonalAccount = async () => {
  return PersonalAccount.findOne({
    phone: TEST_PHONE,
  }).select("+passwordHash");
};

/**
 * Return refresh-token sessions for the test account.
 */
const getRefreshSessions = async (accountId) => {
  return RefreshToken.find({
    accountId,
    accountType: "personal",
  }).select("+tokenHash");
};

/*
|--------------------------------------------------------------------------
| Authentication Integration
|--------------------------------------------------------------------------
*/

describe("Authentication Integration", () => {
  /*
  |--------------------------------------------------------------------------
  | Environment
  |--------------------------------------------------------------------------
  */

  beforeAll(() => {
    process.env.NODE_ENV = "test";

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET must be configured for integration tests");
    }
  });

  /*
  |--------------------------------------------------------------------------
  | Registration / OTP
  |--------------------------------------------------------------------------
  */

  describe("Registration", () => {
    it("should request a registration OTP and persist it in MongoDB", async () => {
      const response = await requestRegistrationOTP();

      expect(response.status).toBe(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          success: true,
          identifier: TEST_PHONE,
          identifierType: "phone",
          purpose: "registration",
        },
      });

      const otpRecord = await TempOTP.findOne({
        identifier: TEST_PHONE,
        identifierType: "phone",
        purpose: "registration",
      }).select("+otpHash");

      expect(otpRecord).not.toBeNull();

      expect(otpRecord.otpHash).toBeDefined();
      expect(otpRecord.otpHash).not.toBe(TEST_OTP);

      expect(otpRecord.expiresAt.getTime()).toBeGreaterThan(Date.now());

      expect(otpRecord.attempts).toBe(0);
    });

    it("should verify the OTP and return a registration verification token", async () => {
      await requestRegistrationOTP();

      const response = await verifyRegistrationOTP();

      expect(response.status).toBe(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          success: true,
          identifier: TEST_PHONE,
          identifierType: "phone",
          purpose: "registration",
        },
      });

      expect(response.body.data.verificationToken).toBeDefined();

      const otpRecord = await TempOTP.findOne({
        identifier: TEST_PHONE,
        purpose: "registration",
      });

      expect(otpRecord).toBeNull();
    });

    it("should reject an invalid OTP", async () => {
      await requestRegistrationOTP();

      const response = await verifyRegistrationOTP(TEST_PHONE, "9999");

      expect(response.status).toBe(401);

      expect(response.body).toEqual({
        success: false,
        code: "OTP_INVALID",
        message: "Invalid OTP",
      });

      const otpRecord = await TempOTP.findOne({
        identifier: TEST_PHONE,
        purpose: "registration",
      });

      expect(otpRecord).not.toBeNull();
      expect(otpRecord.attempts).toBe(1);
    });

    it("should complete Personal Account registration", async () => {
      const result = await createPersonalAccount();

      expect(result.user).toBeDefined();
      expect(result.account).toBeDefined();

      expect(result.user.firstName).toBe(TEST_FIRST_NAME);

      expect(result.user.lastName).toBe(TEST_LAST_NAME);

      expect(result.account.phone).toBe(TEST_PHONE);

      expect(result.account.status).toBe("active");

      expect(result.account.isVerified).toBe(true);

      const user = await PersonalUser.findById(result.user._id);

      const account = await PersonalAccount.findById(result.account._id).select(
        "+passwordHash",
      );

      expect(user).not.toBeNull();
      expect(account).not.toBeNull();

      expect(account.userId.toString()).toBe(user._id.toString());

      expect(account.passwordHash).toBeDefined();

      expect(account.passwordHash).not.toBe(TEST_PASSWORD);
    });

    it("should reject registration with an invalid verification token", async () => {
      const response = await registerPersonalAccount(
        "invalid-verification-token",
      );

      expect(response.status).toBe(401);

      expect(response.body).toEqual({
        success: false,
        code: "VERIFICATION_TOKEN_INVALID_OR_EXPIRED",
        message: "Invalid or expired verification token",
      });

      expect(await PersonalUser.countDocuments()).toBe(0);

      expect(await PersonalAccount.countDocuments()).toBe(0);
    });

    it("should reject duplicate registration", async () => {
      await createPersonalAccount();

      const response = await requestRegistrationOTP();

      expect(response.status).toBe(409);

      expect(response.body).toEqual({
        success: false,
        code: "ACCOUNT_ALREADY_EXISTS",
        message: "Account already exists",
      });
    });
  });

  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  */

  describe("Login", () => {
    it("should login successfully and create an access token and refresh session", async () => {
      const { account } = await createPersonalAccount();

      const response = await login();

      expect(response.status).toBe(200);

      expect(response.body.success).toBe(true);

      expect(response.body.data.accessToken).toBeDefined();

      expect(response.body.data.refreshToken).toBeDefined();

      expect(response.body.data.session).toBeDefined();

      expect(response.body.data.refreshToken).not.toBe("");

      const sessions = await getRefreshSessions(account._id);

      expect(sessions).toHaveLength(1);

      expect(sessions[0].revokedAt).toBeNull();

      expect(sessions[0].tokenHash).toBeDefined();

      expect(sessions[0].tokenHash).not.toBe(response.body.data.refreshToken);

      const dbAccount = await getPersonalAccount();

      expect(dbAccount.lastLoginAt).toBeInstanceOf(Date);
    });

    it("should reject an incorrect password", async () => {
      await createPersonalAccount();

      const response = await login(TEST_PHONE, "WrongPassword123");

      expect(response.status).toBe(401);

      expect(response.body).toEqual({
        success: false,
        code: "INVALID_CREDENTIALS",
        message: "Invalid credentials",
      });

      expect(await RefreshToken.countDocuments()).toBe(0);
    });

    it("should reject login for an inactive account", async () => {
      const { account } = await createPersonalAccount();

      await PersonalAccount.updateOne(
        {
          _id: account._id,
        },
        {
          $set: {
            status: "inactive",
          },
        },
      );

      const response = await login();

      expect(response.status).toBe(403);

      expect(response.body).toEqual({
        success: false,
        code: "ACCOUNT_NOT_ACTIVE",
        message: "Account is not active",
      });

      expect(await RefreshToken.countDocuments()).toBe(0);
    });

    it("should reject login for a non-existing account", async () => {
      const response = await login("+989120000000", TEST_PASSWORD);

      expect(response.status).toBe(401);

      expect(response.body).toEqual({
        success: false,
        code: "INVALID_CREDENTIALS",
        message: "Invalid credentials",
      });
    });
  });

  /*
  |--------------------------------------------------------------------------
  | Access Token / Middleware
  |--------------------------------------------------------------------------
  */

  describe("Access Token and Authentication Middleware", () => {
    it("should authenticate an account using a valid access token", async () => {
      const { account } = await createPersonalAccount();

      const loginResponse = await login();

      expect(loginResponse.status).toBe(200);

      const accessToken = loginResponse.body.data.accessToken;

      const response = await request(app)
        .get("/api/auth/sessions")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);

      expect(response.body.success).toBe(true);

      expect(response.body.data.sessions).toHaveLength(1);

      expect(response.body.data.sessions[0].accountId.toString()).toBe(
        account._id.toString(),
      );

      expect(response.body.data.sessions[0].tokenHash).toBeUndefined();
    });

    it("should reject a request without an access token", async () => {
      const response = await request(app).get("/api/auth/sessions");

      expect(response.status).toBe(401);

      expect(response.body).toEqual({
        success: false,
        code: "ACCESS_TOKEN_REQUIRED",
        message: "Access token required",
      });
    });

    it("should reject an invalid access token", async () => {
      const response = await request(app)
        .get("/api/auth/sessions")
        .set("Authorization", "Bearer invalid-access-token");

      expect(response.status).toBe(401);

      expect(response.body).toEqual({
        success: false,
        code: "ACCESS_TOKEN_INVALID_OR_EXPIRED",
        message: "Invalid or expired access token",
      });
    });
    it("should reject a refresh token used as an access token", async () => {
      await createPersonalAccount();

      const loginResponse = await login();

      const refreshToken = loginResponse.body.data.refreshToken;

      const response = await request(app)
        .get("/api/auth/sessions")
        .set("Authorization", `Bearer ${refreshToken}`);

      expect(response.status).toBe(401);

      expect(response.body).toEqual({
        success: false,
        code: "ACCESS_TOKEN_INVALID_TYPE",
        message: "Invalid access token type",
      });
    });
  });

  /*
  |--------------------------------------------------------------------------
  | Refresh Token
  |--------------------------------------------------------------------------
  */

  describe("Refresh Token", () => {
    it("should rotate a valid refresh token", async () => {
      const { account } = await createPersonalAccount();

      const loginResponse = await login();

      const oldRefreshToken = loginResponse.body.data.refreshToken;

      const refreshResponse = await request(app)
        .post("/api/auth/refresh")
        .send({
          refreshToken: oldRefreshToken,
        });

      expect(refreshResponse.status).toBe(200);

      expect(refreshResponse.body.data.accessToken).toBeDefined();

      expect(refreshResponse.body.data.refreshToken).toBeDefined();

      const newRefreshToken = refreshResponse.body.data.refreshToken;

      expect(newRefreshToken).not.toBe(oldRefreshToken);

      const sessions = await getRefreshSessions(account._id);

      expect(sessions).toHaveLength(2);

      const activeSessions = sessions.filter(
        (session) => session.revokedAt === null,
      );

      const revokedSessions = sessions.filter(
        (session) => session.revokedAt !== null,
      );

      expect(activeSessions).toHaveLength(1);

      expect(revokedSessions).toHaveLength(1);
    });

    it("should reject the old refresh token after rotation", async () => {
      await createPersonalAccount();

      const loginResponse = await login();

      const oldRefreshToken = loginResponse.body.data.refreshToken;

      const firstRefresh = await request(app).post("/api/auth/refresh").send({
        refreshToken: oldRefreshToken,
      });

      expect(firstRefresh.status).toBe(200);

      const secondRefresh = await request(app).post("/api/auth/refresh").send({
        refreshToken: oldRefreshToken,
      });

      expect(secondRefresh.status).toBe(401);

      expect(secondRefresh.body).toEqual({
        success: false,
        code: "REFRESH_TOKEN_REVOKED_OR_EXPIRED",
        message: "Refresh token revoked or expired",
      });
    });

    it("should reject a missing refresh token", async () => {
      const response = await request(app).post("/api/auth/refresh").send({});

      expect(response.status).toBe(400);

      expect(response.body).toEqual({
        success: false,
        code: "REFRESH_TOKEN_REQUIRED",
        message: "Refresh token is required",
      });
    });
  });

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  describe("Logout", () => {
    it("should revoke the current refresh-token session", async () => {
      const { account } = await createPersonalAccount();

      const loginResponse = await login();

      const refreshToken = loginResponse.body.data.refreshToken;

      const logoutResponse = await request(app).post("/api/auth/logout").send({
        refreshToken,
      });

      expect(logoutResponse.status).toBe(200);

      expect(logoutResponse.body).toEqual({
        success: true,
      });

      const sessions = await getRefreshSessions(account._id);

      expect(sessions).toHaveLength(1);

      expect(sessions[0].revokedAt).toBeInstanceOf(Date);
    });

    it("should make the logged-out refresh token unusable", async () => {
      await createPersonalAccount();

      const loginResponse = await login();

      const refreshToken = loginResponse.body.data.refreshToken;

      const logoutResponse = await request(app).post("/api/auth/logout").send({
        refreshToken,
      });

      expect(logoutResponse.status).toBe(200);

      const refreshResponse = await request(app)
        .post("/api/auth/refresh")
        .send({
          refreshToken,
        });

      expect(refreshResponse.status).toBe(401);

      expect(refreshResponse.body).toEqual({
        success: false,
        code: "REFRESH_TOKEN_REVOKED_OR_EXPIRED",
        message: "Refresh token revoked or expired",
      });
    });
  });

  /*
  |--------------------------------------------------------------------------
  | Session Management
  |--------------------------------------------------------------------------
  */

  describe("Session Management", () => {
    it("should return active sessions for the authenticated account", async () => {
      const { account } = await createPersonalAccount();

      const loginResponse = await login();

      const accessToken = loginResponse.body.data.accessToken;

      const response = await request(app)
        .get("/api/auth/sessions")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);

      expect(response.body.data.sessions).toHaveLength(1);

      const session = response.body.data.sessions[0];

      expect(session.accountType).toBe("personal");

      expect(session.accountId.toString()).toBe(account._id.toString());

      expect(session.revokedAt).toBeNull();

      expect(session.tokenHash).toBeUndefined();
    });

    it("should return session history including revoked sessions", async () => {
      const { account } = await createPersonalAccount();

      const loginResponse = await login();

      const accessToken = loginResponse.body.data.accessToken;

      const refreshToken = loginResponse.body.data.refreshToken;

      await request(app).post("/api/auth/logout").send({
        refreshToken,
      });

      const response = await request(app)
        .get("/api/auth/sessions/history")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);

      expect(response.body.data.sessions).toHaveLength(1);

      expect(response.body.data.sessions[0].accountId.toString()).toBe(
        account._id.toString(),
      );

      expect(response.body.data.sessions[0].revokedAt).not.toBeNull();

      expect(response.body.data.sessions[0].tokenHash).toBeUndefined();
    });

    it("should revoke one session", async () => {
      const { account } = await createPersonalAccount();

      const loginResponse = await login();

      const refreshToken = loginResponse.body.data.refreshToken;

      const response = await request(app)
        .delete("/api/auth/sessions/current")
        .send({
          refreshToken,
        });

      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        success: true,
      });

      const sessions = await getRefreshSessions(account._id);

      expect(sessions).toHaveLength(1);

      expect(sessions[0].revokedAt).toBeInstanceOf(Date);
    });

    it("should return 404 when revoking a non-existing session", async () => {
      const response = await request(app)
        .delete("/api/auth/sessions/current")
        .send({
          refreshToken: "non-existing-refresh-token",
        });

      expect(response.status).toBe(404);

      expect(response.body).toEqual({
        success: false,
        code: "SESSION_NOT_FOUND",
        message: "Session not found",
      });
    });

    it("should revoke all active sessions", async () => {
      const { account } = await createPersonalAccount();

      const firstLogin = await login();

      const secondLogin = await login();

      expect(firstLogin.status).toBe(200);

      expect(secondLogin.status).toBe(200);

      const accessToken = firstLogin.body.data.accessToken;

      const sessionsBefore = await getRefreshSessions(account._id);

      expect(sessionsBefore).toHaveLength(2);

      const response = await request(app)
        .delete("/api/auth/sessions")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);

      expect(response.body.data.revokedSessions).toBe(2);

      const sessionsAfter = await getRefreshSessions(account._id);

      expect(sessionsAfter).toHaveLength(2);

      expect(sessionsAfter.every((session) => session.revokedAt !== null)).toBe(
        true,
      );
    });

    it("should reject session access without authentication", async () => {
      const response = await request(app).get("/api/auth/sessions/history");

      expect(response.status).toBe(401);

      expect(response.body).toEqual({
        success: false,
        code: "ACCESS_TOKEN_REQUIRED",
        message: "Access token required",
      });
    });
  });

  /*
  |--------------------------------------------------------------------------
  | Password Security
  |--------------------------------------------------------------------------
  */

  describe("Password Security", () => {
    it("should never expose passwordHash in registration response", async () => {
      const { account } = await createPersonalAccount();

      expect(account.passwordHash).toBeUndefined();
    });

    it("should store a hashed password in MongoDB", async () => {
      await createPersonalAccount();

      const account = await getPersonalAccount();

      expect(account.passwordHash).toBeDefined();

      expect(account.passwordHash).not.toBe(TEST_PASSWORD);

      expect(account.passwordHash.startsWith("$2")).toBe(true);
    });
  });

  /*
  |--------------------------------------------------------------------------
  | Refresh Token Security
  |--------------------------------------------------------------------------
  */

  describe("Refresh Token Security", () => {
    it("should never expose tokenHash through session API", async () => {
      await createPersonalAccount();

      const loginResponse = await login();

      const accessToken = loginResponse.body.data.accessToken;

      const response = await request(app)
        .get("/api/auth/sessions")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);

      for (const session of response.body.data.sessions) {
        expect(session.tokenHash).toBeUndefined();
      }
    });
  });

    /*
  |--------------------------------------------------------------------------
  | Validation (Zod middleware)
  |--------------------------------------------------------------------------
  |
  | These tests verify that the Zod-based validation middleware
  | rejects malformed request bodies BEFORE they reach the controller.
  |
  */

  describe("Validation", () => {
    it("should reject OTP request without identifier", async () => {
      const response = await request(app)
        .post("/api/auth/otp/request")
        .send({ identifierType: "phone" });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: "VALIDATION_FAILED",
      });
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "identifier",
            code: "IDENTIFIER_REQUIRED",
          }),
        ])
      );
    });

    it("should reject OTP request with invalid identifierType", async () => {
      const response = await request(app)
        .post("/api/auth/otp/request")
        .send({ identifier: "09121111111", identifierType: "carrier-pigeon" });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: "VALIDATION_FAILED",
      });
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "identifierType",
            code: "IDENTIFIER_TYPE_INVALID",
          }),
        ])
      );
    });

    it("should reject OTP verify with invalid OTP format", async () => {
      const response = await request(app)
        .post("/api/auth/otp/verify")
        .send({
          identifier: "09121111111",
          identifierType: "phone",
          purpose: "registration",
          otp: "abc",
        });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: "VALIDATION_FAILED",
      });
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "otp",
            code: "OTP_FORMAT_INVALID",
          }),
        ])
      );
    });

    it("should reject login without password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ identifier: "09121111111", identifierType: "phone" });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: "VALIDATION_FAILED",
      });
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "password",
            code: "PASSWORD_REQUIRED",
          }),
        ])
      );
    });

    it("should reject login with invalid accountType", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          identifier: "09121111111",
          identifierType: "phone",
          accountType: "alien",
          password: "Password123",
        });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: "VALIDATION_FAILED",
      });
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "accountType",
            code: "ACCOUNT_TYPE_INVALID",
          }),
        ])
      );
    });

    it("should reject register with a short password", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          verificationToken: "dummy-token",
          firstName: "Zahra",
          lastName: "Test",
          password: "123",
        });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: "VALIDATION_FAILED",
      });
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "password",
            code: "PASSWORD_TOO_SHORT",
          }),
        ])
      );
    });

    it("should reject register with a too-short first name", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          verificationToken: "dummy-token",
          firstName: "Z",
          lastName: "Test",
          password: "Password123",
        });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: "VALIDATION_FAILED",
      });
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "firstName",
            code: "FIRST_NAME_TOO_SHORT",
          }),
        ])
      );
    });

    it("should reject password reset without verificationToken", async () => {
      const response = await request(app)
        .post("/api/auth/password/reset")
        .send({ password: "Password123" });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: "VALIDATION_FAILED",
      });
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "verificationToken",
            code: "VERIFICATION_TOKEN_REQUIRED",
          }),
        ])
      );
    });
  });

    /*
  |--------------------------------------------------------------------------
  | Session Revocation by ID
  |--------------------------------------------------------------------------
  */

  describe("Session Revocation by ID", () => {
    it("should reject without an access token", async () => {
      const response = await request(app)
        .delete("/api/auth/sessions/507f1f77bcf86cd799439011");

      expect(response.status).toBe(401);
      expect(response.body.code).toBe("ACCESS_TOKEN_REQUIRED");
    });

    it("should reject an invalid session id (Zod validation)", async () => {
      await createPersonalAccount();
      const loginResponse = await login();
      const accessToken = loginResponse.body.data.accessToken;

      const response = await request(app)
        .delete("/api/auth/sessions/not-a-valid-object-id")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: "VALIDATION_FAILED",
      });
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "id",
            code: "SESSION_ID_INVALID",
          }),
        ])
      );
    });

    it("should return 404 for a non-existing session", async () => {
      await createPersonalAccount();
      const loginResponse = await login();
      const accessToken = loginResponse.body.data.accessToken;

      const response = await request(app)
        .delete("/api/auth/sessions/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body.code).toBe("SESSION_NOT_FOUND");
    });

    it("should revoke a specific session belonging to the current account", async () => {
      await createPersonalAccount();
      const loginResponse = await login();
      const accessToken = loginResponse.body.data.accessToken;

      // Get current sessions
      const sessionsResponse = await request(app)
        .get("/api/auth/sessions")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(sessionsResponse.status).toBe(200);

      const sessions = sessionsResponse.body.data.sessions;
      expect(sessions.length).toBeGreaterThan(0);

      const targetSessionId = sessions[0]._id;

      // Revoke that session
      const revokeResponse = await request(app)
        .delete(`/api/auth/sessions/${targetSessionId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(revokeResponse.status).toBe(200);
      expect(revokeResponse.body.success).toBe(true);
      expect(revokeResponse.body.data.revoked).toBe(true);

      // Confirm it's gone from active list
      const afterResponse = await request(app)
        .get("/api/auth/sessions")
        .set("Authorization", `Bearer ${accessToken}`);

      const remaining = afterResponse.body.data.sessions;
      expect(remaining.find((s) => s._id === targetSessionId)).toBeUndefined();
    });

    it("should prevent one account from revoking another account's session (IDOR)", async () => {
      // Create first account and login
      await createPersonalAccount();
      const firstLogin = await login();
      const firstAccessToken = firstLogin.body.data.accessToken;

      const firstSessions = await request(app)
        .get("/api/auth/sessions")
        .set("Authorization", `Bearer ${firstAccessToken}`);

      const firstSessionId = firstSessions.body.data.sessions[0]._id;

      // Create a second account (different phone)
      const secondPhone = "+989129999999";
      const secondAccountResponse = await request(app)
        .post("/api/auth/otp/request")
        .send({
          identifier: secondPhone,
          identifierType: "phone",
          purpose: "registration",
        });
      expect(secondAccountResponse.status).toBe(200);

      const verifyRes = await request(app)
        .post("/api/auth/otp/verify")
        .send({
          identifier: secondPhone,
          identifierType: "phone",
          purpose: "registration",
          otp: TEST_OTP,
        });
      expect(verifyRes.status).toBe(200);

      const secondVerificationToken = verifyRes.body.data.verificationToken;

      const secondRegisterRes = await request(app)
        .post("/api/auth/register")
        .send({
          verificationToken: secondVerificationToken,
          firstName: "Other",
          lastName: "User",
          password: "OtherPassword123!",
        });
      expect(secondRegisterRes.status).toBe(201);

      const secondLogin = await request(app).post("/api/auth/login").send({
        identifier: secondPhone,
        identifierType: "phone",
        accountType: "personal",
        password: "OtherPassword123!",
      });
      const secondAccessToken = secondLogin.body.data.accessToken;

      // Second account tries to revoke first account's session
      const response = await request(app)
        .delete(`/api/auth/sessions/${firstSessionId}`)
        .set("Authorization", `Bearer ${secondAccessToken}`);

      expect(response.status).toBe(404);
      expect(response.body.code).toBe("SESSION_NOT_FOUND");
    });
  });

});
