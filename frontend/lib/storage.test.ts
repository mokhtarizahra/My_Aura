import { beforeEach, describe, expect, it } from 'vitest';

import type { Session } from '@/types/auth';

import { storage } from './storage';

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

describe('storage utility', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('getSession', () => {
    it('should return null when no session is stored', () => {
      const result = storage.getSession();
      expect(result).toBeNull();
    });

    it('should return session when stored', () => {
      sessionStorage.setItem('session', JSON.stringify(mockSession));

      const result = storage.getSession();

      expect(result).toEqual(mockSession);
    });

    it('should return null when stored data is invalid JSON', () => {
      sessionStorage.setItem('session', 'invalid-json{{{');

      const result = storage.getSession();

      expect(result).toBeNull();
    });
  });

  describe('setSession', () => {
    it('should store session in sessionStorage', () => {
      storage.setSession(mockSession);

      const stored = sessionStorage.getItem('session');
      expect(JSON.parse(stored!)).toEqual(mockSession);
    });
  });

  describe('getAccountType', () => {
    it('should return accountType from stored session', () => {
      storage.setSession(mockSession);

      const result = storage.getAccountType();

      expect(result).toBe('personal');
    });

    it('should return null when no session is stored', () => {
      const result = storage.getAccountType();

      expect(result).toBeNull();
    });
  });

  describe('clear', () => {
    it('should remove all auth data from storage', () => {
      storage.setSession(mockSession);
      storage.setAccessToken('token123');

      storage.clear();

      expect(sessionStorage.getItem('session')).toBeNull();
      expect(sessionStorage.getItem('accessToken')).toBeNull();
    });
  });
});
