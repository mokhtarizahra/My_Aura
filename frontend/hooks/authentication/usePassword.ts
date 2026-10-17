'use client';

import { useTranslations } from 'next-intl';

import * as passwordService from '@/services/authentication/password.service';

interface UsePasswordOptions {
  onError?: (errorCode: string) => void;
}

/**
 * Password hook.
 *
 * Responsibilities:
 *   - Call the setPassword service.
 *   - Return structured results to the caller.
 *
 * It does NOT auto-login the user. After a password reset,
 * the page should redirect to /auth/login so the user
 * proves they know the new password.
 */
export function usePassword(options?: UsePasswordOptions) {
  const setPassword = async (verificationToken: string, password: string) => {
    try {
      await passwordService.setPassword(verificationToken, password);
      return { success: true as const };
    } catch (err) {
      const errorCode = err instanceof Error ? err.message : 'NETWORK_ERROR';
      options?.onError?.(errorCode);
      return { success: false as const, error: errorCode };
    }
  };

  return { setPassword };
}
