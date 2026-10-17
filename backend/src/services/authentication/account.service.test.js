import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";

import PersonalAccount from "../../models/account/PersonalAccount.js";
import OrganizationAccount from "../../models/account/OrganizationAccount.js";
import StaffAccount from "../../models/account/StaffAccount.js";

import {
  ACCOUNT_CONFIG,
  comparePassword,
  createOrganizationAccount,
  createPersonalAccount,
  createStaffAccount,
  findAccountById,
  findAccountForLogin,
  findOrganizationAccount,
  findPersonalAccount,
  findStaffAccount,
  hashPassword,
  isAccountActive,
  requireActiveAccount,
  setAccountPassword,
  updateLastLogin,
} from "./account.service.js";

describe("Authentication: account.service", () => {
  const personalUserId = new mongoose.Types.ObjectId();

  const organizationId = new mongoose.Types.ObjectId();

  const staffUserId = new mongoose.Types.ObjectId();

  beforeEach(async () => {
    await PersonalAccount.deleteMany({});
    await OrganizationAccount.deleteMany({});
    await StaffAccount.deleteMany({});
  });

  describe("configuration", () => {
    it("should expose the supported account types", () => {
      expect(ACCOUNT_CONFIG.TYPES).toEqual([
        "personal",
        "organization",
        "staff",
      ]);
    });

    it("should expose the supported account statuses", () => {
      expect(ACCOUNT_CONFIG.STATUSES).toEqual([
        "pending",
        "active",
        "inactive",
        "suspended",
      ]);
    });
  });

  describe("hashPassword", () => {
    it("should hash a valid password", async () => {
      const hash = await hashPassword("password123");

      expect(hash).toBeDefined();
      expect(hash).not.toBe("password123");

      const matches = await bcrypt.compare("password123", hash);

      expect(matches).toBe(true);
    });

    it("should reject a missing password", async () => {
      await expect(hashPassword()).rejects.toThrow("Password is required");
    });
  });

  describe("comparePassword", () => {
    it("should return true for a matching password", async () => {
      const hash = await bcrypt.hash("password123", 12);

      await expect(comparePassword("password123", hash)).resolves.toBe(true);
    });

    it("should return false for a wrong password", async () => {
      const hash = await bcrypt.hash("password123", 12);

      await expect(comparePassword("wrong-password", hash)).resolves.toBe(
        false,
      );
    });

    it("should return false when password hash is missing", async () => {
      await expect(comparePassword("password123", null)).resolves.toBe(false);
    });

    it("should reject a missing password", async () => {
      await expect(comparePassword(null, "hash")).rejects.toThrow(
        "Password is required",
      );
    });
  });

  describe("createPersonalAccount", () => {
    it("should create a personal account", async () => {
      const account = await createPersonalAccount({
        userId: personalUserId,
        phone: "09121111111",
        passwordHash: "hashed-password",
        status: "active",
        isVerified: true,
      });

      expect(account._id).toBeDefined();

      expect(account.userId.toString()).toBe(personalUserId.toString());

      expect(account.phone).toBe("09121111111");

      expect(account.status).toBe("active");

      expect(account.isVerified).toBe(true);
    });

    it("should normalize personal account email", async () => {
      const account = await createPersonalAccount({
        userId: personalUserId,
        email: "  USER@Example.COM ",
      });

      expect(account.email).toBe("user@example.com");
    });

    it("should reject a missing user id", async () => {
      await expect(
        createPersonalAccount({
          phone: "09121111111",
        }),
      ).rejects.toThrow("Account ID is required");
    });

    it("should reject an account without phone or email", async () => {
      await expect(
        createPersonalAccount({
          userId: personalUserId,
        }),
      ).rejects.toThrow("Phone or email is required");
    });

    it("should reject an invalid status", async () => {
      await expect(
        createPersonalAccount({
          userId: personalUserId,
          phone: "09121111111",
          status: "deleted",
        }),
      ).rejects.toThrow("Invalid account status");
    });
  });

  describe("createOrganizationAccount", () => {
    it("should create an organization account", async () => {
      const account = await createOrganizationAccount({
        organizationId: organizationId,
        email: "  CLUB@Example.COM ",
        passwordHash: "hashed-password",
        status: "active",
      });

      expect(account.organizationId.toString()).toBe(organizationId.toString());

      expect(account.email).toBe("club@example.com");

      expect(account.status).toBe("active");
    });

    it("should reject a missing organization id", async () => {
      await expect(
        createOrganizationAccount({
          email: "club@example.com",
          passwordHash: "hashed-password",
        }),
      ).rejects.toThrow("Account ID is required");
    });

    it("should reject a missing email", async () => {
      await expect(
        createOrganizationAccount({
          organizationId: organizationId,
          passwordHash: "hashed-password",
        }),
      ).rejects.toThrow("Email is required");
    });

    it("should reject a missing password hash", async () => {
      await expect(
        createOrganizationAccount({
          organizationId: organizationId,
          email: "club@example.com",
        }),
      ).rejects.toThrow("Password hash is required");
    });
  });

  describe("createStaffAccount", () => {
    it("should create a staff account", async () => {
      const account = await createStaffAccount({
        staffUserId: staffUserId,
        corporateEmail: "  STAFF@MYAURA.COM ",
        passwordHash: "hashed-password",
      });

      expect(account.staffUserId.toString()).toBe(staffUserId.toString());

      expect(account.corporateEmail).toBe("staff@myaura.com");

      expect(account.status).toBe("active");
    });

    it("should reject a missing staff user id", async () => {
      await expect(
        createStaffAccount({
          corporateEmail: "staff@myaura.com",
          passwordHash: "hashed-password",
        }),
      ).rejects.toThrow("Account ID is required");
    });

    it("should reject a missing corporate email", async () => {
      await expect(
        createStaffAccount({
          staffUserId: staffUserId,
          passwordHash: "hashed-password",
        }),
      ).rejects.toThrow("Corporate email is required");
    });

    it("should reject a missing password hash", async () => {
      await expect(
        createStaffAccount({
          staffUserId: staffUserId,
          corporateEmail: "staff@myaura.com",
        }),
      ).rejects.toThrow("Password hash is required");
    });
  });

  describe("findPersonalAccount", () => {
    it("should find a personal account by phone", async () => {
      await PersonalAccount.create({
        userId: personalUserId,
        phone: "09121111111",
        passwordHash: "hashed-password",
      });

      const account = await findPersonalAccount({
        phone: "09121111111",
      });

      expect(account).not.toBeNull();

      expect(account.phone).toBe("09121111111");
    });

    it("should find a personal account by email", async () => {
      await PersonalAccount.create({
        userId: personalUserId,
        email: "user@example.com",
        passwordHash: "hashed-password",
      });

      const account = await findPersonalAccount({
        email: "USER@EXAMPLE.COM",
      });

      expect(account).not.toBeNull();

      expect(account.email).toBe("user@example.com");
    });

    it("should return null when account does not exist", async () => {
      const account = await findPersonalAccount({
        phone: "09129999999",
      });

      expect(account).toBeNull();
    });

    it("should reject when no identifier is supplied", async () => {
      await expect(findPersonalAccount({})).rejects.toThrow(
        "Phone or email is required",
      );
    });
  });

  describe("findOrganizationAccount", () => {
    it("should find an organization account by email", async () => {
      await OrganizationAccount.create({
        organizationId: organizationId,
        email: "club@example.com",
        passwordHash: "hashed-password",
      });

      const account = await findOrganizationAccount({
        email: "CLUB@EXAMPLE.COM",
      });

      expect(account).not.toBeNull();

      expect(account.email).toBe("club@example.com");
    });

    it("should return null when account does not exist", async () => {
      const account = await findOrganizationAccount({
        email: "missing@example.com",
      });

      expect(account).toBeNull();
    });

    it("should reject when no identifier is supplied", async () => {
      await expect(findOrganizationAccount({})).rejects.toThrow(
        expect.objectContaining({
          code: "PHONE_OR_EMAIL_REQUIRED",
          message: "Phone or email is required",
        }),
      );
    });
  });

  describe("findStaffAccount", () => {
    it("should find a staff account by corporate email", async () => {
      await StaffAccount.create({
        staffUserId: staffUserId,
        corporateEmail: "staff@myaura.com",
        passwordHash: "hashed-password",
      });

      const account = await findStaffAccount({
        corporateEmail: "STAFF@MYAURA.COM",
      });

      expect(account).not.toBeNull();

      expect(account.corporateEmail).toBe("staff@myaura.com");
    });

    it("should return null when staff account does not exist", async () => {
      const account = await findStaffAccount({
        corporateEmail: "missing@myaura.com",
      });

      expect(account).toBeNull();
    });

    it("should reject a missing corporate email", async () => {
      await expect(findStaffAccount({})).rejects.toThrow(
        "Corporate email is required",
      );
    });
  });

  describe("findAccountById", () => {
    it("should find a personal account", async () => {
      const account = await PersonalAccount.create({
        userId: personalUserId,
        phone: "09121111111",
        passwordHash: "hashed-password",
      });

      const result = await findAccountById({
        accountId: account._id,
        accountType: "personal",
      });

      expect(result).not.toBeNull();

      expect(result._id.toString()).toBe(account._id.toString());
    });

    it("should find an organization account", async () => {
      const account = await OrganizationAccount.create({
        organizationId: organizationId,
        email: "club@example.com",
        passwordHash: "hashed-password",
      });

      const result = await findAccountById({
        accountId: account._id,
        accountType: "organization",
      });

      expect(result).not.toBeNull();

      expect(result._id.toString()).toBe(account._id.toString());
    });

    it("should find a staff account", async () => {
      const account = await StaffAccount.create({
        staffUserId: staffUserId,
        corporateEmail: "staff@myaura.com",
        passwordHash: "hashed-password",
      });

      const result = await findAccountById({
        accountId: account._id,
        accountType: "staff",
      });

      expect(result).not.toBeNull();

      expect(result._id.toString()).toBe(account._id.toString());
    });

    it("should reject an invalid account type", async () => {
      await expect(
        findAccountById({
          accountId: personalUserId,
          accountType: "admin",
        }),
      ).rejects.toThrow("Invalid account type");
    });

    it("should reject a missing account id", async () => {
      await expect(
        findAccountById({
          accountType: "personal",
        }),
      ).rejects.toThrow("Account ID is required");
    });
  });

  describe("findAccountForLogin", () => {
    it("should find a personal account by phone", async () => {
      await PersonalAccount.create({
        userId: personalUserId,
        phone: "09121111111",
        passwordHash: "hashed-password",
      });

      const account = await findAccountForLogin({
        identifier: "09121111111",
        identifierType: "phone",
        accountType: "personal",
      });

      expect(account).not.toBeNull();

      expect(account.phone).toBe("09121111111");
    });

    it("should find a personal account by email", async () => {
      await PersonalAccount.create({
        userId: personalUserId,
        email: "user@example.com",
        passwordHash: "hashed-password",
      });

      const account = await findAccountForLogin({
        identifier: "USER@EXAMPLE.COM",
        identifierType: "email",
        accountType: "personal",
      });

      expect(account).not.toBeNull();

      expect(account.email).toBe("user@example.com");
    });

    it("should find an organization account by email", async () => {
      await OrganizationAccount.create({
        organizationId: organizationId,
        email: "club@example.com",
        passwordHash: "hashed-password",
      });

      const account = await findAccountForLogin({
        identifier: "CLUB@EXAMPLE.COM",
        identifierType: "email",
        accountType: "organization",
      });

      expect(account).not.toBeNull();

      expect(account.email).toBe("club@example.com");
    });

    it("should find a staff account by corporate email", async () => {
      await StaffAccount.create({
        staffUserId: staffUserId,
        corporateEmail: "staff@myaura.com",
        passwordHash: "hashed-password",
      });

      const account = await findAccountForLogin({
        identifier: "STAFF@MYAURA.COM",
        identifierType: "corporateEmail",
        accountType: "staff",
      });

      expect(account).not.toBeNull();

      expect(account.corporateEmail).toBe("staff@myaura.com");
    });

    it("should reject an invalid account type", async () => {
      await expect(
        findAccountForLogin({
          identifier: "user@example.com",
          identifierType: "email",
          accountType: "admin",
        }),
      ).rejects.toThrow("Invalid account type");
    });

    it("should reject an invalid personal identifier type", async () => {
      await expect(
        findAccountForLogin({
          identifier: "user@example.com",
          identifierType: "username",
          accountType: "personal",
        }),
      ).rejects.toThrow("Invalid identifier type");
    });

    it("should reject an invalid staff identifier type", async () => {
      await expect(
        findAccountForLogin({
          identifier: "staff@myaura.com",
          identifierType: "email",
          accountType: "staff",
        }),
      ).rejects.toThrow("Invalid identifier type");
    });

    it("should reject a missing identifier", async () => {
      await expect(
        findAccountForLogin({
          identifierType: "phone",
          accountType: "personal",
        }),
      ).rejects.toThrow("Identifier is required");
    });
  });

  describe("setAccountPassword", () => {
    it("should set a hashed password for a personal account", async () => {
      const account = await PersonalAccount.create({
        userId: personalUserId,
        phone: "09121111111",
        status: "active",
      });

      const updated = await setAccountPassword({
        accountId: account._id,
        accountType: "personal",
        password: "new-password",
      });

      expect(updated.passwordHash).toBeDefined();

      expect(updated.passwordHash).not.toBe("new-password");

      const valid = await bcrypt.compare("new-password", updated.passwordHash);

      expect(valid).toBe(true);
    });

    it("should reject a password shorter than six characters", async () => {
      const account = await PersonalAccount.create({
        userId: personalUserId,
        phone: "09121111111",
      });

      await expect(
        setAccountPassword({
          accountId: account._id,
          accountType: "personal",
          password: "12345",
        }),
      ).rejects.toThrow("Password must be at least 6 characters");
    });

    it("should reject a missing account", async () => {
      await expect(
        setAccountPassword({
          accountId: new mongoose.Types.ObjectId(),
          accountType: "personal",
          password: "password123",
        }),
      ).rejects.toThrow("Account not found");
    });
  });

  describe("isAccountActive", () => {
    it("should return true for an active account", () => {
      expect(
        isAccountActive({
          status: "active",
        }),
      ).toBe(true);
    });

    it("should return false for an inactive account", () => {
      expect(
        isAccountActive({
          status: "inactive",
        }),
      ).toBe(false);
    });

    it("should return false for a suspended account", () => {
      expect(
        isAccountActive({
          status: "suspended",
        }),
      ).toBe(false);
    });

    it("should return false for null", () => {
      expect(isAccountActive(null)).toBe(false);
    });
  });

  describe("requireActiveAccount", () => {
    it("should return an active account", () => {
      const account = {
        status: "active",
      };

      expect(requireActiveAccount(account)).toBe(account);
    });

    it("should reject a missing account", () => {
      expect(() => requireActiveAccount(null)).toThrow("Account not found");
    });

    it("should reject an inactive account", () => {
      expect(() =>
        requireActiveAccount({
          status: "inactive",
        }),
      ).toThrow("Account is not active");
    });

    it("should reject a suspended account", () => {
      expect(() =>
        requireActiveAccount({
          status: "suspended",
        }),
      ).toThrow("Account is not active");
    });
  });

  describe("updateLastLogin", () => {
    it("should update lastLoginAt for a personal account", async () => {
      const account = await PersonalAccount.create({
        userId: personalUserId,
        phone: "09121111111",
      });

      expect(account.lastLoginAt).toBeUndefined();

      const updated = await updateLastLogin({
        accountId: account._id,
        accountType: "personal",
      });

      expect(updated.lastLoginAt).toBeInstanceOf(Date);
    });

    it("should update lastLoginAt for an organization account", async () => {
      const account = await OrganizationAccount.create({
        organizationId: organizationId,
        email: "club@example.com",
        passwordHash: "hashed-password",
      });

      const updated = await updateLastLogin({
        accountId: account._id,
        accountType: "organization",
      });

      expect(updated.lastLoginAt).toBeInstanceOf(Date);
    });

    it("should update lastLoginAt for a staff account", async () => {
      const account = await StaffAccount.create({
        staffUserId: staffUserId,
        corporateEmail: "staff@myaura.com",
        passwordHash: "hashed-password",
      });

      const updated = await updateLastLogin({
        accountId: account._id,
        accountType: "staff",
      });

      expect(updated.lastLoginAt).toBeInstanceOf(Date);
    });

    it("should reject a missing account", async () => {
      await expect(
        updateLastLogin({
          accountId: new mongoose.Types.ObjectId(),
          accountType: "personal",
        }),
      ).rejects.toThrow("Account not found");
    });
  });
});
