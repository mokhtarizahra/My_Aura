'use client';

import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

import { OTPForm } from '@/components/auth/OTPForm';
import { ROUTES } from '@/constants/routes';
import { useRouter } from '@/i18n/navigation';
import { OTPPurpose } from '@/types/auth';

function OTPPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone');
  const purposeParam = searchParams.get('purpose');
  const purpose: OTPPurpose =
    purposeParam === 'password_reset' ? 'password_reset' : 'registration';

  const handleSuccess = (verificationToken: string) => {
    if (purpose === 'password_reset') {
      router.push(
        `${ROUTES.RESET_PASSWORD}?token=${encodeURIComponent(verificationToken)}`
      );
    } else {
      router.push(
        `${ROUTES.COMPLETE_REGISTRATION}?token=${encodeURIComponent(verificationToken)}`
      );
    }
  };

  const handleError = (errorCode: string) => {
    console.error('OTP error:', errorCode);
  };

  if (!phone) return null;

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <OTPForm
        phone={phone}
        purpose={purpose}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </main>
  );
}

export default function OTPPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <OTPPageContent />
    </Suspense>
  );
}
