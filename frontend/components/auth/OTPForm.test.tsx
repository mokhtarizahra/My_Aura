// components/auth/OTPForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import React from 'react';

import { useOTP } from '@/hooks/useOTP';

import { OTPForm } from './OTPForm';

vi.mock('@/hooks/useOTP', () => ({
  useOTP: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

const mockRouter = {
  push: vi.fn(),
};

describe('OTPForm Component', () => {
  const phone = '09123456789';

  const mockVerifyOTP = vi.fn();
  const mockResendOTP = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useRouter as any).mockReturnValue(mockRouter);

    (useOTP as any).mockImplementation((options: any = {}) => ({
      verifyOTP: async (phone: string, code: string) => {
        const result = await mockVerifyOTP(phone, code);

        if (result.success) {
          mockRouter.push('/settings/password');

          await options.onSuccess?.();

          return {
            success: true,
          };
        }

        return result;
      },

      resendOTP: async (phone: string) => {
        return await mockResendOTP(phone);
      },
    }));
  });

  it('renders correctly', () => {
    render(<OTPForm phone={phone} />);

    expect(screen.getByText('ورود با کد یکبارمصرف')).toBeInTheDocument();

    expect(screen.getByLabelText('کد تأیید')).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'تأیید کد',
      })
    ).toBeInTheDocument();
  });

  it('shows validation error for empty otp', async () => {
    const user = userEvent.setup();

    render(<OTPForm phone={phone} />);

    await user.click(
      screen.getByRole('button', {
        name: 'تأیید کد',
      })
    );

    expect(
      await screen.findByText('کد باید دقیقاً ۴ رقم باشد')
    ).toBeInTheDocument();
  });

  it('successfully verifies otp and redirects', async () => {
    const user = userEvent.setup();

    const onSuccess = vi.fn();

    mockVerifyOTP.mockResolvedValue({
      success: true,
    });

    render(<OTPForm phone={phone} onSuccess={onSuccess} />);

    const input = screen.getByLabelText('کد تأیید');

    await user.type(input, '1234');

    await user.click(
      screen.getByRole('button', {
        name: 'تأیید کد',
      })
    );

    await waitFor(() => {
      expect(mockVerifyOTP).toHaveBeenCalledWith(phone, '1234');

      expect(onSuccess).toHaveBeenCalled();

      expect(mockRouter.push).toHaveBeenCalledWith('/settings/password');
    });
  });

  it('shows verification error', async () => {
    const user = userEvent.setup();

    mockVerifyOTP.mockResolvedValue({
      success: false,
      error: 'کد نامعتبر است',
    });

    render(<OTPForm phone={phone} />);

    await user.type(screen.getByLabelText('کد تأیید'), '1234');

    await user.click(
      screen.getByRole('button', {
        name: 'تأیید کد',
      })
    );

    expect(await screen.findByText('کد نامعتبر است')).toBeInTheDocument();
  });

  it('resends otp successfully', async () => {
    const user = userEvent.setup();

    mockResendOTP.mockResolvedValue({
      success: true,
    });

    render(<OTPForm phone={phone} />);

    await user.click(screen.getByText('ارسال مجدد'));

    await waitFor(() => {
      expect(mockResendOTP).toHaveBeenCalledWith(phone);
    });
  });

  it('shows resend error', async () => {
    const user = userEvent.setup();

    mockResendOTP.mockResolvedValue({
      success: false,
      error: 'خطا در ارسال مجدد',
    });

    render(<OTPForm phone={phone} />);

    await user.click(screen.getByText('ارسال مجدد'));

    expect(await screen.findByText('خطا در ارسال مجدد')).toBeInTheDocument();
  });
});
