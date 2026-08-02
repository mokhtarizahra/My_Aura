// components/auth/PhoneForm.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Phone, Send } from 'lucide-react';
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
import { usePhone } from '@/hooks/usePhone';
import Link from 'next/link';

// ─── Validation Schema ──────────────────────────────────────────────────────
const phoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(1, 'شماره موبایل الزامی است')
    .regex(/^09\d{9}$/, 'شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد'),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;

// ─── Props ──────────────────────────────────────────────────────────────────
interface PhoneFormProps {
  onSuccess?: (phone: string) => void | Promise<void>;
  onError?: (error: Error) => void;
}

// ─── Main Component ────────────────────────────────────────────────────────
export function PhoneForm({ onSuccess, onError }: PhoneFormProps) {
  const [errorMessage, setErrorMessage] = useState('');

  // ✅ استفاده از usePhone هوک
  const { requestOTP } = usePhone({
    onSuccess,
    onError,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: '',
    },
  });

  // ─── Handle Submit ──────────────────────────────────────────────────────
  const onSubmit = async (data: PhoneFormValues) => {
    setErrorMessage('');

    const result = await requestOTP(data.phone);

    if (!result.success) {
      setErrorMessage(result.error || 'خطا در ارسال کد تأیید');
      // Reset phone field for retry
      reset({ phone: '' });
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <Card className="w-full max-w-sm sm:max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg mb-4">
          <Phone className="w-7 h-7 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">ورود به حساب کاربری</CardTitle>
        <CardDescription>
          شماره موبایل خود را وارد کنید تا کد تأیید برایتان ارسال شود
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="flex flex-col gap-5">
          {/* Phone Field */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">شماره موبایل</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                autoFocus
                placeholder="09123456789"
                className="pl-10 text-left"
                aria-invalid={!!errors.phone}
                disabled={isSubmitting}
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-xs text-destructive mt-1" role="alert">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              className="p-3 rounded-lg bg-destructive/10 border border-destructive/20"
              role="alert"
            >
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
                در حال ارسال...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 ml-2" />
                ارسال کد تأیید
              </>
            )}
          </Button>

          {/* Back to Login Link */}
          <p className="text-sm text-muted-foreground text-center">
            قبلاً ثبت‌نام کرده‌اید؟{' '}
            <Link
              href={ROUTES.LOGIN}
              className="text-primary hover:text-primary/80 transition-colors hover:underline underline-offset-2"
            >
              وارد شوید
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}