'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
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
import { useOTP } from '@/hooks/authentication/useOTP';
import { useRouter } from '@/i18n/navigation';
import { toEnglishDigits } from '@/lib/numbers';
import { OTPPurpose } from '@/types/auth';

// ─── Validation Schema Factory ──────────────────────────────────
const createOtpSchema = (t: (key: string) => string) =>
  z.object({
    otp: z.preprocess(
      (val) => (typeof val === 'string' ? toEnglishDigits(val) : val),
      z
        .string()
        .length(4, t('codeLength'))
        .regex(/^\d{4}$/, t('codeNumeric'))
    ),
  });
type OTPFormValues = z.infer<ReturnType<typeof createOtpSchema>>;

interface OTPFormProps {
  phone: string;
  purpose?: OTPPurpose;
  onSuccess?: (verificationToken: string) => void | Promise<void>;
  onError?: (errorCode: string) => void;
}

export function OTPForm({
  phone,
  purpose = 'registration',
  onSuccess,
  onError,
}: OTPFormProps) {
  const [errorMessage, setErrorMessage] = useState('');
  const t = useTranslations('Auth.otp');
  const router = useRouter();

  const { verifyOTP } = useOTP({
    onError: (code) => {
      const errorKeyMap: Record<string, string> = {
        VALIDATION_FAILED: 'errors.validationFailed',
      };
      const translationKey = errorKeyMap[code];
      setErrorMessage(translationKey ? t(translationKey) : code);
      onError?.(code);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OTPFormValues>({
    resolver: zodResolver(createOtpSchema(t)),
    defaultValues: { otp: '' },
  });

  const onSubmit = async (data: OTPFormValues) => {
    setErrorMessage('');

    const result = await verifyOTP(phone, 'phone', data.otp, purpose);

    if (result.success && onSuccess) {
      await onSuccess(result.verificationToken);
    }
  };

  return (
    <Card className="w-full max-w-sm sm:max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg mb-4">
          <ShieldCheck className="w-7 h-7 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="flex flex-col gap-5">
          <div className="p-3 rounded-lg bg-muted border border-border">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span className="text-muted-foreground">{t('codeSentTo')}</span>
              <span
                className="font-bold text-foreground tracking-wider"
                dir="ltr"
              >
                {phone}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="otp">{t('code')}</Label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="otp"
                type="tel"
                inputMode="numeric"
                autoFocus
                maxLength={4}
                placeholder={t('codePlaceholder')}
                className="pl-10 text-center text-lg tracking-[0.5em] font-bold"
                aria-invalid={!!errors.otp}
                disabled={isSubmitting}
                {...register('otp')}
              />
              {errors.otp && (
                <p className="text-xs text-destructive mt-1" role="alert">
                  {errors.otp.message}
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
                {t('verifying')}
              </>
            ) : (
              t('verify')
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            {t('alreadyRegistered')}{' '}
            <button
              type="button"
              onClick={() => router.push(ROUTES.LOGIN)}
              className="text-primary hover:text-primary/80 transition-colors hover:underline underline-offset-2"
            >
              {t('login')}
            </button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
