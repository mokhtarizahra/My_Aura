import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { usePassword } from '@/hooks/authentication/usePassword';
import faMessages from '@/messages/fa.json';

import { ResetPasswordForm } from './ResetPasswordForm';

vi.mock('@/hooks/authentication/usePassword', () => ({
  usePassword: vi.fn(),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockSetPassword = vi.fn();

const renderResetPasswordForm = (
  props: Partial<React.ComponentProps<typeof ResetPasswordForm>> = {}
) => {
  return render(
    <NextIntlClientProvider locale="fa" messages={faMessages}>
      <ResetPasswordForm
        verificationToken="mock-verification-token"
        {...props}
      />
    </NextIntlClientProvider>
  );
};

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (usePassword as any).mockImplementation((options: any = {}) => ({
      setPassword: async (token: string, password: string) => {
        const result = await mockSetPassword(token, password);
        if (!result.success) {
          options?.onError?.(result.error);
        }
        return result;
      },
    }));
  });

  it('renders the form correctly', () => {
    renderResetPasswordForm();

    expect(screen.getByText('تعیین رمز عبور جدید')).toBeInTheDocument();
    expect(screen.getByLabelText('رمز عبور جدید')).toBeInTheDocument();
    expect(
      screen.getByLabelText('تکرار رمز عبور جدید')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'تغییر رمز عبور' })
    ).toBeInTheDocument();
    expect(screen.getByText('بازگشت به صفحه ورود')).toBeInTheDocument();
  });

  it('shows validation errors for empty submit', async () => {
    const user = userEvent.setup();
    renderResetPasswordForm();

    await user.click(screen.getByRole('button', { name: 'تغییر رمز عبور' }));

    expect(await screen.findByText('رمز عبور الزامی است')).toBeInTheDocument();
    expect(
      await screen.findByText('تکرار رمز عبور الزامی است')
    ).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderResetPasswordForm();

    await user.type(
      screen.getByLabelText('رمز عبور جدید'),
      'StrongPass123!'
    );
    await user.type(
      screen.getByLabelText('تکرار رمز عبور جدید'),
      'DifferentPass123!'
    );
    await user.click(screen.getByRole('button', { name: 'تغییر رمز عبور' }));

    expect(
      await screen.findByText('رمز عبور و تکرار آن یکسان نیستند')
    ).toBeInTheDocument();
  });

  it('calls setPassword and onSuccess on successful submission', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    mockSetPassword.mockResolvedValue({ success: true });

    renderResetPasswordForm({ onSuccess });

    await user.type(
      screen.getByLabelText('رمز عبور جدید'),
      'StrongPass123!'
    );
    await user.type(
      screen.getByLabelText('تکرار رمز عبور جدید'),
      'StrongPass123!'
    );
    await user.click(screen.getByRole('button', { name: 'تغییر رمز عبور' }));

    await waitFor(() => {
      expect(mockSetPassword).toHaveBeenCalledWith(
        'mock-verification-token',
        'StrongPass123!'
      );
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('shows translated error when password is the same as old', async () => {
    const user = userEvent.setup();
    const onError = vi.fn();

    mockSetPassword.mockResolvedValue({
      success: false,
      error: 'PASSWORD_SAME_AS_OLD',
    });

    renderResetPasswordForm({ onError });

    await user.type(
      screen.getByLabelText('رمز عبور جدید'),
      'OldPassword123!'
    );
    await user.type(
      screen.getByLabelText('تکرار رمز عبور جدید'),
      'OldPassword123!'
    );
    await user.click(screen.getByRole('button', { name: 'تغییر رمز عبور' }));

    expect(
      await screen.findByText('رمز عبور جدید باید با رمز قبلی متفاوت باشد')
    ).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith('PASSWORD_SAME_AS_OLD');
  });

  it('shows generic error when unknown error code is returned', async () => {
    const user = userEvent.setup();
    const onError = vi.fn();

    mockSetPassword.mockResolvedValue({
      success: false,
      error: 'UNKNOWN_ERROR_CODE',
    });

    renderResetPasswordForm({ onError });

    await user.type(
      screen.getByLabelText('رمز عبور جدید'),
      'StrongPass123!'
    );
    await user.type(
      screen.getByLabelText('تکرار رمز عبور جدید'),
      'StrongPass123!'
    );
    await user.click(screen.getByRole('button', { name: 'تغییر رمز عبور' }));

    expect(
      await screen.findByText('خطا در تغییر رمز عبور')
    ).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith('UNKNOWN_ERROR_CODE');
  });
});