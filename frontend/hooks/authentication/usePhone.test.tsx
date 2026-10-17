import { act, renderHook } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import faMessages from '@/messages/fa.json';
import * as otpService from '@/services/authentication/otp.service';

import { useToast } from '../use-toast';
import { usePhone } from './usePhone';

// ─── Mocks ──────────────────────────────────────────────────────
vi.mock('@/services/authentication/otp.service', () => ({
  requestOTP: vi.fn(),
}));

vi.mock('../use-toast', () => ({
  useToast: vi.fn(),
}));

const mockToast = vi.fn();

// ─── Wrapper ─────────────────────────────────────────────────────
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="fa" messages={faMessages}>
    {children}
  </NextIntlClientProvider>
);

// ─── Tests ──────────────────────────────────────────────────────
describe('usePhone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue({ toast: mockToast });
  });

  it('returns success and shows a toast when OTP service resolves', async () => {
    vi.mocked(otpService.requestOTP).mockResolvedValue({ success: true });

    const { result } = renderHook(() => usePhone(), { wrapper });

    let response: any;
    await act(async () => {
      response = await result.current.requestOTP(
        '09123456789',
        'phone',
        'registration'
      );
    });

    expect(response).toEqual({ success: true });
    expect(otpService.requestOTP).toHaveBeenCalledWith(
      '09123456789',
      'phone',
      'registration'
    );
    expect(mockToast).toHaveBeenCalledTimes(1);
  });

  it('applies default parameters when omitted', async () => {
    vi.mocked(otpService.requestOTP).mockResolvedValue({ success: true });

    const { result } = renderHook(() => usePhone(), { wrapper });

    await act(async () => {
      await result.current.requestOTP('09123456789');
    });

    expect(otpService.requestOTP).toHaveBeenCalledWith(
      '09123456789',
      'phone',
      'registration'
    );
  });

  it('returns error code, shows destructive toast, and calls onError on failure', async () => {
    vi.mocked(otpService.requestOTP).mockRejectedValue(
      new Error('OTP_RESEND_COOLDOWN')
    );
    const onError = vi.fn();

    const { result } = renderHook(() => usePhone({ onError }), { wrapper });

    let response: any;
    await act(async () => {
      response = await result.current.requestOTP('09123456789');
    });

    expect(response).toEqual({
      success: false,
      error: 'OTP_RESEND_COOLDOWN',
    });
    expect(onError).toHaveBeenCalledWith('OTP_RESEND_COOLDOWN');
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'destructive' })
    );
  });

  it('falls back to NETWORK_ERROR when the thrown value is not an Error', async () => {
    vi.mocked(otpService.requestOTP).mockRejectedValue('weird-error');
    const onError = vi.fn();

    const { result } = renderHook(() => usePhone({ onError }), { wrapper });

    let response: any;
    await act(async () => {
      response = await result.current.requestOTP('09123456789');
    });

    expect(response).toEqual({
      success: false,
      error: 'NETWORK_ERROR',
    });
    expect(onError).toHaveBeenCalledWith('NETWORK_ERROR');
  });
});
