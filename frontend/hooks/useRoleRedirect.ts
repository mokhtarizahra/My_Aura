'use client';

import { useRouter } from 'next/navigation';

import { ROLE_LABELS, ROLE_ROUTES } from '@/constants/roles';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types/auth';

export function useRoleRedirect() {
  const router = useRouter();
  const { toast } = useToast();

  const redirectByRole = (role: UserRole, options?: { replace?: boolean }) => {
    try {
      // Role validation
      if (!role || !ROLE_ROUTES[role]) {
        throw new Error(`نقش نامعتبر: ${role}`);
      }

      const redirectPath = ROLE_ROUTES[role];

      // Redirect
      if (options?.replace) {
        router.replace(redirectPath);
      } else {
        router.push(redirectPath);
      }

      // Success Message
      toast({
        title: 'خوش آمدید!',
        description: `شما به عنوان ${ROLE_LABELS[role]} وارد شدید.`,
      });

      return redirectPath;
    } catch (error) {
      // Error handling
      console.error('خطا در مسیریابی:', error);

      toast({
        title: 'خطا',
        description: 'مشکلی در مسیریابی وجود دارد. به صفحه اصلی هدایت می‌شوید.',
        variant: 'destructive',
      });

      // Fallback: Go to the home page
      router.replace('/');
      return '/';
    }
  };

  return { redirectByRole };
}
