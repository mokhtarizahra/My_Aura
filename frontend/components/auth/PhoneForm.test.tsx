import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import React from 'react';

import { usePhone } from '@/hooks/usePhone';

import { PhoneForm } from './PhoneForm';

// Mocks
const mockRequestOTP = vi.fn();

vi.mock('@/hooks/usePhone', () => ({
  usePhone: vi.fn(),
}));

// Helpers
const renderPhoneForm = (
  props: React.ComponentProps<typeof PhoneForm> = {}
) => {
  return render(<PhoneForm {...props} />);
};

// Test Suite
describe('PhoneForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockRequestOTP.mockResolvedValue({
      success: true,
      phone: '09123456789',
    });

    (usePhone as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (options: any) => ({
        requestOTP: async (phone: string) => {
          const result = await mockRequestOTP(phone);

          if (result.success) {
            options?.onSuccess?.(phone);
          }

          return result;
        },
      })
    );
  });

  // Rendering
  it('renders phone form correctly', () => {
    renderPhoneForm();

    expect(screen.getByText('ورود به حساب کاربری')).toBeInTheDocument();

    expect(screen.getByLabelText('شماره موبایل')).toBeInTheDocument();

    expect(screen.getByPlaceholderText('09123456789')).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: /ارسال کد تأیید/i,
      })
    ).toBeInTheDocument();
  });

  // Validation
  it('shows error when phone is empty', async () => {
    const user = userEvent.setup();

    renderPhoneForm();

    await user.click(
      screen.getByRole('button', {
        name: /ارسال کد تأیید/i,
      })
    );

    expect(
      await screen.findByText('شماره موبایل الزامی است')
    ).toBeInTheDocument();
  });

  it('rejects invalid phone number', async () => {
    const user = userEvent.setup();

    renderPhoneForm();

    const input = screen.getByLabelText('شماره موبایل');

    await user.type(input, '0912345678');

    await user.click(
      screen.getByRole('button', {
        name: /ارسال کد تأیید/i,
      })
    );

    expect(
      await screen.findByText('شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد')
    ).toBeInTheDocument();
  });

  // Submit Success
  it('calls requestOTP and onSuccess after successful request', async () => {
    const user = userEvent.setup();

    const onSuccess = vi.fn();

    renderPhoneForm({
      onSuccess,
    });

    const input = screen.getByLabelText('شماره موبایل');

    await user.type(input, '09123456789');

    await user.click(
      screen.getByRole('button', {
        name: /ارسال کد تأیید/i,
      })
    );

    await waitFor(() => {
      expect(mockRequestOTP).toHaveBeenCalledWith('09123456789');

      expect(onSuccess).toHaveBeenCalledWith('09123456789');
    });
  });

  // Error
  it('shows server error message', async () => {
    const user = userEvent.setup();

    mockRequestOTP.mockResolvedValue({
      success: false,
      error: 'خطا در ارسال کد',
    });

    renderPhoneForm();

    await user.type(screen.getByLabelText('شماره موبایل'), '09123456789');

    await user.click(
      screen.getByRole('button', {
        name: /ارسال کد تأیید/i,
      })
    );

    expect(await screen.findByText('خطا در ارسال کد')).toBeInTheDocument();
  });

  // Loading
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

    const button = screen.getByRole('button', {
      name: /ارسال کد تأیید/i,
    });

    await user.type(input, '09123456789');

    await user.click(button);

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: /در حال ارسال/i,
        })
      ).toBeDisabled();

      expect(input).toBeDisabled();
    });

    resolveRequest({
      success: true,
    });
  });
});
