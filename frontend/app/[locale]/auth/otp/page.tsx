'use client';

import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

import { OTPForm } from '@/components/auth/OTPForm';
import { ROUTES } from '@/constants/routes';

function OTPPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone');

  useEffect(() => {
    if (!phone) {
      router.replace(ROUTES.PHONE);
    }
  }, [phone, router]);

  const handleOTPSuccess = () => {
    console.log('OTP verified successfully');
  };

  const handleOTPError = (error: Error) => {
    console.error('OTP verification error:', error);
  };

  if (!phone) {
    return null;
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50"
    >
      <OTPForm
        phone={phone}
        onSuccess={handleOTPSuccess}
        onError={handleOTPError}
      />
    </main>
  );
}

export default function OTPPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">در حال بارگذاری...</p>
          </div>
        </div>
      }
    >
      <OTPPageContent />
    </Suspense>
  );
}