'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Eye, EyeOff, Key, Loader2, Lock } from 'lucide-react';
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
import { usePassword } from '@/hooks/authentication/usePassword';
import { Link } from '@/i18n/navigation';

// ─── Validation Schema Factory ──────────────────────────────────
const createChangePasswordSchema = (t: (key: string) => string) =>
  z
    .object({
      currentPassword: z.string().min(1, t('currentPasswordRequired')),
      newPassword: z
        .string()
        .min(1, t('newPasswordRequired'))
        .min(8, t('newPasswordMin'))
        .regex(/[A-Za-z]/, t('newPasswordWeak'))
        .regex(/\d/, t('newPasswordWeak')),
      confirmPassword: z.string().min(1, t('confirmPasswordRequired')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      path: ['confirmPassword'],
      message: t('confirmPasswordMismatch'),
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      path: ['newPassword'],
      message: t('errors.passwordSameAsOld'),
    });

type ChangePasswordValues = z.infer<
  ReturnType<typeof createChangePasswordSchema>
>;

interface SettingsPasswordFormProps {
  onSuccess?: () => void | Promise<void>;
  onError?: (errorCode: string) => void;
}

export function SettingsPasswordForm({
  onSuccess,
  onError,
}: SettingsPasswordFormProps) {
  const t = useTranslations('Auth.changePassword');
  const [errorMessage, setErrorMessage] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { changePassword } = usePassword({
    onError: (code) => {
      const errorKeyMap: Record<string, string> = {
        INVALID_CURRENT_PASSWORD: 'errors.invalidCurrentPassword',
        PASSWORD_SAME_AS_OLD: 'errors.passwordSameAsOld',
        PASSWORD_TOO_SHORT: 'newPasswordMin',
        VALIDATION_FAILED: 'errors.validationFailed',
      };
      const translationKey = errorKeyMap[code];
      setErrorMessage(
        translationKey ? t(translationKey) : t('errors.changeFailed')
      );
      onError?.(code);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(createChangePasswordSchema(t)),
    mode: 'onTouched',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordValues) => {
    setErrorMessage('');
    const result = await changePassword(data.currentPassword, data.newPassword);
    if (result.success && onSuccess) {
      await onSuccess();
    }
  };

  return (
    <Card className="w-full max-w-sm sm:max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg mb-4">
          <Key className="w-7 h-7 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="flex flex-col gap-5">
          {/* Current password */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="currentPassword"
                type={showCurrent ? 'text' : 'password'}
                autoComplete="current-password"
                autoFocus
                placeholder={t('currentPasswordPlaceholder')}
                className="pl-10 pr-10"
                aria-invalid={!!errors.currentPassword}
                disabled={isSubmitting}
                {...register('currentPassword')}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showCurrent ? t('hidePassword') : t('showPassword')}
              >
                {showCurrent ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-destructive" role="alert">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New password */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="newPassword">{t('newPassword')}</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="newPassword"
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder={t('newPasswordPlaceholder')}
                className="pl-10 pr-10"
                aria-invalid={!!errors.newPassword}
                disabled={isSubmitting}
                {...register('newPassword')}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showNew ? t('hidePassword') : t('showPassword')}
              >
                {showNew ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-destructive" role="alert">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm new password */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
            <div className="relative">
              <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder={t('confirmPasswordPlaceholder')}
                className="pl-10 pr-10"
                aria-invalid={!!errors.confirmPassword}
                disabled={isSubmitting}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showConfirm ? t('hidePassword') : t('showPassword')}
              >
                {showConfirm ? (
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
            <Link
              href={ROUTES.DASHBOARD}
              className="text-primary hover:text-primary/80 transition-colors hover:underline underline-offset-2"
            >
              {t('backToDashboard')}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}