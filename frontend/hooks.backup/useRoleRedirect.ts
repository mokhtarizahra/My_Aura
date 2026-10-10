'use client';

import { useRouter } from 'next/navigation';
import { ROLE_LABELS, ROLE_ROUTES } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';
import { useToast } from './use-toast';
import { UserRole } from '@/types/auth';

export function useRoleRedirect() {
  const router = useRouter();
  const { toast } = useToast();

  const redirectByRole = (role: UserRole, options?: { replace?: boolean }) => {
    try {
      if (!role || !ROLE_ROUTES[role]) {
        throw new Error(`نقش نامعتبر: ${role}`);
      }

      const redirectPath = ROLE_ROUTES[role];

      if (options?.replace) {
        router.replace(redirectPath);
      } else {
        router.push(redirectPath);
      }

      toast({
        title: 'خوش آمدید!',
        description: `شما به عنوان ${ROLE_LABELS[role]} وارد شدید.`,
      });

      return redirectPath;
    } catch (error) {
      console.error('خطا در مسیریابی:', error);

      toast({
        title: 'خطا',
        description: 'شما دسترسی لازم برای این صفحه را ندارید.',
        variant: 'destructive',
      });

      // Go to page 403
      router.replace(ROUTES.FORBIDDEN);
      return ROUTES.FORBIDDEN;
    }
  };

  return { redirectByRole };
}