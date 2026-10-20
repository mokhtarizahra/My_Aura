import PersonalAccount from "../../models/account/PersonalAccount.js";
import TempOTP from "../../models/authentication/TempOTP.js";
import { generateOTP } from "../../utils/generateOTP.js";
import { compareOTP, hashOTP } from "../../utils/hashOTP.js";
import { generateVerificationToken } from "./token.service.js";
import { sendEmailOTP, sendSMS } from "./sms.service.js";
import { authErrors } from "../../errors/authErrors.js";

const OTP_EXPIRATION_MS = 2 * 60 * 1000;

const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

const MAX_OTP_ATTEMPTS = 5;

const VALID_IDENTIFIER_TYPES = ["phone", "email"];

const VALID_PURPOSES = [
  "registration",
  "password_reset",
  "email_verification",
  "phone_verification",
];

// Validate identifier type.
const validateIdentifierType = (identifierType) => {
  if (!VALID_IDENTIFIER_TYPES.includes(identifierType)) {
    throw authErrors.identifierTypeInvalid();
  }
};

// Validate OTP purpose.
const validatePurpose = (purpose) => {
  if (!VALID_PURPOSES.includes(purpose)) {
    throw authErrors.otpPurposeInvalid();
  }
};

// Validate identifier.
const validateIdentifier = (identifier) => {
  if (typeof identifier !== "string" || !identifier.trim()) {
    throw authErrors.identifierRequired();
  }

  return identifier.trim();
};

// Find a PersonalAccount using the
// correct identifier field.
const findPersonalAccount = async ({ identifier, identifierType }) => {
  const field = identifierType === "phone" ? "phone" : "email";

  return PersonalAccount.findOne({
    [field]: identifier,
  });
};

//Check whether another OTP request
//is currently inside the resend cooldown.

const checkResendCooldown = async ({ identifier, purpose }) => {
  const existingOTP = await TempOTP.findOne({ identifier, purpose });

  if (!existingOTP) {
    return;
  }

  const updatedAt = existingOTP.updatedAt;

  if (!updatedAt) {
    return;
  }

  const elapsed = Date.now() - new Date(updatedAt).getTime();

  if (elapsed < OTP_RESEND_COOLDOWN_MS) {
    throw authErrors.otpResendCooldown();
  }
};

/**
 * Send an OTP.
 */
export const sendOTP = async ({
  identifier,
  identifierType,
  purpose = "registration",
}) => {
  const normalizedIdentifier = validateIdentifier(identifier);

  validateIdentifierType(identifierType);

  validatePurpose(purpose);

  /*
   * Registration:
   * account must NOT already exist.
   */
  if (purpose === "registration") {
    const account = await findPersonalAccount({
      identifier: normalizedIdentifier,
      identifierType,
    });

    if (account) {
      throw authErrors.accountAlreadyExists();
    }
  }

  /*
   * Password reset:
   * account MUST already exist.
   */
  if (purpose === "password_reset") {
    const account = await findPersonalAccount({
      identifier: normalizedIdentifier,
      identifierType,
    });

    if (!account) {
      throw authErrors.accountNotFound();
    }
  }

  /*
   * Prevent OTP flooding.
   */
  await checkResendCooldown({
    identifier: normalizedIdentifier,
    purpose,
  });

  const otp = generateOTP();

  const otpHash = await hashOTP(otp);

  const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MS);

  await TempOTP.findOneAndUpdate(
    {
      identifier: normalizedIdentifier,
      purpose,
    },
    {
      identifier: normalizedIdentifier,
      identifierType,
      otpHash,
      purpose,
      expiresAt,
      attempts: 0,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  if (identifierType === "phone") {
    await sendSMS(normalizedIdentifier, otp);
  } else {
    await sendEmailOTP(normalizedIdentifier, otp);
  }

  return {
    success: true,
    identifier: normalizedIdentifier,
    identifierType,
    purpose,
    expiresIn: OTP_EXPIRATION_MS,
  };
};

/**
 * Verify an OTP.
 */
export const verifyOTP = async ({
  identifier,
  identifierType,
  purpose,
  otp,
}) => {
  const normalizedIdentifier = validateIdentifier(identifier);

  validateIdentifierType(identifierType);

  validatePurpose(purpose);

  if (typeof otp !== "string" && typeof otp !== "number") {
    throw authErrors.otpInvalid();
  }

  const normalizedOTP = String(otp);

  /*
   * The OTP hash is select:false,
   * therefore it must explicitly be selected.
   */
  const otpRecord = await TempOTP.findOne({
    identifier: normalizedIdentifier,
    identifierType,
    purpose,
  }).select("+otpHash");

  if (!otpRecord) {
    throw authErrors.otpInvalidOrExpired();
  }

  /*
   * Check expiration.
   */
  if (new Date() > otpRecord.expiresAt) {
    await TempOTP.deleteOne({
      _id: otpRecord._id,
    });

    throw authErrors.otpExpired();
  }

  /*
   * Check maximum attempts.
   */
  if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
    await TempOTP.deleteOne({
      _id: otpRecord._id,
    });

    throw authErrors.otpMaxAttemptsExceeded();
  }

  const isValid = await compareOTP(normalizedOTP, otpRecord.otpHash);

  /*
   * Invalid OTP:
   * increment attempts but keep the record
   * until maximum attempts or expiration.
   */
  if (!isValid) {
    otpRecord.attempts += 1;

    await otpRecord.save();

    throw authErrors.otpInvalid();
  }

  /*
   * OTP is single-use.
   */
  await TempOTP.deleteOne({
    _id: otpRecord._id,
  });

  /*
   * Verification Token proves that
   * this identifier was successfully verified
   * for the requested purpose.
   */
  const verificationToken = generateVerificationToken({
    identifier: normalizedIdentifier,
    identifierType,
    purpose,
  });

  return {
    success: true,
    verificationToken,
    identifier: normalizedIdentifier,
    identifierType,
    purpose,
  };
};

export const OTP_CONFIG = {
  expirationMs: OTP_EXPIRATION_MS,

  resendCooldownMs: OTP_RESEND_COOLDOWN_MS,

  maxAttempts: MAX_OTP_ATTEMPTS,
};
