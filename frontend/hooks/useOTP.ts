// frontend/hooks/useOTP.ts
'use client';

import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';
import { useAuth } from './useAuth';
import { ROUTES } from '@/constants/routes'; 

interface UseOTPOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  redirectPath?: string; 
}

export function useOTP(options?: UseOTPOptions) {
  const router = useRouter();
  const { toast } = useToast();
  const { verifyOTP, resendOTP } = useAuth();

  const handleVerifyOTP = async (phone: string, code: string) => {
    try {
      await verifyOTP(phone, code);

      toast({
        title: 'تأیید موفق',
        description: 'کد یکبارمصرف با موفقیت تأیید شد.',
      });

      // Redirect to the specified or default path
      const redirectTo = options?.redirectPath || ROUTES.SETTINGS_PASSWORD;
      router.push(redirectTo);

      options?.onSuccess?.();
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطا در تأیید کد';
      
      toast({
        title: 'خطا در تأیید',
        description: errorMessage,
        variant: 'destructive',
      });

      options?.onError?.(error instanceof Error ? error : new Error(errorMessage));
      
      return { success: false, error: errorMessage };
    }
  };

  const handleResendOTP = async (phone: string) => {
    try {
      await resendOTP(phone);
      
      toast({
        title: 'ارسال مجدد',
        description: 'کد جدید با موفقیت به شماره شما ارسال شد.',
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطا در ارسال مجدد کد';
      
      toast({
        title: 'خطا',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return { success: false, error: errorMessage };
    }
  };

  return {
    verifyOTP: handleVerifyOTP,
    resendOTP: handleResendOTP,
  };
}