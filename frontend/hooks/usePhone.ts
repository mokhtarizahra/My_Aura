// frontend/hooks/usePhone.ts
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { ROUTES } from '@/constants/routes';

interface UsePhoneOptions {
  onSuccess?: (phone: string) => void | Promise<void>;
  onError?: (error: Error) => void;
}

export function usePhone(options?: UsePhoneOptions) {
  const router = useRouter();
  const { toast } = useToast();
  const { requestOTP } = useAuth();

  const handleRequestOTP = async (phone: string) => {
    try {
      await requestOTP(phone);

      toast({
        title: '✅ کد ارسال شد',
        description: 'کد تأیید به شماره موبایل شما ارسال شد.',
      });

      // Redirect to OTP page with phone parameter
      router.push(`${ROUTES.OTP}?phone=${encodeURIComponent(phone)}`);

      options?.onSuccess?.(phone);

      return { success: true, phone };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطا در ارسال کد تأیید';

      toast({
        title: '❌ خطا',
        description: errorMessage,
        variant: 'destructive',
      });

      options?.onError?.(error instanceof Error ? error : new Error(errorMessage));

      return { success: false, error: errorMessage };
    }
  };

  return {
    requestOTP: handleRequestOTP,
  };
}