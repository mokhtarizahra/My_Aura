'use client';

import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

import { CompleteRegistrationForm } from '@/components/auth/CompleteRegistrationForm';
import { ROUTES } from '@/constants/routes';
import { useRouter } from '@/i18n/navigation';

function CompleteRegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handleSuccess = () => {
    // After successful registration the user is auto-logged-in
    // (AuthContext already stores user + accessToken).
    router.replace(ROUTES.HOME);
  };

  const handleError = (errorCode: string) => {
    console.error('Registration error:', errorCode);
  };

  if (!token) return null;

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <CompleteRegistrationForm
        verificationToken={token}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </main>
  );
}

export default function CompleteRegistrationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <CompleteRegistrationContent />
    </Suspense>
  );
}
