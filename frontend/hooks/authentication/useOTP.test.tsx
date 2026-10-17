import { act, renderHook, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import faMessages from '@/messages/fa.json';
import * as otpService from '@/services/authentication/otp.service';

import { useToast } from '../use-toast';
import { useOTP } from './useOTP';

// ─── Mocks ──────────────────────────────────────────────────────
vi.mock('@/services/authentication/otp.service', () => ({
  requestOTP: vi.fn(),
  verifyOTP: vi.fn(),
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
describe('useOTP', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue({ toast: mockToast });
  });

  describe('requestOTP', () => {
    it('returns success when OTP service resolves', async () => {
      vi.mocked(otpService.requestOTP).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useOTP(), { wrapper });

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
    });

    it('returns error code and calls onError when service rejects', async () => {
      vi.mocked(otpService.requestOTP).mockRejectedValue(
        new Error('OTP_RESEND_COOLDOWN')
      );
      const onError = vi.fn();

      const { result } = renderHook(() => useOTP({ onError }), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.requestOTP('09123456789', 'phone');
      });

      expect(response).toEqual({
        success: false,
        error: 'OTP_RESEND_COOLDOWN',
      });
      expect(onError).toHaveBeenCalledWith('OTP_RESEND_COOLDOWN');
    });
  });

  describe('verifyOTP', () => {
    it('returns verificationToken and shows success toast on success', async () => {
      vi.mocked(otpService.verifyOTP).mockResolvedValue({
        success: true,
        verificationToken: 'verification-token-abc',
        identifier: '09123456789',
        identifierType: 'phone',
        purpose: 'registration',
      });

      const { result } = renderHook(() => useOTP(), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.verifyOTP(
          '09123456789',
          'phone',
          '1234',
          'registration'
        );
      });

      expect(response).toEqual({
        success: true,
        verificationToken: 'verification-token-abc',
      });
      expect(otpService.verifyOTP).toHaveBeenCalledWith(
        '09123456789',
        'phone',
        '1234',
        'registration'
      );
      expect(mockToast).toHaveBeenCalledTimes(1);
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'تأیید موفق' })
      );
    });

    it('returns error code, shows destructive toast and calls onError on failure', async () => {
      vi.mocked(otpService.verifyOTP).mockRejectedValue(
        new Error('OTP_INVALID')
      );
      const onError = vi.fn();

      const { result } = renderHook(() => useOTP({ onError }), { wrapper });

      let response: any;
      await act(async () => {
        response = await result.current.verifyOTP(
          '09123456789',
          'phone',
          '0000'
        );
      });

      expect(response).toEqual({
        success: false,
        error: 'OTP_INVALID',
      });
      expect(onError).toHaveBeenCalledWith('OTP_INVALID');
      expect(mockToast).toHaveBeenCalledTimes(1);
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'خطا در تأیید',
          variant: 'destructive',
        })
      );
    });
  });
});
