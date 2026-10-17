import { act, renderHook } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import faMessages from '@/messages/fa.json';
import * as passwordService from '@/services/authentication/password.service';

import { usePassword } from './usePassword';

// ─── Mocks ──────────────────────────────────────────────────────
vi.mock('@/services/authentication/password.service', () => ({
  setPassword: vi.fn(),
}));

// ─── Wrapper ─────────────────────────────────────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="fa" messages={faMessages}>
    {children}
  </NextIntlClientProvider>
);

// ─── Tests ──────────────────────────────────────────────────────
describe('usePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns success when the password service resolves', async () => {
    vi.mocked(passwordService.setPassword).mockResolvedValue({
      success: true,
      data: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        session: {} as any,
      },
    });

    const { result } = renderHook(() => usePassword(), { wrapper });

    let response: any;
    await act(async () => {
      response = await result.current.setPassword(
        'verification-token',
        'StrongPass123!'
      );
    });

    expect(response).toEqual({ success: true });
    expect(passwordService.setPassword).toHaveBeenCalledWith(
      'verification-token',
      'StrongPass123!'
    );
  });

  it('returns error code and calls onError when service rejects', async () => {
    vi.mocked(passwordService.setPassword).mockRejectedValue(
      new Error('PASSWORD_SAME_AS_OLD')
    );
    const onError = vi.fn();

    const { result } = renderHook(() => usePassword({ onError }), { wrapper });

    let response: any;
    await act(async () => {
      response = await result.current.setPassword(
        'verification-token',
        'OldPassword123!'
      );
    });

    expect(response).toEqual({
      success: false,
      error: 'PASSWORD_SAME_AS_OLD',
    });
    expect(onError).toHaveBeenCalledWith('PASSWORD_SAME_AS_OLD');
  });

  it('falls back to NETWORK_ERROR when the thrown value is not an Error', async () => {
    vi.mocked(passwordService.setPassword).mockRejectedValue('weird');
    const onError = vi.fn();

    const { result } = renderHook(() => usePassword({ onError }), { wrapper });

    let response: any;
    await act(async () => {
      response = await result.current.setPassword(
        'verification-token',
        'StrongPass123!'
      );
    });

    expect(response).toEqual({
      success: false,
      error: 'NETWORK_ERROR',
    });
    expect(onError).toHaveBeenCalledWith('NETWORK_ERROR');
  });

  it('does not throw when onError is not provided', async () => {
    vi.mocked(passwordService.setPassword).mockRejectedValue(
      new Error('PASSWORD_TOO_SHORT')
    );

    const { result } = renderHook(() => usePassword(), { wrapper });

    let response: any;
    await act(async () => {
      response = await result.current.setPassword(
        'verification-token',
        '123'
      );
    });

    expect(response).toEqual({
      success: false,
      error: 'PASSWORD_TOO_SHORT',
    });
  });
});