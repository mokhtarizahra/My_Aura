import axios from "axios";

import { describe, expect, it, vi } from "vitest";

import { sendEmailOTP, sendSMS } from "./sms.service.js";

vi.mock("axios");

describe("sms.service", () => {
  it("should send SMS", async () => {
    axios.post.mockResolvedValue({
      data: {
        success: true,
      },
    });

    const result = await sendSMS("09121234567", "1234");

    expect(result.success).toBe(true);
  });

  it("should throw SMS error", async () => {
    axios.post.mockRejectedValue(new Error());

    await expect(sendSMS("09121234567", "1234")).rejects.toThrow(
      "SMS sending failed",
    );
  });

  it("should send email OTP", async () => {
    const result = await sendEmailOTP("test@example.com", "1234");

    expect(result.success).toBe(true);
  });
});
