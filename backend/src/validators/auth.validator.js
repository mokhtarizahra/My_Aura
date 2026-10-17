import { z } from "zod";
import { MESSAGES } from "../constants/messages.js";

/*
|--------------------------------------------------------------------------
| Reusable enums
|--------------------------------------------------------------------------
|
| These mirror the enums defined in token.service.js.
| Keep them in sync if the service enums change.
|
*/

const identifierTypeSchema = z.enum(["phone", "email"], {
  errorMap: () => ({
    message: MESSAGES.IDENTIFIER_TYPE_INVALID,
  }),
});

const accountTypeSchema = z.enum(["personal", "organization", "staff"], {
  errorMap: () => ({
    message: MESSAGES.ACCOUNT_TYPE_INVALID,
  }),
});

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

export const loginSchema = z.object({
  identifier: z
    .string({ required_error: MESSAGES.IDENTIFIER_REQUIRED })
    .trim()
    .min(1, MESSAGES.IDENTIFIER_EMPTY),

  identifierType: identifierTypeSchema,

  accountType: accountTypeSchema.optional().default("personal"),

  password: z
    .string({ required_error: MESSAGES.PASSWORD_REQUIRED })
    .min(1, MESSAGES.PASSWORD_EMPTY)
    .max(200, MESSAGES.PASSWORD_TOO_LONG),
});
