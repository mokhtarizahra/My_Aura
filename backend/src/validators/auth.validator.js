import { z } from "zod";
import { MESSAGES } from "../constants/messages.js";

/*
|--------------------------------------------------------------------------
| Reusable enums
|--------------------------------------------------------------------------
*/

const identifierTypeSchema = z.enum(["phone", "email"], {
  error: MESSAGES.IDENTIFIER_TYPE_INVALID,
});

const accountTypeSchema = z.enum(["personal", "organization", "staff"], {
  error: MESSAGES.ACCOUNT_TYPE_INVALID,
});

const otpPurposeSchema = z.enum(["registration", "password_reset"], {
  error: MESSAGES.OTP_PURPOSE_INVALID,
});

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

export const loginSchema = z.object({
  identifier: z
    .string({ error: MESSAGES.IDENTIFIER_REQUIRED })
    .trim()
    .min(1, MESSAGES.IDENTIFIER_EMPTY),

  identifierType: identifierTypeSchema,

  accountType: accountTypeSchema.optional().default("personal"),

  password: z
    .string({ error: MESSAGES.PASSWORD_REQUIRED })
    .min(1, MESSAGES.PASSWORD_EMPTY)
    .max(200, MESSAGES.PASSWORD_TOO_LONG),
});

/*
|--------------------------------------------------------------------------
| Request OTP
|--------------------------------------------------------------------------
*/

export const requestOTPSchema = z.object({
  identifier: z
    .string({ error: MESSAGES.IDENTIFIER_REQUIRED })
    .trim()
    .min(1, MESSAGES.IDENTIFIER_EMPTY),

  identifierType: identifierTypeSchema,

  purpose: otpPurposeSchema.optional().default("registration"),
});

/*
|--------------------------------------------------------------------------
| Verify OTP
|--------------------------------------------------------------------------
*/

export const verifyOTPSchema = z.object({
  identifier: z
    .string({ error: MESSAGES.IDENTIFIER_REQUIRED })
    .trim()
    .min(1, MESSAGES.IDENTIFIER_EMPTY),

  identifierType: identifierTypeSchema,

  purpose: otpPurposeSchema.optional().default("registration"),

  otp: z
    .string({ error: MESSAGES.OTP_REQUIRED })
    .min(1, MESSAGES.OTP_REQUIRED)
    .regex(/^\d{4,8}$/, MESSAGES.OTP_FORMAT_INVALID),
});

/*
|--------------------------------------------------------------------------
| Register (Personal Account)
|--------------------------------------------------------------------------
*/

export const registerSchema = z.object({
  verificationToken: z
    .string({ error: MESSAGES.VERIFICATION_TOKEN_REQUIRED })
    .min(1, MESSAGES.VERIFICATION_TOKEN_REQUIRED),

  firstName: z
    .string({ error: MESSAGES.FIRST_NAME_REQUIRED })
    .trim()
    .min(1, MESSAGES.FIRST_NAME_REQUIRED)
    .min(2, MESSAGES.FIRST_NAME_TOO_SHORT)
    .max(50, MESSAGES.FIRST_NAME_TOO_LONG),

  lastName: z
    .string({ error: MESSAGES.LAST_NAME_REQUIRED })
    .trim()
    .min(1, MESSAGES.LAST_NAME_REQUIRED)
    .min(2, MESSAGES.LAST_NAME_TOO_SHORT)
    .max(50, MESSAGES.LAST_NAME_TOO_LONG),

  password: z
    .string({ error: MESSAGES.PASSWORD_REQUIRED })
    .min(1, MESSAGES.PASSWORD_EMPTY)
    .min(6, MESSAGES.PASSWORD_TOO_SHORT)
    .max(200, MESSAGES.PASSWORD_TOO_LONG),
});

/*
|--------------------------------------------------------------------------
| Password reset
|--------------------------------------------------------------------------
*/

export const passwordResetSchema = z.object({
  verificationToken: z
    .string({ error: MESSAGES.VERIFICATION_TOKEN_REQUIRED })
    .min(1, MESSAGES.VERIFICATION_TOKEN_REQUIRED),

  password: z
    .string({ error: MESSAGES.PASSWORD_REQUIRED })
    .min(1, MESSAGES.PASSWORD_EMPTY)
    .min(6, MESSAGES.PASSWORD_TOO_SHORT)
    .max(200, MESSAGES.PASSWORD_TOO_LONG),
});

/*
|--------------------------------------------------------------------------
| Change password (authenticated)
|--------------------------------------------------------------------------
*/

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ error: MESSAGES.CURRENT_PASSWORD_REQUIRED })
    .min(1, MESSAGES.CURRENT_PASSWORD_REQUIRED),

  newPassword: z
    .string({ error: MESSAGES.PASSWORD_REQUIRED })
    .min(1, MESSAGES.PASSWORD_EMPTY)
    .min(6, MESSAGES.PASSWORD_TOO_SHORT)
    .max(200, MESSAGES.PASSWORD_TOO_LONG),
});