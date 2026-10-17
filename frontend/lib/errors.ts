/**
 * Error handling utilities.
 *
 * The backend is expected to respond with a structured error:
 *   { success: false, code: "INVALID_CREDENTIALS", message?: "..." }
 *
 * Services must throw **error codes**, never user-facing messages.
 * Translation is the sole responsibility of the UI layer.
 */

/**
 * Extract a translatable error code from an unknown error.
 *
 * Priority:
 *   1. err.response.data.code      (backend-provided code)
 *   2. err.response.data.message   (backend-provided message, used as fallback code)
 *   3. err.message                 (axios / network error)
 *   4. 'NETWORK_ERROR'             (generic fallback)
 */
export const extractErrorCode = (err: unknown): string => {
  if (typeof err === 'object' && err !== null) {
    const anyErr = err as any;

    const code =
      anyErr.response?.data?.code ||
      anyErr.response?.data?.message ||
      anyErr.message;

    if (typeof code === 'string' && code.length > 0) {
      return code;
    }
  }

  return 'NETWORK_ERROR';
};
