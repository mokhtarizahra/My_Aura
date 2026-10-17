import { act, renderHook } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import faMessages from '@/messages/fa.json';

import { useToast } from '../use-toast';
import { useAuth } from './useAuth';
import { useRegistration } from './useRegistration';

// ─── Mocks ──────────────────────────────────────────────────────
vi.mock('./useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../use-toast', () => ({
  useToast: vi.fn(),
}));

const mockRegister = vi.fn();
const mockToast = vi.fn();

// ─── Wrapper ─────────────────────────────────────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="fa" messages={faMessages}>
    {children}
  </NextIntlClientProvider>
);

// ─── Helpers ────────────────────────────────────────────────────
const buildAuthSuccess = (
  accountType: 'personal' | 'organization' | 'staff' = 'personal'
) => ({
  success: true as const,
  data: {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    session: {
      _id: 'session-id',
      accountId: 'account-id',
      accountType,
      expiresAt: '2026-12-31T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  },
});

// ─── Tests ──────────────────────────────────────────────────────
describe('useRegistration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue({ toast: mockToast });
    (useAuth as any).mockReturnValue({ register: mockRegister });
  });

  it('returns success with session and accessToken when auth resolves', async () => {
    mockRegister.mockResolvedValue(buildAuthSuccess('personal'));

    const { result } = renderHook(() => useRegistration(), { wrapper });

    let response: any;
    await act(async () => {
      response = await result.current.register(
        'verification-token',
        'علی',
        'رضایی',
        'StrongPass123!'
      );
    });

    expect(mockRegister).toHaveBeenCalledWith(
      'verification-token',
      'علی',
      'رضایی',
      'StrongPass123!'
    );
    expect(response.success).toBe(true);
    expect(response.accessToken).toBe('mock-access-token');
    expect(response.session.accountType).toBe('personal');
  });

  it('returns error code, shows destructive toast, and calls onError when auth rejects with Error', async () => {
    mockRegister.mockRejectedValue(new Error('ACCOUNT_ALREADY_EXISTS'));
    const onError = vi.fn();

    const { result } = renderHook(() => useRegistration({ onError }), {
      wrapper,
    });

    let response: any;
    await act(async () => {
      response = await result.current.register(
        'verification-token',
        'علی',
        'رضایی',
        'StrongPass123!'
      );
    });

    expect(response).toEqual({
      success: false,
      error: 'ACCOUNT_ALREADY_EXISTS',
    });
    expect(onError).toHaveBeenCalledWith('ACCOUNT_ALREADY_EXISTS');
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'destructive' })
    );
  });

  it('handles auth returning success: false (should not happen, but defensive)', async () => {
    mockRegister.mockResolvedValue({
      success: false,
      code: 'REGISTRATION_FAILED',
      message: 'Registration failed',
    });
    const onError = vi.fn();

    const { result } = renderHook(() => useRegistration({ onError }), {
      wrapper,
    });

    let response: any;
    await act(async () => {
      response = await result.current.register(
        'verification-token',
        'علی',
        'رضایی',
        'StrongPass123!'
      );
    });

    expect(response).toEqual({
      success: false,
      error: 'REGISTRATION_FAILED',
    });
    expect(onError).toHaveBeenCalledWith('REGISTRATION_FAILED');
  });

  it('falls back to NETWORK_ERROR when the thrown value is not an Error', async () => {
    mockRegister.mockRejectedValue('weird');
    const onError = vi.fn();

    const { result } = renderHook(() => useRegistration({ onError }), {
      wrapper,
    });

    let response: any;
    await act(async () => {
      response = await result.current.register(
        'verification-token',
        'علی',
        'رضایی',
        'StrongPass123!'
      );
    });

    expect(response).toEqual({
      success: false,
      error: 'NETWORK_ERROR',
    });
    expect(onError).toHaveBeenCalledWith('NETWORK_ERROR');
  });
});
