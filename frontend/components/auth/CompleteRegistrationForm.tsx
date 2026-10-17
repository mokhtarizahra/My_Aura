'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Lock, User } from 'lucide-react';
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
import { useRegistration } from '@/hooks/authentication/useRegistration';
import { Link } from '@/i18n/navigation';

// ─── Validation Schema Factory ──────────────────────────────────
const createCompleteRegistrationSchema = (t: (key: string) => string) =>
  z
    .object({
      firstName: z
        .string()
        .trim()
        .min(1, t('firstNameRequired'))
        .min(2, t('firstNameMin')),
      lastName: z
        .string()
        .trim()
        .min(1, t('lastNameRequired'))
        .min(2, t('lastNameMin')),
      password: z
        .string()
        .min(1, t('passwordRequired'))
        .min(8, t('passwordMin'))
        .regex(/[A-Za-z]/, t('passwordWeak'))
        .regex(/\d/, t('passwordWeak')),
      confirmPassword: z.string().min(1, t('confirmPasswordRequired')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      message: t('confirmPasswordMismatch'),
    });

type CompleteRegistrationValues = z.infer<
  ReturnType<typeof createCompleteRegistrationSchema>
>;

interface CompleteRegistrationFormProps {
  verificationToken: string;
  onSuccess?: () => void | Promise<void>;
  onError?: (errorCode: string) => void;
}

export function CompleteRegistrationForm({
  verificationToken,
  onSuccess,
  onError,
}: CompleteRegistrationFormProps) {
  const t = useTranslations('Auth.completeRegistration');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register: registerAccount } = useRegistration({
    onError: (code) => {
      setErrorMessage(code);
      onError?.(code);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompleteRegistrationValues>({
    resolver: zodResolver(createCompleteRegistrationSchema(t)),
    mode: 'onTouched',
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: CompleteRegistrationValues) => {
    setErrorMessage('');

    const result = await registerAccount(
      verificationToken,
      data.firstName,
      data.lastName,
      data.password
    );

    if (result.success && onSuccess) {
      await onSuccess();
    }
  };

  return (
    <Card className="w-full max-w-sm sm:max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg mb-4">
          <User className="w-7 h-7 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="flex flex-col gap-5">
          {/* First name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="firstName">{t('firstName')}</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="firstName"
                type="text"
                autoComplete="given-name"
                autoFocus
                placeholder={t('firstNamePlaceholder')}
                className="pl-10"
                aria-invalid={!!errors.firstName}
                disabled={isSubmitting}
                {...register('firstName')}
              />
            </div>
            {errors.firstName && (
              <p className="text-xs text-destructive" role="alert">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="lastName">{t('lastName')}</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="lastName"
                type="text"
                autoComplete="family-name"
                placeholder={t('lastNamePlaceholder')}
                className="pl-10"
                aria-invalid={!!errors.lastName}
                disabled={isSubmitting}
                {...register('lastName')}
              />
            </div>
            {errors.lastName && (
              <p className="text-xs text-destructive" role="alert">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">{t('password')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder={t('passwordPlaceholder')}
                className="pl-10 pr-10"
                aria-invalid={!!errors.password}
                disabled={isSubmitting}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={
                  showPassword ? t('hidePassword') : t('showPassword')
                }
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder={t('confirmPasswordPlaceholder')}
                className="pl-10 pr-10"
                aria-invalid={!!errors.confirmPassword}
                disabled={isSubmitting}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={
                  showConfirmPassword ? t('hidePassword') : t('showPassword')
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive" role="alert">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Error message */}
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
              t('submit')
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            {t('hasAccount')}{' '}
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
