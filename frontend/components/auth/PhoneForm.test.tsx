import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import React from 'react';

import { usePhone } from '@/hooks/authentication/usePhone';
import faMessages from '@/messages/fa.json';

import { PhoneForm } from './PhoneForm';

vi.mock('@/hooks/authentication/usePhone', () => ({
  usePhone: vi.fn(),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockRequestOTP = vi.fn();

const renderPhoneForm = (
  props: Partial<React.ComponentProps<typeof PhoneForm>> = {}
) => {
  return render(
    <NextIntlClientProvider locale="fa" messages={faMessages}>
      <PhoneForm {...props} />
    </NextIntlClientProvider>
  );
};

describe('PhoneForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (usePhone as any).mockImplementation((options: any = {}) => ({
      requestOTP: async (
        identifier: string,
        identifierType: string,
        purpose: string
      ) => {
        const result = await mockRequestOTP(
          identifier,
          identifierType,
          purpose
        );
        if (!result.success) {
          options?.onError?.(result.error);
        }
        return result;
      },
    }));
  });

  it('renders phone form correctly', () => {
    renderPhoneForm();
    expect(screen.getByText('ورود به حساب کاربری')).toBeInTheDocument();
    expect(screen.getByLabelText('شماره موبایل')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('09123456789')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /ارسال کد تأیید/i })
    ).toBeInTheDocument();
  });

  it('shows error when phone is empty', async () => {
    const user = userEvent.setup();
    renderPhoneForm();
    await user.click(screen.getByRole('button', { name: /ارسال کد تأیید/i }));
    expect(
      await screen.findByText('شماره موبایل الزامی است')
    ).toBeInTheDocument();
  });

  it('rejects invalid phone number', async () => {
    const user = userEvent.setup();
    renderPhoneForm();
    await user.type(screen.getByLabelText('شماره موبایل'), '0912345678');
    await user.click(screen.getByRole('button', { name: /ارسال کد تأیید/i }));
    expect(
      await screen.findByText('شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد')
    ).toBeInTheDocument();
  });

  it('calls requestOTP and onSuccess after successful request', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    mockRequestOTP.mockResolvedValue({ success: true });

    renderPhoneForm({ onSuccess });

    await user.type(screen.getByLabelText('شماره موبایل'), '09123456789');
    await user.click(screen.getByRole('button', { name: /ارسال کد تأیید/i }));

    await waitFor(() => {
      expect(mockRequestOTP).toHaveBeenCalledWith(
        '09123456789',
        'phone',
        'registration'
      );
      expect(onSuccess).toHaveBeenCalledWith('09123456789');
    });
  });

  it('shows server error message', async () => {
    const user = userEvent.setup();
    const onError = vi.fn();

    mockRequestOTP.mockResolvedValue({
      success: false,
      error: 'OTP_REQUEST_FAILED',
    });

    renderPhoneForm({ onError });

    await user.type(screen.getByLabelText('شماره موبایل'), '09123456789');
    await user.click(screen.getByRole('button', { name: /ارسال کد تأیید/i }));

    expect(await screen.findByText('OTP_REQUEST_FAILED')).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith('OTP_REQUEST_FAILED');
  });

  it('disables button and input while submitting', async () => {
    const user = userEvent.setup();
    let resolveRequest: any;

    mockRequestOTP.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
    );

    renderPhoneForm();

    const input = screen.getByLabelText('شماره موبایل');
    const button = screen.getByRole('button', { name: /ارسال کد تأیید/i });

    await user.type(input, '09123456789');
    await user.click(button);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /در حال ارسال/i })
      ).toBeDisabled();
      expect(input).toBeDisabled();
    });

    resolveRequest({ success: true });
  });
});