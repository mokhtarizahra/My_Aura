import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { usePassword } from '@/hooks/authentication/usePassword';
import faMessages from '@/messages/fa.json';

import { SettingsPasswordForm } from './SettingsPasswordForm';

vi.mock('@/hooks/authentication/usePassword', () => ({
  usePassword: vi.fn(),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockChangePassword = vi.fn();

const renderSettingsPasswordForm = (
  props: Partial<React.ComponentProps<typeof SettingsPasswordForm>> = {}
) => {
  return render(
    <NextIntlClientProvider locale="fa" messages={faMessages}>
      <SettingsPasswordForm {...props} />
    </NextIntlClientProvider>
  );
};

describe('SettingsPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (usePassword as any).mockImplementation((options: any = {}) => ({
      changePassword: async (currentPassword: string, newPassword: string) => {
        const result = await mockChangePassword(currentPassword, newPassword);
        if (!result.success) {
          options?.onError?.(result.error);
        }
        return result;
      },
    }));
  });

  it('renders the form correctly', () => {
    renderSettingsPasswordForm();

    expect(screen.getByText('تغییر رمز عبور')).toBeInTheDocument();
    expect(screen.getByLabelText('رمز عبور فعلی')).toBeInTheDocument();
    expect(screen.getByLabelText('رمز عبور جدید')).toBeInTheDocument();
    expect(screen.getByLabelText('تکرار رمز عبور جدید')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'ذخیره رمز جدید' })
    ).toBeInTheDocument();
    expect(screen.getByText('بازگشت به داشبورد')).toBeInTheDocument();
  });

  it('shows validation errors for empty submit', async () => {
    const user = userEvent.setup();
    renderSettingsPasswordForm();

    await user.click(screen.getByRole('button', { name: 'ذخیره رمز جدید' }));

    expect(
      await screen.findByText('رمز عبور فعلی الزامی است')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('رمز عبور جدید الزامی است')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('تکرار رمز عبور الزامی است')
    ).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderSettingsPasswordForm();

    await user.type(screen.getByLabelText('رمز عبور فعلی'), 'OldPass123!');
    await user.type(screen.getByLabelText('رمز عبور جدید'), 'NewPass123!');
    await user.type(
      screen.getByLabelText('تکرار رمز عبور جدید'),
      'DifferentPass123!'
    );
    await user.click(screen.getByRole('button', { name: 'ذخیره رمز جدید' }));

    expect(
      await screen.findByText('رمز عبور و تکرار آن یکسان نیستند')
    ).toBeInTheDocument();
  });

  it('shows error when new password equals current password (client-side)', async () => {
    const user = userEvent.setup();
    renderSettingsPasswordForm();

    await user.type(screen.getByLabelText('رمز عبور فعلی'), 'SamePass123!');
    await user.type(screen.getByLabelText('رمز عبور جدید'), 'SamePass123!');
    await user.type(
      screen.getByLabelText('تکرار رمز عبور جدید'),
      'SamePass123!'
    );
    await user.click(screen.getByRole('button', { name: 'ذخیره رمز جدید' }));

    expect(
      await screen.findByText('رمز عبور جدید باید با رمز قبلی متفاوت باشد')
    ).toBeInTheDocument();
  });

  it('calls changePassword and onSuccess on successful submission', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    mockChangePassword.mockResolvedValue({ success: true });

    renderSettingsPasswordForm({ onSuccess });

    await user.type(screen.getByLabelText('رمز عبور فعلی'), 'OldPass123!');
    await user.type(screen.getByLabelText('رمز عبور جدید'), 'NewPass123!');
    await user.type(
      screen.getByLabelText('تکرار رمز عبور جدید'),
      'NewPass123!'
    );
    await user.click(screen.getByRole('button', { name: 'ذخیره رمز جدید' }));

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith(
        'OldPass123!',
        'NewPass123!'
      );
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('shows translated error when current password is incorrect', async () => {
    const user = userEvent.setup();
    const onError = vi.fn();

    mockChangePassword.mockResolvedValue({
      success: false,
      error: 'INVALID_CURRENT_PASSWORD',
    });

    renderSettingsPasswordForm({ onError });

    await user.type(screen.getByLabelText('رمز عبور فعلی'), 'WrongPass!');
    await user.type(screen.getByLabelText('رمز عبور جدید'), 'NewPass123!');
    await user.type(
      screen.getByLabelText('تکرار رمز عبور جدید'),
      'NewPass123!'
    );
    await user.click(screen.getByRole('button', { name: 'ذخیره رمز جدید' }));

    expect(
      await screen.findByText('رمز عبور فعلی اشتباه است')
    ).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith('INVALID_CURRENT_PASSWORD');
  });

  it('shows translated error when backend rejects same password', async () => {
    const user = userEvent.setup();
    const onError = vi.fn();

    mockChangePassword.mockResolvedValue({
      success: false,
      error: 'PASSWORD_SAME_AS_OLD',
    });

    renderSettingsPasswordForm({ onError });

    await user.type(screen.getByLabelText('رمز عبور فعلی'), 'OldPass123!');
    await user.type(screen.getByLabelText('رمز عبور جدید'), 'NewPass123!');
    await user.type(
      screen.getByLabelText('تکرار رمز عبور جدید'),
      'NewPass123!'
    );
    await user.click(screen.getByRole('button', { name: 'ذخیره رمز جدید' }));

    expect(
      await screen.findByText('رمز عبور جدید باید با رمز قبلی متفاوت باشد')
    ).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith('PASSWORD_SAME_AS_OLD');
  });

  it('shows generic error when unknown error code is returned', async () => {
    const user = userEvent.setup();
    const onError = vi.fn();

    mockChangePassword.mockResolvedValue({
      success: false,
      error: 'UNKNOWN_ERROR',
    });

    renderSettingsPasswordForm({ onError });

    await user.type(screen.getByLabelText('رمز عبور فعلی'), 'OldPass123!');
    await user.type(screen.getByLabelText('رمز عبور جدید'), 'NewPass123!');
    await user.type(
      screen.getByLabelText('تکرار رمز عبور جدید'),
      'NewPass123!'
    );
    await user.click(screen.getByRole('button', { name: 'ذخیره رمز جدید' }));

    expect(
      await screen.findByText('خطا در تغییر رمز عبور')
    ).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith('UNKNOWN_ERROR');
  });
});