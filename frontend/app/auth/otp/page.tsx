'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Suspense, useEffect, useState } from 'react';

// shadcn components
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
import { useAuth } from '@/hooks/useAuth';

const schema = z.object({
  otp: z
    .string()
    .regex(/^\d{4}$/, 'کد باید دقیقاً ۴ رقم و فقط شامل اعداد باشد'),
});

type FormData = z.infer<typeof schema>;

// ─── کامپوننت داخلی که useSearchParams توش هست ───
function OTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOTP } = useAuth();
  const phone = searchParams.get('phone');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!phone) {
      router.replace('/auth/phone');
    }
  }, [phone, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!phone) return;

    setErrorMessage('');

    try {
      await verifyOTP(phone, data.otp);
      router.push('/settings/password');
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'خطای غیرمنتظره‌ای رخ داد'
      );
    }
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen w-full flex items-center justify-center p-4 bg-background"
    >
      <Card className="w-full max-w-sm sm:max-w-md">
        {/* Header */}
        <CardHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg mb-4">
            <ShieldCheck className="w-7 h-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">
            ورود با کد یکبارمصرف
          </CardTitle>
          <CardDescription>
            کد تأیید ۴ رقمی ارسال شده را وارد کنید
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="flex flex-col gap-5">
            {/* Phone Display */}
            {phone && (
              <div className="p-3 rounded-lg bg-muted border border-border">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">
                    کد به این شماره ارسال شد:
                  </span>
                  <span
                    className="font-bold text-foreground tracking-wider"
                    dir="ltr"
                  >
                    {phone}
                  </span>
                </div>
              </div>
            )}

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
                  {...register('otp')}
                />
              </div>
              {errors.otp && (
                <p className="text-xs text-destructive">{errors.otp.message}</p>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive text-center">
                  {errorMessage}
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  در حال بررسی...
                </>
              ) : (
                'تأیید کد'
              )}
            </Button>

            {/* Resend hint */}
            <p className="text-xs text-muted-foreground text-center">
              کد را دریافت نکردید؟{' '}
              <button
                type="button"
                onClick={() => router.push(`/auth/phone?resend=true`)}
                className="text-primary hover:text-primary/80 transition-colors hover:underline underline-offset-2"
              >
                ارسال مجدد
              </button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}

// ─── Page Export با Suspense ───
export default function OTPPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-background">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">در حال بارگذاری...</p>
          </div>
        </div>
      }
    >
      <OTPForm />
    </Suspense>
  );
}
