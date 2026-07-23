'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Lock, Phone } from 'lucide-react';
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
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';

// ─── Validation Schema ──────────────────────────────────────────────────────
const loginSchema = z.object({
  phone: z
    .string()
    .min(1, 'شماره موبایل الزامی است')
    .refine((val) => /^(?:\+98|0)?9\d{9}$/.test(val), {
      message: 'شماره موبایل معتبر ایرانی وارد کنید',
    }),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Props ──────────────────────────────────────────────────────────────────
interface LoginFormProps {
  onSuccess?: (userRole: UserRole) => void | Promise<void>; // It also returns the user role
  onError?: (error: Error) => void;
}

// ─── Main Component ────────────────────────────────────────────────────────
export function LoginForm({ onSuccess, onError }: LoginFormProps) {
  const { loginWithPassword } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMessage('');
    setIsLoading(true);

    try {
      // Login with backend
      const response = await loginWithPassword(data.phone, data.password);

      if (!response.success) {
        throw new Error(response.message || 'خطا در ورود');
      }

      // Extracting the user role from the response
      const userRole = response.user.role;

      // If onSuccess exists, also send the user role.
      if (onSuccess) {
        await onSuccess(userRole);
      }
    } catch (err: any) {
      const errorText = err.message || 'خطایی رخ داده است. دوباره تلاش کنید.';

      // Handling specific errors
      if (errorText.includes('Invalid credentials')) {
        setErrorMessage('نام کاربری یا رمز عبور نادرست است.');
      } else if (errorText.includes('Account is not active')) {
        setErrorMessage('حساب کاربری شما هنوز فعال نشده است.');
      } else {
        setErrorMessage(errorText);
      }

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
        <CardTitle className="text-2xl font-bold">خوش آمدید</CardTitle>
        <CardDescription>برای ادامه، وارد حساب کاربری خود شوید</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="flex flex-col gap-5">
          {/* Mobile number field */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">شماره موبایل</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                type="text"
                placeholder="09123456789"
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
            <Label htmlFor="password">رمز عبور</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10 pr-10"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="toggle-password" // ✅ برای تست
                aria-label={
                  showPassword ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور'
                } // ✅ برای دسترسی‌پذیری
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
                در حال ورود…
              </>
            ) : (
              'ورود'
            )}
          </Button>

          {/* Add registration link */}
          <p className="text-sm text-muted-foreground">
            حساب کاربری ندارید؟{' '}
            <Link
              href={ROUTES.REGISTER}
              className="text-primary hover:underline"
            >
              ثبت‌نام کنید
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
