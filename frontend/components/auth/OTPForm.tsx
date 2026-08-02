'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/constants/routes';
import { useOTP } from '@/hooks/useOTP';
import { useRouter } from 'next/navigation';


// ─── Validation Schema ──────────────────────────────────────────────────────
const otpSchema = z.object({
  otp: z
    .string()
    .length(4, 'کد باید دقیقاً ۴ رقم باشد')
    .regex(/^\d{4}$/, 'کد باید فقط شامل اعداد باشد'),
});

type OTPFormValues = z.infer<typeof otpSchema>;

interface OTPFormProps {
  phone: string;
  onSuccess?: () => void | Promise<void>;
  onError?: (error: Error) => void;
}

export function OTPForm({ phone, onSuccess, onError }: OTPFormProps) {
  const [errorMessage, setErrorMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

// Using useOTP
  const { verifyOTP, resendOTP } = useOTP({
    onSuccess,
    onError,
    redirectPath: ROUTES.SETTINGS_PASSWORD,
  });

  const { register, handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  const onSubmit = async (data: OTPFormValues) => {
    setErrorMessage('');
    const result = await verifyOTP(phone, data.otp);
    
    if (!result.success) {
      setErrorMessage(result.error || 'خطا در تأیید کد');
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setErrorMessage('');
    
    const result = await resendOTP(phone);
    
    if (!result.success) {
      setErrorMessage(result.error || 'خطا در ارسال مجدد');
    }
    
    setIsResending(false);
  };

  return (
    <Card className="w-full max-w-sm sm:max-w-md">
      {/* ... JSX مانند قبل ... */}
      <CardHeader className="text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg mb-4">
          <ShieldCheck className="w-7 h-7 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">ورود با کد یکبارمصرف</CardTitle>
        <CardDescription>کد تأیید ۴ رقمی ارسال شده را وارد کنید</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="flex flex-col gap-5">
          {/* Phone Display */}
          <div className="p-3 rounded-lg bg-muted border border-border">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span className="text-muted-foreground">کد به این شماره ارسال شد:</span>
              <span className="font-bold text-foreground tracking-wider" dir="ltr">
                {phone}
              </span>
            </div>
          </div>

          {/* OTP Field */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="otp">کد تأیید</Label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="otp"
                type="tel"
                inputMode="numeric"
                autoFocus
                maxLength={4}
                placeholder="مثلاً 1234"
                className="pl-10 text-center text-lg tracking-[0.5em] font-bold"
                aria-invalid={!!errors.otp}
                disabled={isSubmitting || isResending}
                {...register('otp')}
              />
              {errors.otp && (
                <p className="text-xs text-destructive mt-1" role="alert">
                  {errors.otp.message}
                </p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20" role="alert">
              <p className="text-sm text-destructive text-center">
                {errorMessage}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || isResending}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
                در حال بررسی...
              </>
            ) : (
              'تأیید کد'
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-muted-foreground">کد را دریافت نکردید؟</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || isSubmitting}
              className="text-primary hover:text-primary/80 transition-colors hover:underline underline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-3 h-3 inline animate-spin ml-1" />
                  ارسال مجدد...
                </>
              ) : (
                'ارسال مجدد'
              )}
            </button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            قبلاً ثبت‌نام کرده‌اید؟{' '}
            <button
              type="button"
              onClick={() => {
                const router = useRouter();
                router.push(ROUTES.LOGIN);
              }}
              className="text-primary hover:text-primary/80 transition-colors hover:underline underline-offset-2"
            >
              وارد شوید
            </button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}