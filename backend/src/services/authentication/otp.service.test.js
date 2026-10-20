import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../models/account/PersonalAccount.js", () => ({
  default: {
    findOne: vi.fn(),
  },
}));

vi.mock("../../models/authentication/TempOTP.js", () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    deleteOne: vi.fn(),
  },
}));

vi.mock("../../utils/generateOTP.js", () => ({
  generateOTP: vi.fn(),
}));

vi.mock("../../utils/hashOTP.js", () => ({
  hashOTP: vi.fn(),
  compareOTP: vi.fn(),
}));

vi.mock("./sms.service.js", () => ({
  sendSMS: vi.fn(),
  sendEmailOTP: vi.fn(),
}));

vi.mock("./token.service.js", () => ({
  generateVerificationToken: vi.fn(),
}));

import PersonalAccount from "../../models/account/PersonalAccount.js";
import TempOTP from "../../models/authentication/TempOTP.js";

import { generateOTP } from "../../utils/generateOTP.js";

import { compareOTP, hashOTP } from "../../utils/hashOTP.js";

import { sendEmailOTP, sendSMS } from "./sms.service.js";

import { generateVerificationToken } from "./token.service.js";

import { OTP_CONFIG, sendOTP, verifyOTP } from "./otp.service.js";

describe("Authentication: otp.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    generateOTP.mockReturnValue("1234");

    hashOTP.mockResolvedValue("hashed-otp");

    compareOTP.mockResolvedValue(true);

    generateVerificationToken.mockReturnValue("verification-token");

    sendSMS.mockResolvedValue({
      success: true,
    });

    sendEmailOTP.mockResolvedValue({
      success: true,
    });

    PersonalAccount.findOne.mockResolvedValue(null);

    TempOTP.findOne.mockResolvedValue(null);

    TempOTP.findOneAndUpdate.mockResolvedValue({});

    TempOTP.deleteOne.mockResolvedValue({});
  });

  describe("sendOTP", () => {
    it("should send a registration OTP to a phone number", async () => {
      const result = await sendOTP({
        identifier: "+989121234567",
        identifierType: "phone",
        purpose: "registration",
      });

      expect(generateOTP).toHaveBeenCalled();

      expect(hashOTP).toHaveBeenCalledWith("1234");

      expect(TempOTP.findOneAndUpdate).toHaveBeenCalledWith(
        {
          identifier: "+989121234567",
          purpose: "registration",
        },
        expect.objectContaining({
          identifier: "+989121234567",
          identifierType: "phone",
          otpHash: "hashed-otp",
          purpose: "registration",
          attempts: 0,
        }),
        expect.objectContaining({
          upsert: true,
          new: true,
        }),
      );

      expect(sendSMS).toHaveBeenCalledWith("+989121234567", "1234");

      expect(result.success).toBe(true);
    });

    it("should send a registration OTP to an email", async () => {
      const result = await sendOTP({
        identifier: "user@example.com",
        identifierType: "email",
        purpose: "registration",
      });

      expect(sendEmailOTP).toHaveBeenCalledWith("user@example.com", "1234");

      expect(sendSMS).not.toHaveBeenCalled();

      expect(result.success).toBe(true);
    });

    it("should reject registration when the account already exists", async () => {
      PersonalAccount.findOne.mockResolvedValue({
        _id: "account-id",
      });

      await expect(
        sendOTP({
          identifier: "+989121234567",
          identifierType: "phone",
          purpose: "registration",
        }),
      ).rejects.toThrow("Account already exists");

      expect(generateOTP).not.toHaveBeenCalled();

      expect(sendSMS).not.toHaveBeenCalled();
    });

    it("should reject password reset when the account does not exist", async () => {
      PersonalAccount.findOne.mockResolvedValue(null);

      await expect(
        sendOTP({
          identifier: "+989121234567",
          identifierType: "phone",
          purpose: "password_reset",
        }),
      ).rejects.toThrow("Account not found");
    });

    it("should reject an invalid identifier type", async () => {
      await expect(
        sendOTP({
          identifier: "+989121234567",
          identifierType: "username",
          purpose: "registration",
        }),
      ).rejects.toThrow("Invalid identifier type");
    });

    it("should reject an invalid purpose", async () => {
      await expect(
        sendOTP({
          identifier: "+989121234567",
          identifierType: "phone",
          purpose: "login",
        }),
      ).rejects.toThrow("Invalid OTP purpose");
    });

    it("should reject sending another OTP during the resend cooldown", async () => {
      TempOTP.findOne.mockResolvedValue({
        updatedAt: new Date(),
      });

      await expect(
        sendOTP({
          identifier: "+989121234567",
          identifierType: "phone",
          purpose: "registration",
        }),
      ).rejects.toThrow("OTP resend cooldown active");

      expect(generateOTP).not.toHaveBeenCalled();
    });
  });

  describe("verifyOTP", () => {
    const createOTPRecord = (overrides = {}) => ({
      _id: "otp-id",
      identifier: "+989121234567",
      identifierType: "phone",
      purpose: "registration",
      otpHash: "hashed-otp",
      expiresAt: new Date(Date.now() + 60 * 1000),
      attempts: 0,
      save: vi.fn(),
      ...overrides,
    });

    it("should verify a valid OTP and return a verification token", async () => {
      const otpRecord = createOTPRecord();

      const selectMock = vi.fn().mockResolvedValue(otpRecord);

      TempOTP.findOne.mockReturnValue({
        select: selectMock,
      });

      compareOTP.mockResolvedValue(true);

      const result = await verifyOTP({
        identifier: "+989121234567",
        identifierType: "phone",
        purpose: "registration",
        otp: "1234",
      });

      expect(compareOTP).toHaveBeenCalledWith("1234", "hashed-otp");

      expect(TempOTP.deleteOne).toHaveBeenCalledWith({
        _id: "otp-id",
      });

      expect(generateVerificationToken).toHaveBeenCalledWith({
        identifier: "+989121234567",
        identifierType: "phone",
        purpose: "registration",
      });

      expect(result.verificationToken).toBe("verification-token");
    });

    it("should reject an expired OTP", async () => {
      const otpRecord = createOTPRecord({
        expiresAt: new Date(Date.now() - 1000),
      });

      TempOTP.findOne.mockReturnValue({
        select: vi.fn().mockResolvedValue(otpRecord),
      });

      await expect(
        verifyOTP({
          identifier: "+989121234567",
          identifierType: "phone",
          purpose: "registration",
          otp: "1234",
        }),
      ).rejects.toThrow("OTP expired");

      expect(TempOTP.deleteOne).toHaveBeenCalledWith({
        _id: "otp-id",
      });
    });

    it("should reject an invalid OTP and increment attempts", async () => {
      const save = vi.fn();

      const otpRecord = createOTPRecord({
        attempts: 1,
        save,
      });

      TempOTP.findOne.mockReturnValue({
        select: vi.fn().mockResolvedValue(otpRecord),
      });

      compareOTP.mockResolvedValue(false);

      await expect(
        verifyOTP({
          identifier: "+989121234567",
          identifierType: "phone",
          purpose: "registration",
          otp: "9999",
        }),
      ).rejects.toThrow("Invalid OTP");

      expect(otpRecord.attempts).toBe(2);

      expect(save).toHaveBeenCalled();

      expect(generateVerificationToken).not.toHaveBeenCalled();
    });

    it("should reject an OTP after maximum attempts", async () => {
      const otpRecord = createOTPRecord({
        attempts: OTP_CONFIG.maxAttempts,
      });

      TempOTP.findOne.mockReturnValue({
        select: vi.fn().mockResolvedValue(otpRecord),
      });

      await expect(
        verifyOTP({
          identifier: "+989121234567",
          identifierType: "phone",
          purpose: "registration",
          otp: "1234",
        }),
      ).rejects.toThrow("Maximum OTP attempts exceeded");

      expect(TempOTP.deleteOne).toHaveBeenCalledWith({
        _id: "otp-id",
      });

      expect(compareOTP).not.toHaveBeenCalled();
    });

    it("should reject when there is no OTP request", async () => {
      TempOTP.findOne.mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      });

      await expect(
        verifyOTP({
          identifier: "+989121234567",
          identifierType: "phone",
          purpose: "registration",
          otp: "1234",
        }),
      ).rejects.toThrow("Invalid or expired OTP request");
    });

    it("should consume the OTP after successful verification", async () => {
      const otpRecord = createOTPRecord({
        purpose: "password_reset",
      });

      TempOTP.findOne.mockReturnValue({
        select: vi.fn().mockResolvedValue(otpRecord),
      });

      await verifyOTP({
        identifier: "+989121234567",
        identifierType: "phone",
        purpose: "password_reset",
        otp: "1234",
      });

      expect(TempOTP.deleteOne).toHaveBeenCalledTimes(1);
    });

    it("should support email verification", async () => {
      const otpRecord = createOTPRecord({
        identifier: "user@example.com",
        identifierType: "email",
        purpose: "email_verification",
      });

      TempOTP.findOne.mockReturnValue({
        select: vi.fn().mockResolvedValue(otpRecord),
      });

      const result = await verifyOTP({
        identifier: "user@example.com",
        identifierType: "email",
        purpose: "email_verification",
        otp: "1234",
      });

      expect(generateVerificationToken).toHaveBeenCalledWith({
        identifier: "user@example.com",
        identifierType: "email",
        purpose: "email_verification",
      });

      expect(result.verificationToken).toBe("verification-token");
    });
  });
});
