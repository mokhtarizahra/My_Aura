'use client';

import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { useRouter } from '@/i18n/navigation';

import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { ROUTES } from '@/constants/routes';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handleSuccess = () => {
    // Password reset successful → go to login so the user
    // proves they know the new password.
    router.replace(ROUTES.LOGIN);
  };

  const handleError = (errorCode: string) => {
    console.error('Reset password error:', errorCode);
  };

  if (!token) return null;

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <ResetPasswordForm
        verificationToken={token}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}