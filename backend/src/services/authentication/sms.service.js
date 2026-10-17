import { sendVerificationCode } from "../../utils/smsProvider.js";
import { authErrors } from "../../errors/authErrors.js";

const normalizeIdentifier = (identifier) => {
  if (typeof identifier !== "string" || !identifier.trim()) {
    throw authErrors.identifierRequired();
  }

  return identifier.trim();
};

const validateOTP = (otp) => {
  if (typeof otp !== "string" && typeof otp !== "number") {
    throw authErrors.otpInvalid();
  }

  const normalizedOTP = String(otp);

  if (!/^\d{4,8}$/.test(normalizedOTP)) {
    throw authErrors.otpFormatInvalid();
  }

  return normalizedOTP;
};

/**
 * Send an SMS.
 *
 * Provider integration will be implemented here.
 */
export const sendSMS = async (identifier, otp) => {
  const phone = normalizeIdentifier(identifier);
  const normalizedOTP = validateOTP(otp);

  /*
   * TODO:
   * Replace this section with the actual SMS provider.
   *
   * Example:
   *
   * await smsProvider.send({
   *   to: phone,
   *   message: `Your MyAura verification code is ${normalizedOTP}`,
   * });
   */

    /*
   * In development, log the OTP and skip sending real SMS.
   * In test, log it too.
   * In production, send real SMS.
   */
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[DEV] SMS to ${phone} — OTP: ${normalizedOTP}`,
    );
    return {
      success: true,
      channel: "sms",
      identifier: phone,
    };
  }

   // ارسال واقعی از طریق sms.ir
  let result;
  try {
    result = await sendVerificationCode(phone, normalizedOTP);
  } catch (err) {
    console.error('[SMS.ir] Send failed:', err?.message || err);
    throw authErrors.smsSendFailed();
  }

  return {
    success: true,
    channel: "sms",
    identifier: phone,
    messageId: result.messageId,
    cost: result.cost,
  };
};

/**
 * Send an OTP through email.
 *
 * Although this function currently lives in sms.service.js
 * for backward compatibility with otp.service.js,
 * the actual implementation is provider-specific.
 *
 * It can later be moved to email.service.js without
 * changing OTP business logic.
 */
export const sendEmailOTP = async (identifier, otp) => {
  const email = normalizeIdentifier(identifier);
  const normalizedOTP = validateOTP(otp);

  /*
   * TODO:
   * Replace this section with the actual email provider.
   *
   * Example:
   *
   * await emailProvider.send({
   *   to: email,
   *   subject: "MyAura Verification Code",
   *   text: `Your verification code is ${normalizedOTP}`,
   * });
   */

    if (process.env.NODE_ENV !== "production") {
    console.log(`[DEV] Email to ${email} — OTP: ${normalizedOTP}`);
  }

  return {
    success: true,
    channel: "email",
    identifier: email,
  };
};
