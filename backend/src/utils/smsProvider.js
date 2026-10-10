// services/smsProvider.js
import axios from "axios";

/**
 * ارسال کد تأیید از طریق سرویس sms.ir
 * @param {string} mobile - شماره موبایل گیرنده
 * @param {string} code - کد تأیید (OTP)
 * @returns {Promise<Object>} - نتیجه ارسال
 */
export const sendVerificationCode = async (mobile, code) => {
  // مهم: env داخل تابع خوانده می‌شود
  const BASE_URL = process.env.SMS_IR_BASE_URL || "https://api.sms.ir/v1";
  const API_KEY = process.env.SMS_IR_API_KEY;
  const TEMPLATE_ID = process.env.SMS_IR_TEMPLATE_ID;

  if (!API_KEY) {
    throw new Error("SMS_IR_API_KEY is not defined in environment variables");
  }

  if (!TEMPLATE_ID) {
    throw new Error(
      "SMS_IR_TEMPLATE_ID is not defined in environment variables",
    );
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/send/verify`,
      {
        mobile,
        templateId: parseInt(TEMPLATE_ID),
        parameters: [
          {
            name: "Code",
            value: code,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "text/plain",
          "x-api-key": API_KEY,
        },
      },
    );

    // پاسخ موفق sms.ir
    if (response.data.status === 1) {
      return {
        success: true,
        messageId: response.data.data?.messageId,
        cost: response.data.data?.cost,
      };
    }

    throw new Error(`SMS.ir error: ${response.data.message}`);
  } catch (error) {
    if (error.response) {
      console.error("SMS.ir response error:", error.response.data);

      throw new Error(
        `SMS.ir error: ${error.response.data.message || "Unknown error"}`,
      );
    }

    if (error.request) {
      console.error("SMS.ir network error:", error.request);
      throw new Error("Network error while sending SMS");
    }

    console.error("SMS.ir error:", error.message);
    throw new Error(`SMS.ir error: ${error.message}`);
  }
};
