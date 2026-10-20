'use client';

import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';
import { useSessions } from '@/hooks/authentication/useSessions';
import { Link, useRouter } from '@/i18n/navigation';
import { Session } from '@/types/auth';

import { SessionList } from './SessionList';

export function SessionsManager() {
  const t = useTranslations('Auth.sessions');
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const [showRevokeAllConfirm, setShowRevokeAllConfirm] = useState(false);

  const { isLoading, fetchSessions, revokeSessionById, revokeAllSessions } =
    useSessions({
      onError: (code) => {
        const errorKeyMap: Record<string, string> = {
          SESSIONS_FETCH_FAILED: 'errors.fetchFailed',
          SESSION_REVOKE_FAILED: 'errors.revokeFailed',
          SESSION_NOT_FOUND: 'errors.sessionNotFound',
        };
        const translationKey = errorKeyMap[code];
        setErrorMessage(
          translationKey ? t(translationKey) : t('errors.fetchFailed')
        );
      },
    });

  const loadSessions = useCallback(async () => {
    setErrorMessage('');
    const result = await fetchSessions();
    if (result.success && result.sessions) {
      setSessions(result.sessions);
    }
  }, [fetchSessions]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleRevoke = async (sessionId: string) => {
    setErrorMessage('');
    const result = await revokeSessionById(sessionId);
    if (result.success) {
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
    }
  };

  const handleRevokeAll = async () => {
    setErrorMessage('');
    setIsRevokingAll(true);
    try {
      const result = await revokeAllSessions();
      if (result.success) {
        router.replace(ROUTES.LOGIN);
      }
    } finally {
      setIsRevokingAll(false);
      setShowRevokeAllConfirm(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center border-b border-border pb-6">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <ShieldCheck className="w-7 h-7 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <SessionList
          sessions={sessions}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onRevoke={handleRevoke}
        />
      </CardContent>

      <CardFooter className="border-t border-border pt-6 flex flex-col gap-4">
        {!isLoading && sessions.length > 0 && (
          <div className="w-full">
            {showRevokeAllConfirm ? (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {t('revokeAll')}؟
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleRevokeAll}
                    disabled={isRevokingAll}
                    className="flex-1"
                  >
                    {isRevokingAll ? t('revokingAll') : t('revokeAll')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowRevokeAllConfirm(false)}
                    disabled={isRevokingAll}
                    className="flex-1"
                  >
                    {t('backToDashboard')}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="destructive"
                onClick={() => setShowRevokeAllConfirm(true)}
                className="w-full"
              >
                {t('revokeAll')}
              </Button>
            )}
          </div>
        )}

        <Link
          href={ROUTES.DASHBOARD}
          className="w-full text-sm text-muted-foreground text-center hover:text-foreground transition-colors py-2"
        >
          {t('backToDashboard')}
        </Link>
      </CardFooter>
    </Card>
  );
}