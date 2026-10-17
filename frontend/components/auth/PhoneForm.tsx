'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Phone, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
import { usePhone } from '@/hooks/authentication/usePhone';
import { Link } from '@/i18n/navigation';
import { OTPPurpose } from '@/types/auth';
import { toEnglishDigits } from '@/lib/numbers';

// ─── Validation Schema Factory ──────────────────────────────────
const createPhoneSchema = (t: (key: string) => string) =>
  z.object({
    phone: z.preprocess(
      (val) => (typeof val === 'string' ? toEnglishDigits(val) : val),
      z
        .string()
        .trim()
        .min(1, t('identifierRequired'))
        .regex(/^09\d{9}$/, t('identifierInvalid')),
    ),
  });

type PhoneFormValues = z.infer<ReturnType<typeof createPhoneSchema>>;

// ─── Props ──────────────────────────────────────────────────────
interface PhoneFormProps {
  /**
   * Purpose of the OTP request. Determines which flow
   * the user is entering (registration vs password reset).
   */
  purpose?: OTPPurpose;
  onSuccess?: (phone: string) => void | Promise<void>;
  onError?: (errorCode: string) => void;
}

// ─── Component ──────────────────────────────────────────────────
export function PhoneForm({
  purpose = 'registration',
  onSuccess,
  onError,
}: PhoneFormProps) {
  const [errorMessage, setErrorMessage] = useState('');
  const t = useTranslations('Auth.phone');

  const { requestOTP } = usePhone({
    onError: (code) => {
      setErrorMessage(code);
      onError?.(code);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PhoneFormValues>({
    resolver: zodResolver(createPhoneSchema(t)),
    defaultValues: {
      phone: '',
    },
  });

  const onSubmit = async (data: PhoneFormValues) => {
    setErrorMessage('');

    const result = await requestOTP(data.phone, 'phone', purpose);

    if (result.success) {
      if (onSuccess) await onSuccess(data.phone);
    } else {
      reset({ phone: '' });
    }
  };

  return (
    <Card className="w-full max-w-sm sm:max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg mb-4">
          <Phone className="w-7 h-7 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">{t('identifier')}</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                autoFocus
                placeholder={t('identifierPlaceholder')}
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
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
                {t('submitting')}
              </>
            ) : (
              <>
                <Send className="w-4 h-4 ml-2" />
                {t('submit')}
              </>
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            {t('alreadyRegistered')}{' '}
            <Link
              href={ROUTES.LOGIN}
              className="text-primary hover:text-primary/80 transition-colors hover:underline underline-offset-2"
            >
              {t('login')}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
