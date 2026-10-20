'use client';

import { useState } from 'react';

import * as sessionService from '@/services/authentication/session.service';
import { Session } from '@/types/auth';

interface UseSessionsOptions {
  onError?: (errorCode: string) => void;
}

interface FetchSessionsResult {
  success: boolean;
  sessions?: Session[];
  error?: string;
}

interface RevokeSessionResult {
  success: boolean;
  revoked?: boolean;
  error?: string;
}

/**
 * Sessions hook.
 *
 * Responsibilities:
 *   - Fetch active sessions
 *   - Revoke a specific session by ID
 *   - Revoke the current session
 *   - Revoke all sessions
 *
 * It does NOT redirect. Redirection is the page's responsibility.
 */
export function useSessions(options?: UseSessionsOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const fetchSessions = async (): Promise<FetchSessionsResult> => {
    setIsLoading(true);
    try {
      const response = await sessionService.getSessions();
      return { success: true, sessions: response.sessions };
    } catch (err) {
      const errorCode = err instanceof Error ? err.message : 'NETWORK_ERROR';
      options?.onError?.(errorCode);
      return { success: false, error: errorCode };
    } finally {
      setIsLoading(false);
    }
  };

  const revokeSessionById = async (
    sessionId: string
  ): Promise<RevokeSessionResult> => {
    setIsRevoking(true);
    try {
      const result = await sessionService.revokeSessionById(sessionId);
      return { success: true, revoked: result.revoked };
    } catch (err) {
      const errorCode = err instanceof Error ? err.message : 'NETWORK_ERROR';
      options?.onError?.(errorCode);
      return { success: false, error: errorCode };
    } finally {
      setIsRevoking(false);
    }
  };

  const revokeCurrentSession = async (): Promise<RevokeSessionResult> => {
    setIsRevoking(true);
    try {
      await sessionService.revokeSession();
      return { success: true, revoked: true };
    } catch (err) {
      const errorCode = err instanceof Error ? err.message : 'NETWORK_ERROR';
      options?.onError?.(errorCode);
      return { success: false, error: errorCode };
    } finally {
      setIsRevoking(false);
    }
  };

  const revokeAllSessions = async (): Promise<RevokeSessionResult> => {
    setIsRevoking(true);
    try {
      await sessionService.revokeAllSessions();
      return { success: true, revoked: true };
    } catch (err) {
      const errorCode = err instanceof Error ? err.message : 'NETWORK_ERROR';
      options?.onError?.(errorCode);
      return { success: false, error: errorCode };
    } finally {
      setIsRevoking(false);
    }
  };

  return {
    isLoading,
    isRevoking,
    fetchSessions,
    revokeSessionById,
    revokeCurrentSession,
    revokeAllSessions,
  };
}