import { sendVerificationCode } from "../../utils/smsProvider.js";

const normalizeIdentifier = (identifier) => {
  if (typeof identifier !== "string" || !identifier.trim()) {
    throw new Error("Identifier is required");
  }

  return identifier.trim();
};

const validateOTP = (otp) => {
  if (typeof otp !== "string" && typeof otp !== "number") {
    throw new Error("Invalid OTP");
  }

  const normalizedOTP = String(otp);

  if (!/^\d{4,8}$/.test(normalizedOTP)) {
    throw new Error("Invalid OTP format");
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

  if (process.env.NODE_ENV === "test") {
    console.log(
      `[TEST] SMS would be sent to ${phone} with code ${normalizedOTP}`,
    );
    return {
      success: true,
      channel: "sms",
      identifier: phone,
    };
  }

  // ارسال واقعی از طریق sms.ir
  const result = await sendVerificationCode(phone, normalizedOTP);

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

  if (process.env.NODE_ENV !== "test") {
    console.log(`[EMAIL] OTP prepared for ${email}`);
  }

  return {
    success: true,
    channel: "email",
    identifier: email,
  };
};
