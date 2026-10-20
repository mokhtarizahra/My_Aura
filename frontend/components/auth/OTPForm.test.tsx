import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useOTP } from '@/hooks/authentication/useOTP';
import faMessages from '@/messages/fa.json';

import { OTPForm } from './OTPForm';

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/hooks/authentication/useOTP', () => ({
  useOTP: vi.fn(),
}));

const mockVerifyOTP = vi.fn();

const renderOTPForm = (
  props: Partial<React.ComponentProps<typeof OTPForm>> = {}
) => {
  return render(
    <NextIntlClientProvider locale="fa" messages={faMessages}>
      <OTPForm phone="09123456789" {...props} />
    </NextIntlClientProvider>
  );
};

describe('OTPForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useOTP as any).mockImplementation((options: any = {}) => ({
      verifyOTP: async (
        identifier: string,
        identifierType: string,
        otp: string,
        purpose: string
      ) => {
        const result = await mockVerifyOTP(
          identifier,
          identifierType,
          otp,
          purpose
        );
        if (!result.success) {
          options?.onError?.(result.error);
        }
        return result;
      },
    }));
  });

  it('renders correctly', () => {
    renderOTPForm();
    expect(screen.getByText('ورود با کد یکبارمصرف')).toBeInTheDocument();
    expect(screen.getByLabelText('کد تأیید')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'تأیید کد' })
    ).toBeInTheDocument();
  });

  it('shows validation error for empty otp', async () => {
    const user = userEvent.setup();
    renderOTPForm();
    await user.click(screen.getByRole('button', { name: 'تأیید کد' }));
    expect(
      await screen.findByText('کد باید دقیقاً ۴ رقم باشد')
    ).toBeInTheDocument();
  });

  it('calls onSuccess with verificationToken after successful verify', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    mockVerifyOTP.mockResolvedValue({
      success: true,
      verificationToken: 'verification-token-abc',
    });

    renderOTPForm({ onSuccess });

    await user.type(screen.getByLabelText('کد تأیید'), '1234');
    await user.click(screen.getByRole('button', { name: 'تأیید کد' }));

    await waitFor(() => {
      expect(mockVerifyOTP).toHaveBeenCalledWith(
        '09123456789',
        'phone',
        '1234',
        'registration'
      );
      expect(onSuccess).toHaveBeenCalledWith('verification-token-abc');
    });
  });

  it('shows verification error when verify fails', async () => {
    const user = userEvent.setup();
    const onError = vi.fn();

    mockVerifyOTP.mockResolvedValue({
      success: false,
      error: 'OTP_INVALID',
    });

    renderOTPForm({ onError });

    await user.type(screen.getByLabelText('کد تأیید'), '1234');
    await user.click(screen.getByRole('button', { name: 'تأیید کد' }));

    expect(await screen.findByText('OTP_INVALID')).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith('OTP_INVALID');
  });
});
