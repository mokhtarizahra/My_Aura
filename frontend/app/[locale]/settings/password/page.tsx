'use client';

import { useRouter } from '@/i18n/navigation';

import { SettingsPasswordForm } from '@/components/settings/SettingsPasswordForm';
import { ROUTES } from '@/constants/routes';

export default function SettingsPasswordPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // Password changed → best practice: send user back to login
    // so they prove they know the new password.
    // Optionally, you could also revoke all other sessions server-side.
    router.replace(ROUTES.LOGIN);
  };

  const handleError = (errorCode: string) => {
    console.error('Change password error:', errorCode);
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <SettingsPasswordForm
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </main>
  );
}