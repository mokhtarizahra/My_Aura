import axios from "axios";
import { sendVerificationCode } from "./smsProvider";
import { describe, it, expect, afterEach, vi } from "vitest";

process.env.SMS_IR_API_KEY = "test-api-key";
process.env.SMS_IR_TEMPLATE_ID = "123456";
process.env.SMS_IR_BASE_URL = "https://api.sms.ir/v1";

vi.mock("axios");

describe("smsProvider", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should send verification code successfully", async () => {
    const mockResponse = {
      data: {
        status: 1,
        message: "موفق",
        data: { messageId: 12345, cost: 1.0 },
      },
    };
    axios.post.mockResolvedValue(mockResponse);

    const result = await sendVerificationCode("919xxxx904", "123456");

    expect(result.success).toBe(true);
    expect(result.messageId).toBe(12345);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/send/verify"),
      expect.objectContaining({
        mobile: "919xxxx904",
        templateId: 123456,
        parameters: [{ name: "Code", value: "123456" }],
      }),
      expect.any(Object),
    );
  });

  it("should throw error if API returns non-1 status", async () => {
    const mockErrorResponse = {
      data: {
        status: 0,
        message: "شماره موبایل نامعتبر است",
      },
    };
    axios.post.mockResolvedValue(mockErrorResponse);

    await expect(sendVerificationCode("invalid", "123456")).rejects.toThrow(
      "SMS.ir error: شماره موبایل نامعتبر است",
    );
  });

  it("should throw network error when request fails", async () => {
    const networkError = { request: {} };
    axios.post.mockRejectedValue(networkError);

    await expect(sendVerificationCode("919xxxx904", "123456")).rejects.toThrow(
      "Network error while sending SMS",
    );
  });
});
