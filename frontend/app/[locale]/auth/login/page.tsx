'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import { useAccountTypeRedirect } from '@/hooks/useAccountTypeRedirect';
import { AccountType } from '@/types/auth';      

export default function LoginPage() {
  const { redirectByAccountType } = useAccountTypeRedirect();

  const handleLoginSuccess = (accountType: AccountType) => {
    redirectByAccountType(accountType, { replace: true });
  };

  const handleLoginError = (error: Error) => {
    console.error('Login error:', error);
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <LoginForm onSuccess={handleLoginSuccess} onError={handleLoginError} />
    </main>
  );
}