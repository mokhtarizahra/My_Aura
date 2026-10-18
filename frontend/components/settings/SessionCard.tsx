'use client';

import { Globe, LogOut, Monitor, Smartphone, Clock } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Session } from '@/types/auth';

interface SessionCardProps {
  session: Session;
  onRevoke: (sessionId: string) => Promise<void>;
  disabled?: boolean;
}

/**
 * Detect device type from userAgent string.
 * Used to pick the right icon and translation key.
 */
function detectDevice(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  const ua = userAgent.toLowerCase();
  if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone'))
    return 'mobile';
  return 'desktop';
}

/**
 * Detect browser from userAgent string.
 * Order matters: Edge contains "chrome" too, so check edge first.
 */
function detectBrowser(
  userAgent: string
): 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown' {
  const ua = userAgent.toLowerCase();
  if (ua.includes('edg')) return 'edge';
  if (ua.includes('firefox')) return 'firefox';
  if (ua.includes('chrome')) return 'chrome';
  if (ua.includes('safari')) return 'safari';
  return 'unknown';
}

export function SessionCard({
  session,
  onRevoke,
  disabled = false,
}: SessionCardProps) {
  const t = useTranslations('Auth.sessions');
  const locale = useLocale();
  const [isRevoking, setIsRevoking] = useState(false);

  const device = detectDevice(session.userAgent || '');
  const browser = detectBrowser(session.userAgent || '');

  const createdAt = new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(session.createdAt));

  const DeviceIcon = device === 'desktop' ? Monitor : Smartphone;

  const handleRevoke = async () => {
    setIsRevoking(true);
    try {
      await onRevoke(session._id);
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors gap-4">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-background border border-border shrink-0">
          <DeviceIcon className="w-5 h-5 text-muted-foreground" />
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-semibold text-foreground">
            {t(`browser.${browser}`)} — {t(`device.${device}`)}
          </span>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground">
            {session.ip && (
              <div className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <span>{t('ip')}: {session.ip}</span>
              </div>
            )}
            {session.ip && <span className="hidden sm:inline">•</span>}
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>
                {t('createdAt')}: {createdAt}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Button
        variant="destructive"
        size="sm"
        onClick={handleRevoke}
        disabled={disabled || isRevoking}
        className="sm:mr-auto gap-2"
      >
        {isRevoking ? (
          <>
            <LogOut className="w-4 h-4 animate-pulse" />
            {t('revoking')}
          </>
        ) : (
          <>
            <LogOut className="w-4 h-4" />
            {t('revoke')}
          </>
        )}
      </Button>
    </div>
  );
}