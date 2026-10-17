'use client';

import { useTranslations } from 'next-intl';

import { useToast } from '../use-toast';
import { useAuth } from './useAuth';

interface UseRegistrationOptions {
  onError?: (errorCode: string) => void;
}

/**
 * Registration hook.
 *
 * Responsibilities:
 *   - Call the register action from AuthContext.
 *   - Show toast notifications (translated).
 *   - Return structured results to the caller.
 *
 * It does NOT redirect. Redirection is the page's responsibility.
 */
export function useRegistration(options?: UseRegistrationOptions) {
  const { toast } = useToast();
  const t = useTranslations('Auth.completeRegistration');
  const { register: registerAction } = useAuth();

  const register = async (
    verificationToken: string,
    firstName: string,
    lastName: string,
    password: string
  ) => {
    try {
      const result = await registerAction(
        verificationToken,
        firstName,
        lastName,
        password
      );

      if (!result.success) {
        const errorCode = result.code || 'REGISTRATION_FAILED';

        toast({
          title: t('errors.registrationFailed'),
          description: errorCode,
          variant: 'destructive',
        });

        options?.onError?.(errorCode);
        return { success: false as const, error: errorCode };
      }

      return {
        success: true as const,
        session: result.data.session,
        accessToken: result.data.accessToken,
      };
    } catch (err) {
      const errorCode = err instanceof Error ? err.message : 'NETWORK_ERROR';

      toast({
        title: t('errors.registrationFailed'),
        description: errorCode,
        variant: 'destructive',
      });

      options?.onError?.(errorCode);
      return { success: false as const, error: errorCode };
    }
  };

  return { register };
}
