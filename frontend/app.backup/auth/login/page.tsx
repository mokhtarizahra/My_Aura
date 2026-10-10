'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import { useRoleRedirect } from '@/hooks/useRoleRedirect';
import { UserRole } from '@/types/auth';

export default function LoginPage() {
  const { redirectByRole } = useRoleRedirect();

  // function that is called after a successful login.
  const handleLoginSuccess = (role: UserRole) => {
    // Role-based routing
    redirectByRole(role, { replace: true });
  };

  const handleLoginError = (error: Error) => {
    console.error('Login error:', error);
    // You can send the error to the monitoring service.
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50"
    >
      <LoginForm onSuccess={handleLoginSuccess} onError={handleLoginError} />
    </main>
  );
}
