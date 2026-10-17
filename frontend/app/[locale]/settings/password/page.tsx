'use client';

import { useEffect } from 'react';

import { ROUTES } from '@/constants/routes';
import { useRouter } from '@/i18n/navigation';

/**
 * ─────────────────────────────────────────────────────────────────
 * TODO: Settings > Change Password (logged-in users)
 * ─────────────────────────────────────────────────────────────────
 *
 * This page is INTENTIONALLY a placeholder.
 *
 * Purpose (future implementation):
 *   Allow an authenticated user to change their own password
 *   by providing:
 *     - current password (for verification)
 *     - new password
 *     - confirm new password
 *
 * This is DIFFERENT from /auth/reset-password, which handles the
 * "forgot password" flow (no login required, uses a verification
 * token issued after OTP).
 *
 * Backend requirement (not yet implemented):
 *   POST /api/auth/password/change
 *   Body: { currentPassword, newPassword }
 *   Auth: Bearer access token
 *
 * Until then, we redirect to login to avoid a broken page.
 * ─────────────────────────────────────────────────────────────────
 */
export default function SettingsPasswordPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.LOGIN);
  }, [router]);

  return null;
}
