import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useRegistration } from '@/hooks/authentication/useRegistration';
import faMessages from '@/messages/fa.json';

import { CompleteRegistrationForm } from './CompleteRegistrationForm';

vi.mock('@/hooks/authentication/useRegistration', () => ({
  useRegistration: vi.fn(),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockRegister = vi.fn();

const renderCompleteRegistrationForm = (
  props: Partial<React.ComponentProps<typeof CompleteRegistrationForm>> = {}
) => {
  return render(
    <NextIntlClientProvider locale="fa" messages={faMessages}>
      <CompleteRegistrationForm
        verificationToken="mock-verification-token"
        {...props}
      />
    </NextIntlClientProvider>
  );
};

describe('CompleteRegistrationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useRegistration as any).mockImplementation((options: any = {}) => ({
      register: async (
        token: string,
        firstName: string,
        lastName: string,
        password: string
      ) => {
        const result = await mockRegister(token, firstName, lastName, password);
        if (!result.success) {
          options?.onError?.(result.error);
        }
        return result;
      },
    }));
  });

  it('renders the form correctly', () => {
    renderCompleteRegistrationForm();

    expect(screen.getByText('تکمیل ثبت‌نام')).toBeInTheDocument();
    expect(screen.getByLabelText('نام')).toBeInTheDocument();
    expect(screen.getByLabelText('نام خانوادگی')).toBeInTheDocument();
    expect(screen.getByLabelText('رمز عبور')).toBeInTheDocument();
    expect(screen.getByLabelText('تکرار رمز عبور')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'ایجاد حساب' })
    ).toBeInTheDocument();
  });

  it('shows validation errors for empty submit', async () => {
    const user = userEvent.setup();
    renderCompleteRegistrationForm();

    await user.click(screen.getByRole('button', { name: 'ایجاد حساب' }));

    expect(await screen.findByText('نام الزامی است')).toBeInTheDocument();
    expect(
      await screen.findByText('نام خانوادگی الزامی است')
    ).toBeInTheDocument();
    expect(await screen.findByText('رمز عبور الزامی است')).toBeInTheDocument();
    expect(
      await screen.findByText('تکرار رمز عبور الزامی است')
    ).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderCompleteRegistrationForm();

    await user.type(screen.getByLabelText('نام'), 'علی');
    await user.type(screen.getByLabelText('نام خانوادگی'), 'رضایی');
    await user.type(screen.getByLabelText('رمز عبور'), 'StrongPass123!');
    await user.type(
      screen.getByLabelText('تکرار رمز عبور'),
      'DifferentPass123!'
    );
    await user.click(screen.getByRole('button', { name: 'ایجاد حساب' }));

    expect(
      await screen.findByText('رمز عبور و تکرار آن یکسان نیستند')
    ).toBeInTheDocument();
  });

  it('calls register and onSuccess on successful submission', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    mockRegister.mockResolvedValue({ success: true });

    renderCompleteRegistrationForm({ onSuccess });

    await user.type(screen.getByLabelText('نام'), 'علی');
    await user.type(screen.getByLabelText('نام خانوادگی'), 'رضایی');
    await user.type(screen.getByLabelText('رمز عبور'), 'StrongPass123!');
    await user.type(screen.getByLabelText('تکرار رمز عبور'), 'StrongPass123!');
    await user.click(screen.getByRole('button', { name: 'ایجاد حساب' }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'mock-verification-token',
        'علی',
        'رضایی',
        'StrongPass123!'
      );
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('shows server error message when registration fails', async () => {
    const user = userEvent.setup();
    const onError = vi.fn();

    mockRegister.mockResolvedValue({
      success: false,
      error: 'ACCOUNT_ALREADY_EXISTS',
    });

    renderCompleteRegistrationForm({ onError });

    await user.type(screen.getByLabelText('نام'), 'علی');
    await user.type(screen.getByLabelText('نام خانوادگی'), 'رضایی');
    await user.type(screen.getByLabelText('رمز عبور'), 'StrongPass123!');
    await user.type(screen.getByLabelText('تکرار رمز عبور'), 'StrongPass123!');
    await user.click(screen.getByRole('button', { name: 'ایجاد حساب' }));

    expect(
      await screen.findByText('ACCOUNT_ALREADY_EXISTS')
    ).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith('ACCOUNT_ALREADY_EXISTS');
  });
});
