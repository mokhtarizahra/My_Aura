'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface UseSetPasswordOptions {
  onSuccess?: () => void | Promise<void>;
  onError?: (error: Error) => void;
  redirectPath?: string;
}

export function useSetPassword(options?: UseSetPasswordOptions) {
  const router = useRouter();
  const { toast } = useToast();
  const { setPassword } = useAuth();

  const handleSetPassword = async (password: string) => {
    try {
      await setPassword(password);

      toast({
        title: 'ثبت‌نام با موفقیت انجام شد',
        description: 'حساب کاربری شما ایجاد شد.',
      });

      const redirectTo = options?.redirectPath ?? ROUTES.HOME;

      router.replace(redirectTo);

      await options?.onSuccess?.();

      return {
        success: true,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'خطا در تنظیم رمز عبور';

      toast({
        title: 'خطا',
        description: errorMessage,
        variant: 'destructive',
      });

      options?.onError?.(
        error instanceof Error ? error : new Error(errorMessage)
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  return {
    setPassword: handleSetPassword,
  };
}