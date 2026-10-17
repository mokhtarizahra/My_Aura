'use client';

import { useEffect } from 'react';

import { ROUTES } from '@/constants/routes';
import { useRouter } from '@/i18n/navigation';

/**
 * ─────────────────────────────────────────────────────────────────
 * TODO: Settings > Active Sessions (logged-in users)
 * ─────────────────────────────────────────────────────────────────
 *
 * Purpose (future implementation):
 *   Show all devices/sessions where the user is currently logged in,
 *   and allow them to:
 *     - revoke the current session
 *     - revoke all other sessions
 *
 * Backend status:
 *   ✅ GET    /api/auth/sessions          (list sessions)
 *   ✅ DELETE /api/auth/sessions/current  (revoke current)
 *   ✅ DELETE /api/auth/sessions          (revoke all)
 *   ❌ DELETE /api/auth/sessions/:id      (NOT implemented)
 *
 * Because the current UI revokes a specific session by id, it must
 * be redesigned to use the endpoints above (revoke current / all).
 *
 * Pending work:
 *   - Extract a SessionsList component
 *   - Add i18n keys under Auth.sessions.*
 *   - Update UI to match available backend endpoints
 *
 * Until then, redirect to login to avoid a broken page.
 * ─────────────────────────────────────────────────────────────────
 */
export default function SettingsSessionsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.LOGIN);
  }, [router]);

  return null;
}