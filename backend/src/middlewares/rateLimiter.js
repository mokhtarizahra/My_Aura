import rateLimit from "express-rate-limit";

/**
 * In the test environment, we keep the rate limiter ACTIVE (to ensure
 * it's wired correctly), but we increase the max requests significantly
 * so automated tests do not hit the 429 limit.
 */
const getLimit = (productionLimit) => {
  return process.env.NODE_ENV === "test" ? 10000 : productionLimit;
};

export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: getLimit(5), // 👈 در تست ۱۰۰۰۰، در پروداکشن ۵
  message: {
    success: false,
    message: "Too many OTP requests. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: getLimit(5),
  message: {
    success: false,
    message: "Too many verification attempts. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: getLimit(5),
  message: {
    success: false,
    message: "Too many login attempts. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: getLimit(3),
  message: {
    success: false,
    message: "Too many accounts created. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: getLimit(3),
  message: {
    success: false,
    message: "Too many password reset attempts. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: getLimit(30),
  message: {
    success: false,
    message: "Too many refresh attempts. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});