'use client';

import {
  AlertCircle,
  Clock,
  Globe,
  Loader2,
  LogOut,
  Monitor,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
// shadcn components
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import type { Session } from '@/types/auth';

function parseUserAgent(userAgent: string): {
  device: string;
  browser: string;
} {
  const ua = userAgent.toLowerCase();

  let device = 'دسکتاپ';
  if (
    ua.includes('mobile') ||
    ua.includes('android') ||
    ua.includes('iphone')
  ) {
    device = 'موبایل';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    device = 'تبلت';
  }

  let browser = 'مرورگر ناشناخته';
  if (ua.includes('chrome') && !ua.includes('edg')) {
    browser = 'Chrome';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('edg')) {
    browser = 'Edge';
  }

  return { device, browser };
}

export default function SessionsPage() {
  const router = useRouter();
  const { getSessions, revokeSession } = useAuth();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await getSessions();
        setSessions(response.sessions);
      } catch (err: any) {
        setErrorMessage(err.message || 'خطا در دریافت لیست دستگاه‌ها');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [getSessions]);

  const handleRevoke = async (sessionId: string) => {
    setRevokingId(sessionId);
    setErrorMessage('');

    try {
      await revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در بستن نشست');
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen w-full flex items-start justify-center p-4 bg-background"
    >
      <Card className="w-full max-w-2xl mt-10">
        <CardHeader className="text-center border-b border-border pb-6">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">دستگاه‌های فعال</CardTitle>
          <CardDescription>
            لیست تمام دستگاه‌هایی که به حساب کاربری شما وارد شده‌اند.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span>در حال دریافت اطلاعات...</span>
            </div>
          )}

          {errorMessage && !isLoading && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive mb-4">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          {!isLoading && !errorMessage && sessions.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              هیچ دستگاه فعالی یافت نشد.
            </p>
          )}

          {!isLoading && !errorMessage && sessions.length > 0 && (
            <div className="flex flex-col gap-4">
              {sessions.map((session) => {
                const { device, browser } = parseUserAgent(
                  session.userAgent || ''
                );
                const isMobile = device === 'موبایل' || device === 'تبلت';

                return (
                  <div
                    key={session._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-background border border-border shrink-0">
                        {isMobile ? (
                          <Smartphone className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <Monitor className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {browser} - {device}
                          </span>
                          {session.isValid && (
                            <Badge
                              variant="outline"
                              className="text-xs text-green-600 border-green-600"
                            >
                              فعال
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground">
                          {session.ip && (
                            <div className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              <span>IP: {session.ip}</span>
                            </div>
                          )}
                          <span className="hidden sm:inline">•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(session.createdAt).toLocaleDateString(
                                'fa-IR'
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="sm:mr-auto mt-2 sm:mt-0">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevoke(session._id)}
                        disabled={revokingId === session._id}
                        className="gap-2"
                      >
                        {revokingId === session._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <LogOut className="w-4 h-4" />
                        )}
                        خروج از این دستگاه
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t border-border pt-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/dashboard')}
          >
            بازگشت به داشبورد
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
