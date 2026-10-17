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
