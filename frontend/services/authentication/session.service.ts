import api from '@/lib/client';
import { extractErrorCode } from '@/lib/errors';
import { MessageResponse, SessionsResponse } from '@/types/auth';

/**
 * Get all active sessions for the current user.
 *
 * Backend endpoint: GET /auth/sessions
 * Requires: access token (sent automatically by axios client)
 */
export const getSessions = async (): Promise<SessionsResponse> => {
  try {
    const { data } = await api.get('/auth/sessions');
    if (data.success === false)
      throw new Error(data.code || 'SESSIONS_FETCH_FAILED');
    return data;
  } catch (err) {
    throw new Error(extractErrorCode(err));
  }
};

/**
 * Revoke the current session (the one making this request).
 *
 * Backend endpoint: DELETE /auth/sessions/current
 * Uses the refresh token cookie to identify the session.
 */
export const revokeSession = async (): Promise<MessageResponse> => {
  try {
    const { data } = await api.delete('/auth/sessions/current');
    if (data.success === false)
      throw new Error(data.code || 'SESSION_REVOKE_FAILED');
    return data;
  } catch (err) {
    throw new Error(extractErrorCode(err));
  }
};

/**
 * Revoke all active sessions for the current user.
 *
 * Backend endpoint: DELETE /auth/sessions
 * Requires: access token
 */
export const revokeAllSessions = async (): Promise<MessageResponse> => {
  try {
    const { data } = await api.delete('/auth/sessions');
    if (data.success === false)
      throw new Error(data.code || 'SESSIONS_REVOKE_ALL_FAILED');
    return data;
  } catch (err) {
    throw new Error(extractErrorCode(err));
  }
};
