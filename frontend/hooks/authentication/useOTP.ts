'use client';

import { useTranslations } from 'next-intl';

import * as otpService from '@/services/authentication/otp.service';
import { IdentifierType, OTPPurpose } from '@/types/auth';

import { useToast } from '../use-toast';

interface UseOTPOptions {
  onError?: (errorCode: string) => void;
}

/**
 * OTP hook.
 *
 * Responsibilities:
 *   - Call the OTP service.
 *   - Show toast notifications (translated).
 *   - Return structured results to the caller.
 *
 * It does NOT redirect. Redirection is the page's responsibility.
 */
export function useOTP(options?: UseOTPOptions) {
  const { toast } = useToast();
  const t = useTranslations('Auth.otp');

  /**
   * Request a new OTP.
   */
  const requestOTP = async (
    identifier: string,
    identifierType: IdentifierType,
    purpose: OTPPurpose = 'registration'
  ) => {
    try {
      await otpService.requestOTP(identifier, identifierType, purpose);
      return { success: true as const };
    } catch (err) {
      const errorCode = err instanceof Error ? err.message : 'NETWORK_ERROR';
      options?.onError?.(errorCode);
      return { success: false as const, error: errorCode };
    }
  };

  /**
   * Verify an OTP and return the verification token.
   */
  const verifyOTP = async (
    identifier: string,
    identifierType: IdentifierType,
    otp: string,
    purpose: OTPPurpose = 'registration'
  ) => {
    try {
      const result = await otpService.verifyOTP(
        identifier,
        identifierType,
        otp,
        purpose
      );

      toast({
        title: t('toast.successTitle'),
        description: t('toast.successDescription'),
      });

      return {
        success: true as const,
        verificationToken: result.verificationToken,
      };
    } catch (err) {
      const errorCode = err instanceof Error ? err.message : 'NETWORK_ERROR';

      toast({
        title: t('toast.errorTitle'),
        description: errorCode, // ← کد خطا، نه متن
        variant: 'destructive',
      });

      options?.onError?.(errorCode);
      return { success: false as const, error: errorCode };
    }
  };

  return {
    requestOTP,
    verifyOTP,
  };
}
