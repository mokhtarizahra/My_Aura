// components/auth/OTPForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { OTPForm } from './OTPForm';
import { useOTP } from '@/hooks/useOTP'; // ✅ فقط useOTP
import { AuthProvider } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// ─── Mocks ──────────────────────────────────────────────────────────────────

// only mock `useOTP`.
vi.mock('@/hooks/useOTP', () => ({
  useOTP: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => {
    return React.createElement('a', { href }, children);
  },
}));

// ─── Helpers ────────────────────────────────────────────────────────────────

const renderWithAuth = (ui: React.ReactNode) => {
  return render(React.createElement(AuthProvider, null, ui));
};

// ─── Test Suite ────────────────────────────────────────────────────────────

describe('OTPForm Component', () => {
  const mockPhone = '09123456789';
  const mockVerifyOTP = vi.fn();
  const mockResendOTP = vi.fn();
  const mockRouter = { push: vi.fn(), replace: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();

    // Configuring the useOTP hook
    (useOTP as any).mockReturnValue({
      verifyOTP: mockVerifyOTP,
      resendOTP: mockResendOTP,
    });

    (useRouter as any).mockReturnValue(mockRouter);
  });

  // ─── Rendering Tests ──────────────────────────────────────────────────

  describe('Rendering', () => {
    it('should render all form elements correctly', () => {
      renderWithAuth(React.createElement(OTPForm, { phone: mockPhone }));

      expect(screen.getByText('ورود با کد یکبارمصرف')).toBeInTheDocument();
      expect(screen.getByText('کد تأیید ۴ رقمی ارسال شده را وارد کنید')).toBeInTheDocument();
      expect(screen.getByText('کد به این شماره ارسال شد:')).toBeInTheDocument();
      expect(screen.getByText(mockPhone)).toBeInTheDocument();
      expect(screen.getByLabelText('کد تأیید')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('مثلاً 1234')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'تأیید کد' })).toBeInTheDocument();
      expect(screen.getByText('ارسال مجدد')).toBeInTheDocument();
      expect(screen.getByText('وارد شوید')).toBeInTheDocument();
    });

    it('should show validation error for empty OTP', async () => {
      const user = userEvent.setup();
      renderWithAuth(React.createElement(OTPForm, { phone: mockPhone }));

      const submitButton = screen.getByRole('button', { name: 'تأیید کد' });
      await user.click(submitButton);

      expect(await screen.findByText('کد باید دقیقاً ۴ رقم باشد')).toBeInTheDocument();
    });
  });

  // ─── Success Scenarios ─────────────────────────────────────────────────

  describe('Success Scenarios', () => {
    it('should successfully verify OTP and redirect', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = vi.fn();

      // Clearing Success
      mockVerifyOTP.mockResolvedValue({ success: true });

      renderWithAuth(
        React.createElement(OTPForm, {
          phone: mockPhone,
          onSuccess: mockOnSuccess,
        })
      );

      const otpInput = screen.getByLabelText('کد تأیید');
      const submitButton = screen.getByRole('button', { name: 'تأیید کد' });

      await user.type(otpInput, '1234');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockVerifyOTP).toHaveBeenCalledWith(mockPhone, '1234');
        expect(mockOnSuccess).toHaveBeenCalled();
        expect(mockRouter.push).toHaveBeenCalledWith('/settings/password');
      });
    });

    it('should show error when verification fails', async () => {
      const user = userEvent.setup();

      // Clear error
      mockVerifyOTP.mockResolvedValue({
        success: false,
        error: 'کد نامعتبر است',
      });

      renderWithAuth(React.createElement(OTPForm, { phone: mockPhone }));

      const otpInput = screen.getByLabelText('کد تأیید');
      const submitButton = screen.getByRole('button', { name: 'تأیید کد' });

      await user.type(otpInput, '1234');
      await user.click(submitButton);

      expect(await screen.findByText('کد نامعتبر است')).toBeInTheDocument();
    });
  });

  // ─── Resend OTP Tests ──────────────────────────────────────────────────

  describe('Resend OTP', () => {
    it('should successfully resend OTP', async () => {
      const user = userEvent.setup();

      // Mocking a successful resend
      mockResendOTP.mockResolvedValue({ success: true });

      renderWithAuth(React.createElement(OTPForm, { phone: mockPhone }));

      const resendButton = screen.getByText('ارسال مجدد');
      await user.click(resendButton);

      await waitFor(() => {
        expect(mockResendOTP).toHaveBeenCalledWith(mockPhone);
      });
    });

    it('should show error when resend fails', async () => {
      const user = userEvent.setup();

      // Mocking a failed retry
      mockResendOTP.mockResolvedValue({
        success: false,
        error: 'خطا در ارسال مجدد',
      });

      renderWithAuth(React.createElement(OTPForm, { phone: mockPhone }));

      const resendButton = screen.getByText('ارسال مجدد');
      await user.click(resendButton);

      expect(await screen.findByText('خطا در ارسال مجدد')).toBeInTheDocument();
    });
  });

  // ─── Navigation Tests ──────────────────────────────────────────────────

  describe('Navigation', () => {
    it('should navigate to login page when clicking "وارد شوید"', async () => {
      const user = userEvent.setup();

      renderWithAuth(React.createElement(OTPForm, { phone: mockPhone }));

      const loginLink = screen.getByText('وارد شوید');
      await user.click(loginLink);

      expect(mockRouter.push).toHaveBeenCalledWith('/auth/login');
    });
  });
});