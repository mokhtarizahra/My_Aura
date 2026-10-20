import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from '@/hooks/authentication/useAuth';
import faMessages from '@/messages/fa.json';

import { LoginForm } from './LoginForm';

vi.mock('@/hooks/authentication/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockLoginWithPassword = vi.fn();

const renderLoginForm = (
  props?: Partial<React.ComponentProps<typeof LoginForm>>
) => {
  return render(
    <NextIntlClientProvider locale="fa" messages={faMessages}>
      <LoginForm {...props} />
    </NextIntlClientProvider>
  );
};

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      loginWithPassword: mockLoginWithPassword,
    } as any);
  });

  it('should render login form correctly', () => {
    renderLoginForm();
    expect(screen.getByLabelText('شماره موبایل')).toBeInTheDocument();
    expect(
      screen.getByLabelText('رمز عبور', { selector: 'input' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ورود' })).toBeInTheDocument();
    expect(screen.getByText('حساب کاربری ندارید؟')).toBeInTheDocument();
  });

  it('should show validation errors for empty submit', async () => {
    const user = userEvent.setup();
    renderLoginForm();
    await user.click(screen.getByRole('button', { name: 'ورود' }));
    expect(
      await screen.findByText('شماره موبایل الزامی است')
    ).toBeInTheDocument();
    expect(await screen.findByText('رمز عبور الزامی است')).toBeInTheDocument();
  });

  it('should validate Iranian phone number format', async () => {
    const user = userEvent.setup();
    renderLoginForm();
    await user.type(screen.getByLabelText('شماره موبایل'), '0912345');
    await user.type(
      screen.getByLabelText('رمز عبور', { selector: 'input' }),
      '123456'
    );
    await user.click(screen.getByRole('button', { name: 'ورود' }));
    expect(
      await screen.findByText('شماره موبایل معتبر ایرانی وارد کنید')
    ).toBeInTheDocument();
  });

  it('should login successfully and call onSuccess with accountType', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    mockLoginWithPassword.mockResolvedValue({
      success: true,
      data: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        session: {
          _id: 'session-1',
          accountId: 'acc-1',
          accountType: 'personal',
          expiresAt: '2026-12-31T00:00:00.000Z',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      },
    });

    renderLoginForm({ onSuccess });

    await user.type(screen.getByLabelText('شماره موبایل'), '09123456789');
    await user.type(
      screen.getByLabelText('رمز عبور', { selector: 'input' }),
      'securepass'
    );
    await user.click(screen.getByRole('button', { name: 'ورود' }));

    await waitFor(() => {
      expect(mockLoginWithPassword).toHaveBeenCalledWith(
        '09123456789',
        'securepass'
      );
      expect(onSuccess).toHaveBeenCalledWith('personal');
    });
  });

  it('should show error when login fails', async () => {
    const user = userEvent.setup();
    const onError = vi.fn();

    mockLoginWithPassword.mockRejectedValue(new Error('INVALID_CREDENTIALS'));

    renderLoginForm({ onError });

    await user.type(screen.getByLabelText('شماره موبایل'), '09123456789');
    await user.type(
      screen.getByLabelText('رمز عبور', { selector: 'input' }),
      'wrongpass'
    );
    await user.click(screen.getByRole('button', { name: 'ورود' }));

    expect(
      await screen.findByText('نام کاربری یا رمز عبور نادرست است.')
    ).toBeInTheDocument();
    expect(onError).toHaveBeenCalled();
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();
    renderLoginForm();
    const passwordInput = screen.getByLabelText('رمز عبور', {
      selector: 'input',
    });
    const toggleButton = screen.getByTestId('toggle-password');
    expect(passwordInput).toHaveAttribute('type', 'password');
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('should show min length error for short password', async () => {
    const user = userEvent.setup();
    renderLoginForm();
    await user.type(screen.getByLabelText('شماره موبایل'), '09123456789');
    await user.type(
      screen.getByLabelText('رمز عبور', { selector: 'input' }),
      '123'
    );
    await user.click(screen.getByRole('button', { name: 'ورود' }));
    expect(
      await screen.findByText('رمز عبور باید حداقل ۶ کاراکتر باشد')
    ).toBeInTheDocument();
  });
});
