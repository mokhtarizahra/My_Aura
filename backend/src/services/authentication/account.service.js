import bcrypt from "bcryptjs";

import PersonalAccount from "../../models/account/PersonalAccount.js";
import OrganizationAccount from "../../models/account/OrganizationAccount.js";
import StaffAccount from "../../models/account/StaffAccount.js";

const ACCOUNT_TYPES = ["personal", "organization", "staff"];

const ACCOUNT_STATUSES = ["pending", "active", "inactive", "suspended"];

/**
 * Return the Mongoose model associated with an account type.
 */
const getAccountModel = (accountType) => {
  switch (accountType) {
    case "personal":
      return PersonalAccount;

    case "organization":
      return OrganizationAccount;

    case "staff":
      return StaffAccount;

    default:
      throw new Error("Invalid account type");
  }
};

/**
 * Validate account type.
 */
const validateAccountType = (accountType) => {
  if (!ACCOUNT_TYPES.includes(accountType)) {
    throw new Error("Invalid account type");
  }
};

/**
 * Validate account status.
 */
const validateAccountStatus = (status) => {
  if (!ACCOUNT_STATUSES.includes(status)) {
    throw new Error("Invalid account status");
  }
};

/**
 * Validate a required account identifier.
 */
const validateAccountId = (accountId) => {
  if (!accountId) {
    throw new Error("Account ID is required");
  }
};

/**
 * Normalize email.
 */
const normalizeEmail = (email) => {
  if (!email) {
    return null;
  }

  return email.trim().toLowerCase();
};

/**
 * Normalize phone.
 */
const normalizePhone = (phone) => {
  if (!phone) {
    return null;
  }

  return phone.trim();
};

/**
 * Normalize corporate email.
 */
const normalizeCorporateEmail = (email) => {
  if (!email) {
    return null;
  }

  return email.trim().toLowerCase();
};

/**
 * Find a PersonalAccount by phone or email.
 *
 * This method intentionally searches only PersonalAccount.
 */
export const findPersonalAccount = async ({ phone, email }) => {
  if (!phone && !email) {
    throw new Error("Phone or email is required");
  }

  const conditions = [];

  if (phone) {
    conditions.push({
      phone: normalizePhone(phone),
    });
  }

  if (email) {
    conditions.push({
      email: normalizeEmail(email),
    });
  }

  return PersonalAccount.findOne({
    $or: conditions,
  }).select("+passwordHash");
};

/**
 * Find an account by its account ID and account type.
 */
export const findAccountById = async ({ accountId, accountType }) => {
  validateAccountId(accountId);
  validateAccountType(accountType);

  const AccountModel = getAccountModel(accountType);

  return AccountModel.findById(accountId).select("+passwordHash");
};

/**
 * Find an OrganizationAccount by email or phone.
 */
export const findOrganizationAccount = async ({ email, phone }) => {
  if (!email && !phone) {
    throw new Error("Email or phone is required");
  }

  const conditions = [];

  if (email) {
    conditions.push({
      email: normalizeEmail(email),
    });
  }

  if (phone) {
    conditions.push({
      phone: normalizePhone(phone),
    });
  }

  return OrganizationAccount.findOne({
    $or: conditions,
  }).select("+passwordHash");
};

/**
 * Find a StaffAccount by corporate email.
 */
export const findStaffAccount = async ({ corporateEmail }) => {
  if (!corporateEmail) {
    throw new Error("Corporate email is required");
  }

  return StaffAccount.findOne({
    corporateEmail: normalizeCorporateEmail(corporateEmail),
  }).select("+passwordHash");
};

/**
 * Find an account using a login identifier.
 *
 * Personal:
 *   phone OR email
 *
 * Organization:
 *   email OR phone
 *
 * Staff:
 *   corporateEmail
 */
export const findAccountForLogin = async ({
  identifier,
  identifierType,
  accountType,
}) => {
  if (!identifier) {
    throw new Error("Identifier is required");
  }

  validateAccountType(accountType);

  const normalizedIdentifier = identifier.trim();

  if (accountType === "personal") {
    if (identifierType === "phone") {
      return PersonalAccount.findOne({
        phone: normalizePhone(normalizedIdentifier),
      }).select("+passwordHash");
    }

    if (identifierType === "email") {
      return PersonalAccount.findOne({
        email: normalizeEmail(normalizedIdentifier),
      }).select("+passwordHash");
    }

    throw new Error("Invalid identifier type");
  }

  if (accountType === "organization") {
    if (identifierType === "email") {
      return OrganizationAccount.findOne({
        email: normalizeEmail(normalizedIdentifier),
      }).select("+passwordHash");
    }

    if (identifierType === "phone") {
      return OrganizationAccount.findOne({
        phone: normalizePhone(normalizedIdentifier),
      }).select("+passwordHash");
    }

    throw new Error("Invalid identifier type");
  }

  if (accountType === "staff") {
    if (identifierType !== "corporateEmail") {
      throw new Error("Invalid identifier type");
    }

    return StaffAccount.findOne({
      corporateEmail: normalizeCorporateEmail(normalizedIdentifier),
    }).select("+passwordHash");
  }
};

