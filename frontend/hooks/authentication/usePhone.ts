'use client';

import { useTranslations } from 'next-intl';

import * as otpService from '@/services/authentication/otp.service';
import { IdentifierType, OTPPurpose } from '@/types/auth';

import { useToast } from '../use-toast';

interface UsePhoneOptions {
  onError?: (errorCode: string) => void;
}

/**
 * Phone hook.
 *
 * Responsibilities:
 *   - Call the OTP request service.
 *   - Show toast notifications (translated).
 *   - Return structured results to the caller.
 *
 * It does NOT redirect. Redirection is the page's responsibility.
 */
export function usePhone(options?: UsePhoneOptions) {
  const { toast } = useToast();
  const t = useTranslations('Auth.phone');

  const requestOTP = async (
    identifier: string,
    identifierType: IdentifierType = 'phone',
    purpose: OTPPurpose = 'registration'
  ) => {
    try {
      await otpService.requestOTP(identifier, identifierType, purpose);

      toast({
        title: t('toast.successTitle'),
        description: t('toast.successDescription'),
      });

      return { success: true as const };
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
  };
}
