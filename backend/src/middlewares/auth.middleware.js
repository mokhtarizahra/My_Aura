import { verifyAccessToken } from "../utils/verifyAccessToken.js";

/**
 * Extract an access token from the Authorization header.
 */
const extractBearerToken = (req) => {
  const authorization = req.headers.authorization;

  if (!authorization) return null;

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) return null;

  return token;
};

/**
 * Authenticate a request using an access token.
 */
export const authenticateAccessToken = (req, res, next) => {
  try {
    const accessToken = extractBearerToken(req);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        code: "ACCESS_TOKEN_REQUIRED",
        message: "Access token required",
      });
    }

    const payload = verifyAccessToken(accessToken);

    /*
     * Authentication context.
     */
    req.auth = {
      accountId: payload.sub,
      accountType: payload.accountType,
    };

    return next();
  } catch (error) {
    // log error internally for debugging
    console.error("Access token verification failed:", error);

    /*
     * AppError carries a stable code + human-readable message.
     * Unknown errors get a generic fallback.
     */
    if (error?.code) {
      return res.status(401).json({
        success: false,
        code: error.code,
        message: error.message,
      });
    }

    return res.status(401).json({
      success: false,
      code: "ACCESS_TOKEN_INVALID_OR_EXPIRED",
      message: "Invalid or expired access token",
    });
  }
};

export default authenticateAccessToken;
