'use client';

import { PhoneForm } from '@/components/auth/PhoneForm';
import { ROUTES } from '@/constants/routes';
import { useRouter } from '@/i18n/navigation';

/**
 * Registration entry point.
 *
 * Collects the user's phone number, then redirects to the OTP page.
 * The `purpose=registration` parameter tells the OTP page
 * to send the user to /auth/complete-registration after verification.
 */
export default function RegisterPage() {
  const router = useRouter();

  const handleSuccess = (phone: string) => {
    router.push(
      `${ROUTES.OTP}?phone=${encodeURIComponent(phone)}&purpose=registration`
    );
  };

  const handleError = (errorCode: string) => {
    console.error('Phone request error:', errorCode);
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <PhoneForm
        purpose="registration"
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </main>
  );
}
