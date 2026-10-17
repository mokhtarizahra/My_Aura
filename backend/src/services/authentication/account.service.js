import bcrypt from "bcryptjs";

import PersonalAccount from "../../models/account/PersonalAccount.js";
import OrganizationAccount from "../../models/account/OrganizationAccount.js";
import StaffAccount from "../../models/account/StaffAccount.js";
import { authErrors } from "../../errors/authErrors.js";

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
      throw authErrors.accountTypeInvalid();
  }
};

/**
 * Validate account type.
 */
const validateAccountType = (accountType) => {
  if (!ACCOUNT_TYPES.includes(accountType)) {
    throw authErrors.accountTypeInvalid();
  }
};

/**
 * Validate account status.
 */
const validateAccountStatus = (status) => {
  if (!ACCOUNT_STATUSES.includes(status)) {
    throw authErrors.accountStatusInvalid();
  }
};

/**
 * Validate a required account identifier.
 */
const validateAccountId = (accountId) => {
  if (!accountId) {
    throw authErrors.accountIdRequired();
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
    throw authErrors.phoneOrEmailRequired();
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
    throw authErrors.phoneOrEmailRequired();
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
    throw authErrors.corporateEmailRequired();
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
    throw authErrors.identifierRequired();
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

    throw authErrors.identifierTypeInvalid();
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

    throw authErrors.identifierTypeInvalid();
  }

  if (accountType === "staff") {
    if (identifierType !== "corporateEmail") {
      throw authErrors.identifierTypeInvalid();
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
    throw authErrors.phoneOrEmailRequired();
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
    throw authErrors.emailRequired();
  }

  if (!passwordHash) {
    throw authErrors.passwordHashRequired();
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
    throw authErrors.corporateEmailRequired();
  }

  if (!passwordHash) {
    throw authErrors.passwordHashRequired();
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
    throw authErrors.passwordRequired();
  }

  return bcrypt.hash(password, 12);
};

/**
 * Compare a plain password with a password hash.
 */
export const comparePassword = async (password, passwordHash) => {
  if (typeof password !== "string" || !password) {
    throw authErrors.passwordRequired();
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
    throw authErrors.passwordTooShort();
  }

  const AccountModel = getAccountModel(accountType);

  // Fetch account first (we need the current hash to compare)
  const account =
    await AccountModel.findById(accountId).select("+passwordHash");

  if (!account) {
    throw authErrors.accountNotFound();
  }

  // Reject if the new password is identical to the current one
  if (account.passwordHash) {
    const isSame = await bcrypt.compare(password, account.passwordHash);
    if (isSame) {
      throw authErrors.passwordSameAsOld();
    }
  }

  // Only now hash and save
  const passwordHash = await bcrypt.hash(password, 12);
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
    throw authErrors.accountNotFound();
  }

  if (account.status !== "active") {
    throw authErrors.accountNotActive();
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
    throw authErrors.accountNotFound();
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
