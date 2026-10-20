import { MESSAGES } from "../constants/messages.js";

/**
 * Build the standard 400 response for validation errors.
 *
 * The response shape is identical for both body and params,
 * so the client can handle them uniformly.
 */
const buildValidationError = (res, issues) => {
  return res.status(400).json({
    success: false,
    message: MESSAGES.VALIDATION_FAILED,
    errors: issues.map((issue) => ({
      field: issue.path.join(".") || "(root)",
      code: issue.message,
    })),
  });
};

/**
 * Validate req.body against a Zod schema.
 *
 * On success, req.body is replaced with the parsed (and sanitized) data,
 * so unknown fields are stripped and transforms are applied.
 */
export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return buildValidationError(res, result.error.issues);
  }

  req.body = result.data;
  next();
};

/**
 * Validate req.params against a Zod schema.
 *
 * On success, req.params is merged with the parsed data.
 * We use Object.assign (not reassignment) because Express 5
 * exposes req.params as a read-only getter in some setups.
 */
export const validateParams = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.params);

  if (!result.success) {
    return buildValidationError(res, result.error.issues);
  }

  Object.assign(req.params, result.data);
  next();
};