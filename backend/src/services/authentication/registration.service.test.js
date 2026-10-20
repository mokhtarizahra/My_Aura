import { beforeEach, describe, expect, it, vi } from "vitest";
import { authErrors } from "../../errors/authErrors.js";

vi.mock("../../models/identity/PersonalUser.js", () => ({
  default: {
    create: vi.fn(),
    deleteOne: vi.fn(),
  },
}));

vi.mock("./account.service.js", () => ({
  createPersonalAccount: vi.fn(),
  findPersonalAccount: vi.fn(),
  hashPassword: vi.fn(),
}));

import PersonalUser from "../../models/identity/PersonalUser.js";

import {
  createPersonalAccount,
  findPersonalAccount,
  hashPassword,
} from "./account.service.js";

import {
  registerPersonalAccount,
  REGISTRATION_CONFIG,
} from "./registration.service.js";

describe("Authentication: registration.service", () => {
  const userId = "507f1f77bcf86cd799439011";

  const mockUser = {
    _id: userId,
    firstName: "Zahra",
    lastName: "Mokhtari",
    status: "active",
  };

  const mockAccount = {
    _id: "507f1f77bcf86cd799439012",
    userId,
    phone: "09123456789",
    passwordHash: "hashed-password",
    status: "active",
    isVerified: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    PersonalUser.create.mockResolvedValue(mockUser);

    PersonalUser.deleteOne.mockResolvedValue({
      deletedCount: 1,
    });

    findPersonalAccount.mockResolvedValue(null);

    hashPassword.mockResolvedValue("hashed-password");

    createPersonalAccount.mockResolvedValue(mockAccount);
  });

  describe("configuration", () => {
    it("should expose supported identifier types", () => {
      expect(REGISTRATION_CONFIG.IDENTIFIER_TYPES).toEqual(["phone", "email"]);
    });
  });

  describe("input validation", () => {
    it("should reject a missing first name", async () => {
      await expect(
        registerPersonalAccount({
          firstName: "",
          lastName: "Mokhtari",
          identifier: "09123456789",
          identifierType: "phone",
          password: "password123",
        }),
      ).rejects.toThrow("First name is required");

      expect(PersonalUser.create).not.toHaveBeenCalled();
    });

    it("should reject a missing last name", async () => {
      await expect(
        registerPersonalAccount({
          firstName: "Zahra",
          lastName: "",
          identifier: "09123456789",
          identifierType: "phone",
          password: "password123",
        }),
      ).rejects.toThrow("Last name is required");

      expect(PersonalUser.create).not.toHaveBeenCalled();
    });

    it("should reject a first name shorter than two characters", async () => {
      await expect(
        registerPersonalAccount({
          firstName: "Z",
          lastName: "Mokhtari",
          identifier: "09123456789",
          identifierType: "phone",
          password: "password123",
        }),
      ).rejects.toThrow("First name must be at least 2 characters");
    });

    it("should reject a last name shorter than two characters", async () => {
      await expect(
        registerPersonalAccount({
          firstName: "Zahra",
          lastName: "M",
          identifier: "09123456789",
          identifierType: "phone",
          password: "password123",
        }),
      ).rejects.toThrow("Last name must be at least 2 characters");
    });

    it("should reject an identifier that is missing", async () => {
      await expect(
        registerPersonalAccount({
          firstName: "Zahra",
          lastName: "Mokhtari",
          identifier: "",
          identifierType: "phone",
          password: "password123",
        }),
      ).rejects.toThrow("Identifier is required");
    });

    it("should reject an invalid identifier type", async () => {
      await expect(
        registerPersonalAccount({
          firstName: "Zahra",
          lastName: "Mokhtari",
          identifier: "09123456789",
          identifierType: "username",
          password: "password123",
        }),
      ).rejects.toThrow("Invalid identifier type");
    });
  });

  describe("duplicate account prevention", () => {
    it("should reject an existing phone account", async () => {
      findPersonalAccount.mockResolvedValueOnce({
        _id: "existing-account",
      });

      await expect(
        registerPersonalAccount({
          firstName: "Zahra",
          lastName: "Mokhtari",
          identifier: "09123456789",
          identifierType: "phone",
          password: "password123",
        }),
      ).rejects.toThrow("Account already exists");

      expect(findPersonalAccount).toHaveBeenCalledWith({
        phone: "09123456789",
      });

      expect(PersonalUser.create).not.toHaveBeenCalled();

      expect(hashPassword).not.toHaveBeenCalled();
    });

    it("should reject an existing email account", async () => {
      findPersonalAccount.mockResolvedValueOnce({
        _id: "existing-account",
      });

      await expect(
        registerPersonalAccount({
          firstName: "Zahra",
          lastName: "Mokhtari",
          identifier: " ZAHRA@EXAMPLE.COM ",
          identifierType: "email",
          password: "password123",
        }),
      ).rejects.toThrow("Account already exists");

      expect(findPersonalAccount).toHaveBeenCalledWith({
        email: "zahra@example.com",
      });

      expect(PersonalUser.create).not.toHaveBeenCalled();
    });
  });

  describe("phone registration", () => {
    it("should create a PersonalUser and PersonalAccount", async () => {
      const result = await registerPersonalAccount({
        firstName: " Zahra ",
        lastName: " Mokhtari ",
        identifier: " 09123456789 ",
        identifierType: "phone",
        password: "password123",
      });

      expect(hashPassword).toHaveBeenCalledWith("password123");

      expect(PersonalUser.create).toHaveBeenCalledWith({
        firstName: "Zahra",
        lastName: "Mokhtari",
        status: "active",
      });

      expect(createPersonalAccount).toHaveBeenCalledWith({
        userId: userId,
        phone: "09123456789",
        passwordHash: "hashed-password",
        status: "active",
        isVerified: true,
      });

      expect(result).toEqual({
        user: mockUser,
        account: mockAccount,
      });
    });

    it("should preserve phone formatting except surrounding whitespace", async () => {
      await registerPersonalAccount({
        firstName: "Zahra",
        lastName: "Mokhtari",
        identifier: " 0912 345 6789 ",
        identifierType: "phone",
        password: "password123",
      });

      expect(findPersonalAccount).toHaveBeenCalledWith({
        phone: "0912 345 6789",
      });

      expect(createPersonalAccount).toHaveBeenCalledWith({
        userId: userId,
        phone: "0912 345 6789",
        passwordHash: "hashed-password",
        status: "active",
        isVerified: true,
      });
    });
  });

  describe("email registration", () => {
    it("should normalize email before account creation", async () => {
      const emailAccount = {
        ...mockAccount,
        email: "zahra@example.com",
        phone: undefined,
      };

      createPersonalAccount.mockResolvedValueOnce(emailAccount);

      const result = await registerPersonalAccount({
        firstName: "Zahra",
        lastName: "Mokhtari",
        identifier: "  ZAHRA@Example.COM ",
        identifierType: "email",
        password: "password123",
      });

      expect(findPersonalAccount).toHaveBeenCalledWith({
        email: "zahra@example.com",
      });

      expect(createPersonalAccount).toHaveBeenCalledWith({
        userId: userId,
        email: "zahra@example.com",
        passwordHash: "hashed-password",
        status: "active",
        isVerified: true,
      });

      expect(result).toEqual({
        user: mockUser,
        account: emailAccount,
      });
    });
  });

  describe("password handling", () => {
    it("should delegate password hashing to account.service", async () => {
      await registerPersonalAccount({
        firstName: "Zahra",
        lastName: "Mokhtari",
        identifier: "09123456789",
        identifierType: "phone",
        password: "plain-password",
      });

      expect(hashPassword).toHaveBeenCalledTimes(1);

      expect(hashPassword).toHaveBeenCalledWith("plain-password");
    });

    it("should never pass the plain password to createPersonalAccount", async () => {
      await registerPersonalAccount({
        firstName: "Zahra",
        lastName: "Mokhtari",
        identifier: "09123456789",
        identifierType: "phone",
        password: "plain-password",
      });

      const accountArguments = createPersonalAccount.mock.calls[0][0];

      expect(accountArguments.passwordHash).toBe("hashed-password");

      expect(accountArguments.password).toBeUndefined();
    });
  });

  describe("identity/account relationship", () => {
    it("should use the created PersonalUser id as PersonalAccount.userId", async () => {
      await registerPersonalAccount({
        firstName: "Zahra",
        lastName: "Mokhtari",
        identifier: "09123456789",
        identifierType: "phone",
        password: "password123",
      });

      expect(createPersonalAccount).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: userId,
        }),
      );
    });

    it("should create the identity before the account", async () => {
      const callOrder = [];

      PersonalUser.create.mockImplementationOnce(async (...args) => {
        callOrder.push("user");

        return mockUser;
      });

      createPersonalAccount.mockImplementationOnce(async (...args) => {
        callOrder.push("account");

        return mockAccount;
      });

      await registerPersonalAccount({
        firstName: "Zahra",
        lastName: "Mokhtari",
        identifier: "09123456789",
        identifierType: "phone",
        password: "password123",
      });

      expect(callOrder).toEqual(["user", "account"]);
    });
  });

  describe("cleanup on account creation failure", () => {
    it("should delete the created PersonalUser when account creation fails", async () => {
      const accountError = new Error("Database error");

      createPersonalAccount.mockRejectedValueOnce(accountError);

      await expect(
        registerPersonalAccount({
          firstName: "Zahra",
          lastName: "Mokhtari",
          identifier: "09123456789",
          identifierType: "phone",
          password: "password123",
        }),
      ).rejects.toThrow("Database error");

      expect(PersonalUser.deleteOne).toHaveBeenCalledWith({
        _id: userId,
      });
    });

    it("should rethrow the original account creation error", async () => {
      const accountError = new Error("Unique constraint failed");

      createPersonalAccount.mockRejectedValueOnce(accountError);

      await expect(
        registerPersonalAccount({
          firstName: "Zahra",
          lastName: "Mokhtari",
          identifier: "09123456789",
          identifierType: "phone",
          password: "password123",
        }),
      ).rejects.toBe(accountError);
    });
  });

  describe("verification state", () => {
    it("should create a verified active PersonalAccount", async () => {
      await registerPersonalAccount({
        firstName: "Zahra",
        lastName: "Mokhtari",
        identifier: "09123456789",
        identifierType: "phone",
        password: "password123",
      });

      expect(createPersonalAccount).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "active",
          isVerified: true,
        }),
      );
    });

    it("should create an active PersonalUser", async () => {
      await registerPersonalAccount({
        firstName: "Zahra",
        lastName: "Mokhtari",
        identifier: "09123456789",
        identifierType: "phone",
        password: "password123",
      });

      expect(PersonalUser.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "active",
        }),
      );
    });
  });
});
