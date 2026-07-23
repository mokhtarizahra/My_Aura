import { describe, it, expect } from 'vitest';
import { hashOTP, compareOTP } from './hashOTP.js';

describe('Utility: hashOTP & compareOTP', () => {
  it('it must hash the OTP and `compareOTP` must return `true` for matching values', async () => {
    // Arrange
    const plainOtp = '1234'

    // Act
    const hashedOtp = await hashOTP(plainOtp);
    const isMatch = await compareOTP(plainOtp, hashedOtp);

    // Assert
    expect(hashedOtp).toBeDefined();
    expect(hashedOtp).not.toBe(plainOtp);
    expect(isMatch).toBe(true);
  });

  it('it must return `false` for non-matching values', () => {
    // Arrange
    const plainOtp = '1234';
    const wrongOtp = '5678';

    // Act 
    const hashedOtp = await hashOTP(plainOtp);
    const isMatch = await compareOTP(wrongOtp, hashedOtp);

    // Assert
    expect(isMatch).toBe(false);
  });
});