import PersonalUser from "../../models/identity/PersonalUser.js";

import {
  createPersonalAccount,
  findPersonalAccount,
  hashPassword,
} from "./account.service.js";

const VALID_IDENTIFIER_TYPES = ["phone", "email"];

const validateIdentifierType = (identifierType) => {
  if (!VALID_IDENTIFIER_TYPES.includes(identifierType)) {
    throw new Error("Invalid identifier type");
  }
};

const validateIdentifier = (identifier) => {
  if (typeof identifier !== "string" || !identifier.trim()) {
    throw new Error("Identifier is required");
  }

  return identifier.trim();
};

const validateName = (name, fieldName) => {
  if (typeof name !== "string" || !name.trim()) {
    throw new Error(`${fieldName} is required`);
  }

  const normalizedName = name.trim();

  if (normalizedName.length < 2) {
    throw new Error(`${fieldName} must be at least 2 characters`);
  }

  if (normalizedName.length > 50) {
    throw new Error(`${fieldName} must not exceed 50 characters`);
  }

  return normalizedName;
};

/**
 * Normalize a registration identifier.
 *
 * The normalization rules intentionally match
 * PersonalAccount normalization.
 */
const normalizeIdentifier = ({ identifier, identifierType }) => {
  if (identifierType === "phone") {
    return identifier.trim();
  }

  return identifier.trim().toLowerCase();
};

/**
 * Check whether a PersonalAccount already exists.
 */
const ensurePersonalAccountDoesNotExist = async ({
  identifier,
  identifierType,
}) => {
  const account =
    identifierType === "phone"
      ? await findPersonalAccount({
          phone: identifier,
        })
      : await findPersonalAccount({
          email: identifier,
        });

  if (account) {
    throw new Error("Account already exists");
  }
};

/**
 * Create a PersonalUser and its
 * corresponding PersonalAccount.
 *
 * Registration is intentionally limited
 * to Personal Accounts.
 *
 * Organization and Staff Accounts are
 * created through their own administrative
 * flows and are not publicly registered.
 */
export const registerPersonalAccount = async ({
  firstName,
  lastName,
  identifier,
  identifierType,
  password,
}) => {
  const normalizedFirstName = validateName(firstName, "First name");

  const normalizedLastName = validateName(lastName, "Last name");

  const normalizedIdentifier = validateIdentifier(identifier);

  validateIdentifierType(identifierType);

  const finalIdentifier = normalizeIdentifier({
    identifier: normalizedIdentifier,
    identifierType,
  });

  /*
   * The account must not already exist.
   *
   * This check is intentionally performed
   * before creating the PersonalUser so
   * a duplicate registration does not
   * create an orphan identity.
   */
  await ensurePersonalAccountDoesNotExist({
    identifier: finalIdentifier,
    identifierType,
  });

  /*
   * Password hashing belongs to
   * account.service.js.
   */
  const passwordHash = await hashPassword(password);

  /*
   * PersonalUser represents identity.
   * It does NOT contain phone, email,
   * password or authentication state.
   */
  const user = await PersonalUser.create({
    firstName: normalizedFirstName,
    lastName: normalizedLastName,
    status: "active",
  });

  try {
    /*
     * PersonalAccount represents
     * authentication/account state.
     *
     * Because registration has already
     * passed verification, the account
     * becomes verified and active.
     */
    const account =
      identifierType === "phone"
        ? await createPersonalAccount({
            userId: user._id,
            phone: finalIdentifier,
            passwordHash,
            status: "active",
            isVerified: true,
          })
        : await createPersonalAccount({
            userId: user._id,
            email: finalIdentifier,
            passwordHash,
            status: "active",
            isVerified: true,
          });

    return {
      user,
      account,
    };
  } catch (error) {
    /*
     * If account creation fails after the
     * identity was created, remove the
     * identity so we do not leave an orphan
     * PersonalUser.
     */
    await PersonalUser.deleteOne({
      _id: user._id,
    });

    throw error;
  }
};

export const REGISTRATION_CONFIG = {
  IDENTIFIER_TYPES: VALID_IDENTIFIER_TYPES,
};
