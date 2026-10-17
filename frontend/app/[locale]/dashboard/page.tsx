'use client';

import { useTranslations } from 'next-intl';

import { useAuth } from '@/hooks/authentication/useAuth';

export default function DashboardPage() {
  const { session, isLoading } = useAuth();
  const t = useTranslations('Common');

  if (isLoading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center p-4">
        <p className="text-muted-foreground">{t('loading')}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Account Type: {session?.accountType ?? '—'}
        </p>
      </div>
    </main>
  );
}