/**
 * Create a PersonalAccount.
 */
export const createPersonalAccount = async ({
  userId,
  phone = null,
  email = null,
  passwordHash = null,
  status = "pending",
  isVerified = false,
}) => {
  validateAccountId(userId);
  validateAccountStatus(status);

  if (!phone && !email) {
    throw new Error("Phone or email is required");
  }

  return PersonalAccount.create({
    userId,
    phone: normalizePhone(phone),
    email: normalizeEmail(email),
    passwordHash,
    status,
    isVerified,
  });
};

/**
 * Create an OrganizationAccount.
 */
export const createOrganizationAccount = async ({
  organizationId,
  email,
  phone = null,
  passwordHash,
  status = "pending",
}) => {
  validateAccountId(organizationId);
  validateAccountStatus(status);

  if (!email) {
    throw new Error("Email is required");
  }

  if (!passwordHash) {
    throw new Error("Password hash is required");
  }

  return OrganizationAccount.create({
    organizationId,
    email: normalizeEmail(email),
    phone: normalizePhone(phone),
    passwordHash,
    status,
  });
};

/**
 * Create a StaffAccount.
 */
export const createStaffAccount = async ({
  staffUserId,
  corporateEmail,
  passwordHash,
  status = "active",
}) => {
  validateAccountId(staffUserId);
  validateAccountStatus(status);

  if (!corporateEmail) {
    throw new Error("Corporate email is required");
  }

  if (!passwordHash) {
    throw new Error("Password hash is required");
  }

  return StaffAccount.create({
    staffUserId,
    corporateEmail: normalizeCorporateEmail(corporateEmail),
    passwordHash,
    status,
  });
};

/**
 * Hash a plain password.
 *
 * The controller should never need to know
 * the bcrypt configuration.
 */
export const hashPassword = async (password) => {
  if (typeof password !== "string" || !password) {
    throw new Error("Password is required");
  }

  return bcrypt.hash(password, 12);
};

/**
 * Compare a plain password with a password hash.
 */
export const comparePassword = async (password, passwordHash) => {
  if (typeof password !== "string" || !password) {
    throw new Error("Password is required");
  }

  if (!passwordHash) {
    return false;
  }

  return bcrypt.compare(password, passwordHash);
};

/**
 * Set / update an account password.
 *
 * The password is hashed here; controllers never
 * persist plain-text passwords.
 */
export const setAccountPassword = async ({
  accountId,
  accountType,
  password,
}) => {
  validateAccountId(accountId);
  validateAccountType(accountType);

  if (typeof password !== "string" || password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const AccountModel = getAccountModel(accountType);

  const passwordHash = await bcrypt.hash(password, 12);

  const account =
    await AccountModel.findById(accountId).select("+passwordHash");

  if (!account) {
    throw new Error("Account not found");
  }

  account.passwordHash = passwordHash;

  await account.save();

  return account;
};

/**
 * Check whether an account is active.
 */
export const isAccountActive = (account) => {
  if (!account) {
    return false;
  }

  return account.status === "active";
};

/**
 * Require an active account.
 */
export const requireActiveAccount = (account) => {
  if (!account) {
    throw new Error("Account not found");
  }

  if (account.status !== "active") {
    throw new Error("Account is not active");
  }

  return account;
};

/**
 * Update last login timestamp.
 */
export const updateLastLogin = async ({ accountId, accountType }) => {
  validateAccountId(accountId);
  validateAccountType(accountType);

  const AccountModel = getAccountModel(accountType);

  const account = await AccountModel.findById(accountId);

  if (!account) {
    throw new Error("Account not found");
  }

  account.lastLoginAt = new Date();

  await account.save();

  return account;
};

/**
 * Return the account type constants.
 */
export const ACCOUNT_CONFIG = {
  TYPES: ACCOUNT_TYPES,
  STATUSES: ACCOUNT_STATUSES,
};
