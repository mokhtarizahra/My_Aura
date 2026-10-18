'use client';

import * as passwordService from '@/services/authentication/password.service';

interface UsePasswordOptions {
  onError?: (errorCode: string) => void;
}

/**
 * Password hook.
 *
 * Exposes two flows:
 *   - setPassword: reset flow (unauthenticated, with verification token)
 *   - changePassword: change flow (authenticated, with current password)
 *
 * Neither flow auto-logs-in the user.
 */
export function usePassword(options?: UsePasswordOptions) {
  const setPassword = async (
    verificationToken: string,
    password: string
  ) => {
    try {
      await passwordService.setPassword(verificationToken, password);
      return { success: true as const };
    } catch (err) {
      const errorCode = err instanceof Error ? err.message : 'NETWORK_ERROR';
      options?.onError?.(errorCode);
      return { success: false as const, error: errorCode };
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      await passwordService.changePassword(currentPassword, newPassword);
      return { success: true as const };
    } catch (err) {
      const errorCode = err instanceof Error ? err.message : 'NETWORK_ERROR';
      options?.onError?.(errorCode);
      return { success: false as const, error: errorCode };
    }
  };

  return { setPassword, changePassword };
}