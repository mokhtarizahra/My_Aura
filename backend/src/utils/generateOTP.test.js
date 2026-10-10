import { describe, expect, it } from "vitest";

import { generateOTP } from "./generateOTP.js";

describe("Utility: generateOTP", () => {
  it("should generate a 4-digit OTP by default", () => {
    const otp = generateOTP();

    expect(typeof otp).toBe("string");

    expect(otp).toHaveLength(4);

    expect(/^\d{4}$/.test(otp)).toBe(true);
  });

  it("should generate an OTP with the requested length", () => {
    const otp = generateOTP(6);

    expect(otp).toHaveLength(6);

    expect(/^\d{6}$/.test(otp)).toBe(true);
  });

  it("should throw an error for an invalid length", () => {
    expect(() => generateOTP(3)).toThrow();
  });
});
