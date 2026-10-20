import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as sessionService from '@/services/authentication/session.service';
import { Session } from '@/types/auth';

import { useSessions } from './useSessions';

// ─── Mocks ──────────────────────────────────────────────────────
vi.mock('@/services/authentication/session.service', () => ({
  getSessions: vi.fn(),
  revokeSession: vi.fn(),
  revokeAllSessions: vi.fn(),
  revokeSessionById: vi.fn(),
}));

// ─── Fixtures ───────────────────────────────────────────────────
const mockSession: Session = {
  _id: 'session-1',
  accountId: 'account-1',
  accountType: 'personal',
  userAgent: 'Mozilla/5.0',
  ip: '127.0.0.1',
  expiresAt: '2026-12-31T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

// ─── Tests ──────────────────────────────────────────────────────
describe('useSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchSessions', () => {
    it('returns sessions on success', async () => {
      vi.mocked(sessionService.getSessions).mockResolvedValue({
        sessions: [mockSession],
      });

      const { result } = renderHook(() => useSessions());

      let response: any;
      await act(async () => {
        response = await result.current.fetchSessions();
      });

      expect(response).toEqual({
        success: true,
        sessions: [mockSession],
      });
      expect(result.current.isLoading).toBe(false);
    });

    it('returns error code and calls onError on failure', async () => {
      vi.mocked(sessionService.getSessions).mockRejectedValue(
        new Error('SESSIONS_FETCH_FAILED')
      );
      const onError = vi.fn();

      const { result } = renderHook(() => useSessions({ onError }));

      let response: any;
      await act(async () => {
        response = await result.current.fetchSessions();
      });

      expect(response).toEqual({
        success: false,
        error: 'SESSIONS_FETCH_FAILED',
      });
      expect(onError).toHaveBeenCalledWith('SESSIONS_FETCH_FAILED');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('revokeSessionById', () => {
    it('returns revoked: true on success', async () => {
      vi.mocked(sessionService.revokeSessionById).mockResolvedValue({
        revoked: true,
      });

      const { result } = renderHook(() => useSessions());

      let response: any;
      await act(async () => {
        response = await result.current.revokeSessionById('session-1');
      });

      expect(response).toEqual({ success: true, revoked: true });
      expect(sessionService.revokeSessionById).toHaveBeenCalledWith('session-1');
      expect(result.current.isRevoking).toBe(false);
    });

    it('returns revoked: false when already revoked', async () => {
      vi.mocked(sessionService.revokeSessionById).mockResolvedValue({
        revoked: false,
      });

      const { result } = renderHook(() => useSessions());

      let response: any;
      await act(async () => {
        response = await result.current.revokeSessionById('session-1');
      });

      expect(response).toEqual({ success: true, revoked: false });
    });

    it('returns error code and calls onError on failure', async () => {
      vi.mocked(sessionService.revokeSessionById).mockRejectedValue(
        new Error('SESSION_NOT_FOUND')
      );
      const onError = vi.fn();

      const { result } = renderHook(() => useSessions({ onError }));

      let response: any;
      await act(async () => {
        response = await result.current.revokeSessionById('bad-id');
      });

      expect(response).toEqual({
        success: false,
        error: 'SESSION_NOT_FOUND',
      });
      expect(onError).toHaveBeenCalledWith('SESSION_NOT_FOUND');
      expect(result.current.isRevoking).toBe(false);
    });
  });

  describe('revokeCurrentSession', () => {
    it('returns success on success', async () => {
      vi.mocked(sessionService.revokeSession).mockResolvedValue({
        success: true,
        message: 'Revoked',
      });

      const { result } = renderHook(() => useSessions());

      let response: any;
      await act(async () => {
        response = await result.current.revokeCurrentSession();
      });

      expect(response).toEqual({ success: true, revoked: true });
    });

    it('returns error code and calls onError on failure', async () => {
      vi.mocked(sessionService.revokeSession).mockRejectedValue(
        new Error('REFRESH_TOKEN_REQUIRED')
      );
      const onError = vi.fn();

      const { result } = renderHook(() => useSessions({ onError }));

      let response: any;
      await act(async () => {
        response = await result.current.revokeCurrentSession();
      });

      expect(response).toEqual({
        success: false,
        error: 'REFRESH_TOKEN_REQUIRED',
      });
      expect(onError).toHaveBeenCalledWith('REFRESH_TOKEN_REQUIRED');
    });
  });

  describe('revokeAllSessions', () => {
    it('returns success on success', async () => {
      vi.mocked(sessionService.revokeAllSessions).mockResolvedValue({
        success: true,
        message: 'All revoked',
      });

      const { result } = renderHook(() => useSessions());

      let response: any;
      await act(async () => {
        response = await result.current.revokeAllSessions();
      });

      expect(response).toEqual({ success: true, revoked: true });
    });

    it('returns error code and calls onError on failure', async () => {
      vi.mocked(sessionService.revokeAllSessions).mockRejectedValue(
        new Error('AUTHENTICATION_REQUIRED')
      );
      const onError = vi.fn();

      const { result } = renderHook(() => useSessions({ onError }));

      let response: any;
      await act(async () => {
        response = await result.current.revokeAllSessions();
      });

      expect(response).toEqual({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
      });
      expect(onError).toHaveBeenCalledWith('AUTHENTICATION_REQUIRED');
    });
  });
});