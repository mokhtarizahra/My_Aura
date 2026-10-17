import api from '@/lib/client';
import { extractErrorCode } from '@/lib/errors';
import { AuthResponse, MessageResponse } from '@/types/auth';

/**
 * Log in with identifier (phone/email) and password.
 */
export const loginWithPassword = async (
  identifier: string,
  password: string,
  identifierType: 'phone' | 'email' = 'phone',
  accountType: 'personal' | 'organization' | 'staff' = 'personal'
): Promise<AuthResponse> => {
  try {
    const { data } = await api.post('/auth/login', {
      identifier,
      identifierType,
      accountType,
      password,
    });
    if (data.success === false) throw new Error(data.code || 'LOGIN_FAILED');
    return data;
  } catch (err) {
    throw new Error(extractErrorCode(err));
  }
};

/**
 * Register a new personal account using a verification token.
 */
export const register = async (
  verificationToken: string,
  firstName: string,
  lastName: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const { data } = await api.post('/auth/register', {
      verificationToken,
      firstName,
      lastName,
      password,
    });
    if (data.success === false) throw new Error(data.code || 'REGISTRATION_FAILED');
    return data;
  } catch (err) {
    throw new Error(extractErrorCode(err));
  }
};

/**
 * Log out the current session.
 */
export const logout = async (): Promise<MessageResponse> => {
  try {
    const { data } = await api.post('/auth/logout', {});
    if (data.success === false) throw new Error(data.code || 'LOGOUT_FAILED');
    return data;
  } catch (err) {
    throw new Error(extractErrorCode(err));
  }
};
