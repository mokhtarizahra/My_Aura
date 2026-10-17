/**
 * Application error with a stable, machine-readable code.
 *
 * Services throw AppError instances.
 * Controllers translate them into HTTP responses.
 *
 * The `code` is what the frontend uses to look up
 * translated messages. It must stay UPPER_SNAKE_CASE
 * and stable across releases.
 */
export class AppError extends Error {
  /**
   * @param {string} code    Machine-readable error code (e.g. "INVALID_CREDENTIALS")
   * @param {number} status  HTTP status code (e.g. 401)
   * @param {string} [message] Human-readable message (for logs / debugging)
   */
  constructor(code, status, message) {
    super(message || code);
    this.name = "AppError";
    this.code = code;
    this.status = status;

    // Ensure stack trace excludes the constructor itself
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}
