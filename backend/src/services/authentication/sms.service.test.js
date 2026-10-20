import { describe, expect, it } from "vitest";

import { sendEmailOTP, sendSMS } from "./sms.service.js";

describe("Authentication: sms.service", () => {
  describe("sendSMS", () => {
    it("should successfully prepare an SMS OTP", async () => {
      const result = await sendSMS("+989121234567", "1234");

      expect(result).toEqual({
        success: true,
        channel: "sms",
        identifier: "+989121234567",
      });
    });

    it("should accept numeric OTP", async () => {
      const result = await sendSMS("+989121234567", 1234);

      expect(result.success).toBe(true);
      expect(result.channel).toBe("sms");
    });

    it("should reject a missing identifier", async () => {
      await expect(sendSMS("", "1234")).rejects.toThrow(
        "Identifier is required",
      );
    });

    it("should reject an invalid OTP", async () => {
      await expect(sendSMS("+989121234567", "abc")).rejects.toThrow(
        "Invalid OTP",
      );
    });

    it("should reject an OTP shorter than 4 digits", async () => {
      await expect(sendSMS("+989121234567", "123")).rejects.toThrow(
        "Invalid OTP format",
      );
    });
  });

  describe("sendEmailOTP", () => {
    it("should successfully prepare an email OTP", async () => {
      const result = await sendEmailOTP("user@example.com", "1234");

      expect(result).toEqual({
        success: true,
        channel: "email",
        identifier: "user@example.com",
      });
    });

    it("should reject a missing email", async () => {
      await expect(sendEmailOTP("", "1234")).rejects.toThrow(
        "Identifier is required",
      );
    });

    it("should reject an invalid OTP", async () => {
      await expect(sendEmailOTP("user@example.com", "abcd")).rejects.toThrow(
        "Invalid OTP",
      );
    });
  });
});
