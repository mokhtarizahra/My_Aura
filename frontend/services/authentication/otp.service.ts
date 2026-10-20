import api from '@/lib/client';
import { extractErrorCode } from '@/lib/errors';
import { RequestOTPResponse, VerifyOTPResponse } from '@/types/auth';

/**
 * Request an OTP for the given identifier.
 *
 * @param identifier     phone number or email
 * @param identifierType "phone" | "email"
 * @param purpose        "registration" | "password_reset"
 */
export const requestOTP = async (
  identifier: string,
  identifierType: 'phone' | 'email',
  purpose: 'registration' | 'password_reset' = 'registration'
): Promise<RequestOTPResponse> => {
  try {
    const { data } = await api.post('/auth/otp/request', {
      identifier,
      identifierType,
      purpose,
    });
    if (data.success === false)
      throw new Error(data.code || 'OTP_REQUEST_FAILED');
    return data.data ?? data;
  } catch (err) {
    throw new Error(extractErrorCode(err));
  }
};

/**
 * Verify an OTP and receive a verification token.
 *
 * @returns { verificationToken, identifier, identifierType, purpose }
 */
export const verifyOTP = async (
  identifier: string,
  identifierType: 'phone' | 'email',
  otp: string,
  purpose: 'registration' | 'password_reset' = 'registration'
): Promise<VerifyOTPResponse> => {
  try {
    const { data } = await api.post('/auth/otp/verify', {
      identifier,
      identifierType,
      purpose,
      otp,
    });
    if (data.success === false)
      throw new Error(data.code || 'OTP_VERIFY_FAILED');
    return data.data ?? data;
  } catch (err) {
    throw new Error(extractErrorCode(err));
  }
};
