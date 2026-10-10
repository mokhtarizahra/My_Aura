import { verifyAccessToken } from "../utils/verifyAccessToken.js";

/**
 * Extract an access token from the Authorization header.
 *
 * Expected format:
 *
 * Authorization: Bearer <token>
 */
const extractBearerToken = (req) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

/**
 * Authenticate a request using an access token.
 *
 * Responsibilities:
 *
 * 1. Extract access token from Authorization header.
 * 2. Verify the token through verifyAccessToken().
 * 3. Validate the authentication payload.
 * 4. Attach authentication context to req.auth.
 *
 * This middleware does NOT:
 *
 * - query the database
 * - authenticate passwords
 * - validate refresh tokens
 * - create tokens
 * - revoke sessions
 * - contain business rules
 */
export const authenticateAccessToken = (req, res, next) => {
  try {
    const accessToken = extractBearerToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const payload = verifyAccessToken(accessToken);

    if (!payload?.sub) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }

    if (!payload?.accountType) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }

    if (payload.tokenType !== "access") {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }

    /*
     * Authentication context.
     *
     * Controllers should use req.auth
     * instead of decoding JWT themselves.
     */
    req.auth = {
      accountId: payload.sub,
      accountType: payload.accountType,
    };

    return next();
  } catch (error) {
    // log error internally for debugging
    console.error("Access token verification failed:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};

export default authenticateAccessToken;
