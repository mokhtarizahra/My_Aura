import jwt from "jsonwebtoken";

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createRefreshToken,
  getActiveSessions,
  getSessionHistory,
  revokeAllRefreshTokens,
  revokeRefreshToken,
  rotateRefreshToken,
  validateRefreshToken,
} from "./refreshToken.service.js";

import RefreshToken from "../../models/authentication/RefreshToken.js";

vi.mock("../../models/authentication/RefreshToken.js", () => ({
  default: {
    create: vi.fn(),
    findOne: vi.fn(),
    updateMany: vi.fn(),
    find: vi.fn(),
  },
}));

describe("Authentication: refreshToken.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.JWT_SECRET = "test-secret";

    process.env.JWT_ISSUER = "myaura";

    process.env.JWT_AUDIENCE = "myaura-api";
  });

  describe("createRefreshToken", () => {
    it("should generate and persist a personal refresh token", async () => {
      const session = {
        _id: "session-1",
        accountId: "account-1",
        accountType: "personal",
      };

      RefreshToken.create.mockResolvedValue(session);

      const result = await createRefreshToken({
        accountId: "507f1f77bcf86cd799439011",
        accountType: "personal",
        userAgent: "Vitest",
        ip: "127.0.0.1",
      });

      expect(result.refreshToken).toBeDefined();

      expect(typeof result.refreshToken).toBe("string");

      expect(result.session).toBe(session);

      expect(RefreshToken.create).toHaveBeenCalledTimes(1);

      const savedData = RefreshToken.create.mock.calls[0][0];

      expect(savedData.accountId).toBe("507f1f77bcf86cd799439011");

      expect(savedData.accountType).toBe("personal");

      expect(savedData.tokenHash).toBeDefined();

      expect(savedData.tokenHash).not.toBe(result.refreshToken);

      expect(savedData.expiresAt).toBeInstanceOf(Date);
    });

    it("should create an organization refresh token", async () => {
      RefreshToken.create.mockResolvedValue({
        _id: "session-1",
      });

      const result = await createRefreshToken({
        accountId: "507f1f77bcf86cd799439011",
        accountType: "organization",
      });

      const payload = jwt.verify(result.refreshToken, process.env.JWT_SECRET, {
        algorithms: ["HS256"],
        issuer: "myaura",
        audience: "myaura-api",
      });

      expect(payload.accountType).toBe("organization");

      expect(payload.tokenType).toBe("refresh");
    });

    it("should reject a missing account id", async () => {
      await expect(
        createRefreshToken({
          accountId: null,
          accountType: "personal",
        }),
      ).rejects.toThrow("Account ID is required");

      expect(RefreshToken.create).not.toHaveBeenCalled();
    });

    it("should reject an invalid account type", async () => {
      await expect(
        createRefreshToken({
          accountId: "507f1f77bcf86cd799439011",
          accountType: "admin",
        }),
      ).rejects.toThrow("Invalid account type");

      expect(RefreshToken.create).not.toHaveBeenCalled();
    });
  });

  describe("validateRefreshToken", () => {
    it("should validate a valid refresh token", async () => {
      const token = jwt.sign(
        {
          sub: "507f1f77bcf86cd799439011",
          accountType: "personal",
          tokenType: "refresh",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
          issuer: "myaura",
          audience: "myaura-api",
        },
      );

      const session = {
        _id: "session-1",
        accountId: "507f1f77bcf86cd799439011",
        accountType: "personal",
      };

      const select = vi.fn().mockResolvedValue(session);

      RefreshToken.findOne.mockReturnValue({
        select,
      });

      const result = await validateRefreshToken(token);

      expect(result.payload.sub).toBe("507f1f77bcf86cd799439011");

      expect(result.payload.tokenType).toBe("refresh");

      expect(result.session).toBe(session);

      expect(RefreshToken.findOne).toHaveBeenCalledTimes(1);

      expect(select).toHaveBeenCalledWith("+tokenHash");
    });

    it("should reject a missing refresh token", async () => {
      await expect(validateRefreshToken()).rejects.toThrow(
        "Refresh token is required",
      );
    });

    it("should reject an invalid JWT", async () => {
      await expect(validateRefreshToken("invalid-token")).rejects.toThrow(
        "Invalid refresh token",
      );

      expect(RefreshToken.findOne).not.toHaveBeenCalled();
    });

    it("should reject an access token", async () => {
      const accessToken = jwt.sign(
        {
          sub: "507f1f77bcf86cd799439011",
          accountType: "personal",
          tokenType: "access",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "15m",
          issuer: "myaura",
          audience: "myaura-api",
        },
      );

      await expect(validateRefreshToken(accessToken)).rejects.toThrow(
        "Invalid token type",
      );

      expect(RefreshToken.findOne).not.toHaveBeenCalled();
    });

    it("should reject a token that does not exist in the database", async () => {
      const token = jwt.sign(
        {
          sub: "507f1f77bcf86cd799439011",
          accountType: "personal",
          tokenType: "refresh",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
          issuer: "myaura",
          audience: "myaura-api",
        },
      );

      const select = vi.fn().mockResolvedValue(null);

      RefreshToken.findOne.mockReturnValue({
        select,
      });

      await expect(validateRefreshToken(token)).rejects.toThrow(
        "Refresh token revoked or expired",
      );
    });

    it("should reject a revoked token", async () => {
      const token = jwt.sign(
        {
          sub: "507f1f77bcf86cd799439011",
          accountType: "personal",
          tokenType: "refresh",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
          issuer: "myaura",
          audience: "myaura-api",
        },
      );

      const select = vi.fn().mockResolvedValue(null);

      RefreshToken.findOne.mockReturnValue({
        select,
      });

      await expect(validateRefreshToken(token)).rejects.toThrow(
        "Refresh token revoked or expired",
      );
    });
  });

  describe("rotateRefreshToken", () => {
    it("should revoke the old session and create a new refresh token", async () => {
      const oldToken = jwt.sign(
        {
          sub: "507f1f77bcf86cd799439011",
          accountType: "personal",
          tokenType: "refresh",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
          issuer: "myaura",
          audience: "myaura-api",
        },
      );

      const save = vi.fn().mockResolvedValue({});

      const oldSession = {
        _id: "old-session",
        revokedAt: null,
        save,
      };

      const findOneSelect = vi.fn().mockResolvedValue(oldSession);

      RefreshToken.findOne.mockReturnValue({
        select: findOneSelect,
      });

      const newSession = {
        _id: "new-session",
      };

      RefreshToken.create.mockResolvedValue(newSession);

      const result = await rotateRefreshToken({
        refreshToken: oldToken,
        userAgent: "Vitest",
        ip: "127.0.0.1",
      });

      expect(oldSession.revokedAt).toBeInstanceOf(Date);

      expect(save).toHaveBeenCalledTimes(1);

      expect(RefreshToken.create).toHaveBeenCalledTimes(1);

      expect(result.refreshToken).toBeDefined();

      expect(result.session).toBe(newSession);

      expect(result.refreshToken).not.toBe(oldToken);
    });
  });

  describe("revokeRefreshToken", () => {
    it("should revoke an active refresh token", async () => {
      const session = {
        revokedAt: null,
        save: vi.fn().mockResolvedValue(undefined),
      };

      const select = vi.fn().mockResolvedValue(session);

      RefreshToken.findOne.mockReturnValue({
        select,
      });

      const token = "refresh-token";

      const result = await revokeRefreshToken(token);

      expect(result).toBe(true);

      expect(session.revokedAt).toBeInstanceOf(Date);

      expect(session.save).toHaveBeenCalledTimes(1);
    });

    it("should return false when the session does not exist", async () => {
      const select = vi.fn().mockResolvedValue(null);

      RefreshToken.findOne.mockReturnValue({
        select,
      });

      const result = await revokeRefreshToken("unknown-token");

      expect(result).toBe(false);
    });

    it("should reject a missing token", async () => {
      await expect(revokeRefreshToken()).rejects.toThrow(
        "Refresh token is required",
      );
    });
  });

  describe("revokeAllRefreshTokens", () => {
    it("should revoke all active sessions for an account", async () => {
      RefreshToken.updateMany.mockResolvedValue({
        modifiedCount: 3,
      });

      const result = await revokeAllRefreshTokens({
        accountId: "507f1f77bcf86cd799439011",
        accountType: "personal",
      });

      expect(result).toBe(3);

      expect(RefreshToken.updateMany).toHaveBeenCalledTimes(1);

      const [filter, update] = RefreshToken.updateMany.mock.calls[0];

      expect(filter.accountId).toBe("507f1f77bcf86cd799439011");

      expect(filter.accountType).toBe("personal");

      expect(filter.revokedAt).toBe(null);

      expect(update.$set.revokedAt).toBeInstanceOf(Date);
    });

    it("should reject a missing account id", async () => {
      await expect(
        revokeAllRefreshTokens({
          accountId: null,
          accountType: "personal",
        }),
      ).rejects.toThrow("Account ID is required");

      expect(RefreshToken.updateMany).not.toHaveBeenCalled();
    });

    it("should reject an invalid account type", async () => {
      await expect(
        revokeAllRefreshTokens({
          accountId: "507f1f77bcf86cd799439011",
          accountType: "admin",
        }),
      ).rejects.toThrow("Invalid account type");

      expect(RefreshToken.updateMany).not.toHaveBeenCalled();
    });
  });

  describe("getActiveSessions", () => {
    it("should return only active sessions for an account", async () => {
      const sessions = [
        {
          _id: "session-1",
          accountId: "account-1",
          accountType: "personal",
          revokedAt: null,
        },
        {
          _id: "session-2",
          accountId: "account-1",
          accountType: "personal",
          revokedAt: null,
        },
      ];

      const sort = vi.fn().mockResolvedValue(sessions);

      const select = vi.fn().mockReturnValue({
        sort,
      });

      RefreshToken.find.mockReturnValue({
        select,
      });

      const result = await getActiveSessions({
        accountId: "account-1",
        accountType: "personal",
      });

      expect(result).toBe(sessions);

      expect(RefreshToken.find).toHaveBeenCalledTimes(1);

      const filter = RefreshToken.find.mock.calls[0][0];

      expect(filter.accountId).toBe("account-1");

      expect(filter.accountType).toBe("personal");

      expect(filter.revokedAt).toBe(null);

      expect(filter.expiresAt.$gt).toBeInstanceOf(Date);

      expect(select).toHaveBeenCalledWith("-tokenHash");

      expect(sort).toHaveBeenCalledWith({
        createdAt: -1,
      });
    });

    it("should reject a missing account id", async () => {
      await expect(
        getActiveSessions({
          accountId: null,
          accountType: "personal",
        }),
      ).rejects.toThrow("Account ID is required");

      expect(RefreshToken.find).not.toHaveBeenCalled();
    });

    it("should reject an invalid account type", async () => {
      await expect(
        getActiveSessions({
          accountId: "account-1",
          accountType: "admin",
        }),
      ).rejects.toThrow("Invalid account type");

      expect(RefreshToken.find).not.toHaveBeenCalled();
    });
  });

  describe("getSessionHistory", () => {
    it("should return the complete session history for an account", async () => {
      const sessions = [
        {
          _id: "session-3",
          accountId: "account-1",
          accountType: "personal",
          revokedAt: new Date(),
        },
        {
          _id: "session-2",
          accountId: "account-1",
          accountType: "personal",
          revokedAt: null,
        },
      ];

      const sort = vi.fn().mockResolvedValue(sessions);

      const select = vi.fn().mockReturnValue({
        sort,
      });

      RefreshToken.find.mockReturnValue({
        select,
      });

      const result = await getSessionHistory({
        accountId: "account-1",
        accountType: "personal",
      });

      expect(result).toBe(sessions);

      expect(RefreshToken.find).toHaveBeenCalledTimes(1);

      const filter = RefreshToken.find.mock.calls[0][0];

      expect(filter).toEqual({
        accountId: "account-1",
        accountType: "personal",
      });

      expect(select).toHaveBeenCalledWith("-tokenHash");

      expect(sort).toHaveBeenCalledWith({
        createdAt: -1,
      });
    });

    it("should reject a missing account id", async () => {
      await expect(
        getSessionHistory({
          accountId: null,
          accountType: "personal",
        }),
      ).rejects.toThrow("Account ID is required");

      expect(RefreshToken.find).not.toHaveBeenCalled();
    });

    it("should reject an invalid account type", async () => {
      await expect(
        getSessionHistory({
          accountId: "account-1",
          accountType: "admin",
        }),
      ).rejects.toThrow("Invalid account type");

      expect(RefreshToken.find).not.toHaveBeenCalled();
    });
  });
});
