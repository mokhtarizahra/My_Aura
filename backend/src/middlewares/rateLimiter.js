import rateLimit from "express-rate-limit";

/**
 * OTP request limiter
 * Preventing SMS/Email bombing
 */
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // ۱۵ دقیقه
  max: 5,
  message: {
    success: false,
    message: "Too many OTP requests. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * OTP verify limiter
 * Preventing 6-digit code brute-force attacks
 */
export const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // ۱۰ دقیقه
  max: 5,
  message: {
    success: false,
    message: "Too many verification attempts. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Login limiter
 * Preventing password brute-force attacks
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Register limiter
 * Preventing mass account creation
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ۱ ساعت
  max: 3,
  message: {
    success: false,
    message: "Too many accounts created. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Password reset limiter
 * Preventing recovery token brute-force attacks
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many password reset attempts. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Refresh limiter
 * Preventing refresh token abuse
 */
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // چون refresh معمولاً زیاد صدا زده می‌شود، عدد بالاتر
  message: {
    success: false,
    message: "Too many refresh attempts. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
