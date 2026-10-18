'use client';

import { AlertCircle, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Session } from '@/types/auth';

import { SessionCard } from './SessionCard';

interface SessionListProps {
  sessions: Session[];
  isLoading: boolean;
  errorMessage: string;
  onRevoke: (sessionId: string) => Promise<void>;
}

export function SessionList({
  sessions,
  isLoading,
  errorMessage,
  onRevoke,
}: SessionListProps) {
  const t = useTranslations('Auth.sessions');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span>{t('loading')}</span>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <p className="text-sm">{errorMessage}</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">{t('empty')}</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {sessions.map((session) => (
        <SessionCard key={session._id} session={session} onRevoke={onRevoke} />
      ))}
    </div>
  );
}