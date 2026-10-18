import api from '@/lib/client';
import { extractErrorCode } from '@/lib/errors';
import { AuthResponse } from '@/types/auth';

/**
 * Reset the password using a verification token
 * obtained from OTP verification.
 *
 * Backend endpoint: POST /auth/password/reset
 * Payload: { verificationToken, password }
 */
export const setPassword = async (
  verificationToken: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const { data } = await api.post('/auth/password/reset', {
      verificationToken,
      password,
    });
    if (data.success === false)
      throw new Error(data.code || 'PASSWORD_RESET_FAILED');
    return data;
  } catch (err) {
    throw new Error(extractErrorCode(err));
  }
};

/**
 * Change the password of the currently authenticated account.
 *
 * Backend endpoint: POST /auth/password/change
 * Payload: { currentPassword, newPassword }
 * Requires: Bearer access token (automatically attached by the axios client).
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean }> => {
  try {
    const { data } = await api.post('/auth/password/change', {
      currentPassword,
      newPassword,
    });
    if (data.success === false)
      throw new Error(data.code || 'PASSWORD_CHANGE_FAILED');
    return data.data ?? data;
  } catch (err) {
    throw new Error(extractErrorCode(err));
  }
};