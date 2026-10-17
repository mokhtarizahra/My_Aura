'use client';

import { useTranslations } from 'next-intl';

import { ACCOUNT_TYPE_ROUTES } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';
import { useRouter } from '@/i18n/navigation';
import { AccountType } from '@/types/auth';

import { useToast } from './use-toast';

/**
 * Redirect the user to the correct landing page
 * based on their account type.
 */
export function useAccountTypeRedirect() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('Auth.redirect');

  const redirectByAccountType = (
    accountType: AccountType,
    options?: { replace?: boolean }
  ): string => {
    const redirectPath = ACCOUNT_TYPE_ROUTES[accountType];

    if (!redirectPath) {
      console.error('Invalid account type:', accountType);

      toast({
        title: t('errorTitle'),
        description: t('invalidAccountType'),
        variant: 'destructive',
      });

      router.replace(ROUTES.FORBIDDEN);
      return ROUTES.FORBIDDEN;
    }

    if (options?.replace) {
      router.replace(redirectPath);
    } else {
      router.push(redirectPath);
    }

    return redirectPath;
  };

  return { redirectByAccountType };
}