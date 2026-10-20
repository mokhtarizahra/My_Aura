'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Lock, Phone } from 'lucide-react';
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
import { useAuth } from '@/hooks/authentication/useAuth';
import { Link } from '@/i18n/navigation';
import { toEnglishDigits } from '@/lib/numbers';
import { AccountType } from '@/types/auth';

// ─── Validation Schema Factory ──────────────────────────────────────────────
const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    phone: z.preprocess(
      (val) => (typeof val === 'string' ? toEnglishDigits(val) : val),
      z
        .string()
        .trim()
        .min(1, t('identifierRequired'))
        .refine((val) => /^(?:\+98|0)?9\d{9}$/.test(val), {
          message: t('identifierInvalid'),
        })
    ),
    password: z.string().min(1, t('passwordRequired')).min(6, t('passwordMin')),
  });

type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
// ─── Props ──────────────────────────────────────────────────────────────────
interface LoginFormProps {
  onSuccess?: (accountType: AccountType) => void | Promise<void>;
  onError?: (error: Error) => void;
}

// ─── Main Component ────────────────────────────────────────────────────────
export function LoginForm({ onSuccess, onError }: LoginFormProps) {
  const { loginWithPassword } = useAuth();
  const t = useTranslations('Auth.login');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(createLoginSchema(t)),
    mode: 'onTouched',
  });

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMessage('');
    setIsLoading(true);

    try {
      // Login with backend
      const response = await loginWithPassword(data.phone, data.password);

      if (!response.success) {
        throw new Error(response.code || 'LOGIN_FAILED');
      }
      const accountType = response.data.session.accountType;

      if (onSuccess) {
        await onSuccess(accountType);
      }
    } catch (err: any) {
      const errorCode = err.message || 'UNKNOWN_ERROR';

      // Map backend error codes to translation keys
      const errorKeyMap: Record<string, string> = {
        INVALID_CREDENTIALS: 'errors.invalidCredentials',
        ACCOUNT_NOT_ACTIVE: 'errors.accountNotActive',
        LOGIN_FAILED: 'errors.loginFailed',
        VALIDATION_FAILED: 'errors.validationFailed',
      };

      const translationKey = errorKeyMap[errorCode];
      setErrorMessage(translationKey ? t(translationKey) : t('errors.generic'));

      if (onError) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
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
          {/* Mobile number field */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">{t('identifier')}</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                type="text"
                placeholder={t('identifierPlaceholder')}
                className="pl-10"
                aria-invalid={!!errors.phone}
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">{t('password')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('passwordPlaceholder')}
                className="pl-10 pr-10"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="toggle-password" // For test
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
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive text-center">
                {errorMessage}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
                {t('submitting')}
              </>
            ) : (
              t('submit')
            )}
          </Button>

          {/* Add registration link */}
          <p className="text-sm text-muted-foreground">
            {t('noAccount')}{' '}
            <Link
              href={ROUTES.REGISTER}
              className="text-primary hover:underline"
            >
              {t('register')}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
