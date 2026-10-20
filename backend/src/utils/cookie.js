/**
 * Cookie helpers for refresh-token transport.
 *
 * Cookies are an HTTP concern, so they live in the HTTP layer.
 * Controllers use these helpers instead of inlining cookie options.
 */

const REFRESH_TOKEN_COOKIE = "refreshToken";

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, must match token.service.js
  path: "/api/auth",
};

/**
 * Attach the refresh token as an HTTP-only cookie.
 */
export const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
};

/**
 * Remove the refresh token cookie.
 */
export const clearRefreshTokenCookie = (res) => {
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    path: REFRESH_TOKEN_COOKIE_OPTIONS.path,
  });
};
