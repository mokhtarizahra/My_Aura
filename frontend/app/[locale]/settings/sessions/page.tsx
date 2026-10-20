'use client';

import { SessionsManager } from '@/components/settings/SessionsManager';

export default function SettingsSessionsPage() {
  return (
    <main className="min-h-screen w-full flex items-start justify-center p-4 bg-background">
      <div className="w-full max-w-2xl mt-10">
        <SessionsManager />
      </div>
    </main>
  );
}