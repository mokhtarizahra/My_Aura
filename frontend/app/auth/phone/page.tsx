'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Phone, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useState } from 'react';

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
  phone: z
    .string()
    .trim()
    .regex(/^09\d{9}$/, 'شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد'),
});

type FormData = z.infer<typeof schema>;

export default function PhonePage() {
  const router = useRouter();
  const { requestOTP } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      phone: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setErrorMessage('');

    try {
      await requestOTP(data.phone);
      router.push(`/auth/otp?phone=${encodeURIComponent(data.phone)}`);
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
            <Phone className="w-7 h-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">
            ورود به حساب کاربری
          </CardTitle>
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
                  {...register('phone')}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-destructive">
                  {errors.phone.message}
                </p>
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

          <CardFooter>
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
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
