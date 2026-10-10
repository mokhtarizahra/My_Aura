import { MESSAGES } from "../constants/messages.js";

/**
 * Validation middleware.
 *
 * Receives a Zod schema and validates req.body against it.
 * On success, replaces req.body with the parsed (and sanitized)
 * data returned by Zod.
 * On failure, returns a 400 response with structured errors.
 */
export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: MESSAGES.VALIDATION_FAILED,
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join(".") || "(root)",
        code: issue.message,
      })),
    });
  }

  // Replace body with the parsed data.
  // This ensures only fields defined in the schema reach the controller,
  // and unknown fields are stripped by default.
  req.body = result.data;

  next();
};
