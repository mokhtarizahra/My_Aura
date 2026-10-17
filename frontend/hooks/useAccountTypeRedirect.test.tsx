import { renderHook } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import faMessages from '@/messages/fa.json';

import { useAccountTypeRedirect } from './useAccountTypeRedirect';

// Mocks
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockToast = vi.fn();

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

vi.mock('./use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Helper: wrap hook in NextIntlClientProvider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="fa" messages={faMessages}>
    {children}
  </NextIntlClientProvider>
);

describe('useAccountTypeRedirect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects personal account to /', () => {
    const { result } = renderHook(() => useAccountTypeRedirect(), { wrapper });

    const path = result.current.redirectByAccountType('personal');

    expect(mockPush).toHaveBeenCalledWith('/');
    expect(mockReplace).not.toHaveBeenCalled();
    expect(path).toBe('/');
    expect(mockToast).not.toHaveBeenCalled();
  });

  it('redirects organization account to /dashboard/seller', () => {
    const { result } = renderHook(() => useAccountTypeRedirect(), { wrapper });

    const path = result.current.redirectByAccountType('organization');

    expect(mockPush).toHaveBeenCalledWith('/dashboard/seller');
    expect(path).toBe('/dashboard/seller');
  });

  it('redirects staff account to /dashboard/admin', () => {
    const { result } = renderHook(() => useAccountTypeRedirect(), { wrapper });

    const path = result.current.redirectByAccountType('staff');

    expect(mockPush).toHaveBeenCalledWith('/dashboard/admin');
    expect(path).toBe('/dashboard/admin');
  });

  it('uses replace when replace option is passed', () => {
    const { result } = renderHook(() => useAccountTypeRedirect(), { wrapper });

    result.current.redirectByAccountType('personal', { replace: true });

    expect(mockReplace).toHaveBeenCalledWith('/');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('redirects to /403 and shows a toast for invalid account type', () => {
    const { result } = renderHook(() => useAccountTypeRedirect(), { wrapper });

    const path = result.current.redirectByAccountType('unknown' as any);

    expect(mockReplace).toHaveBeenCalledWith('/403');
    expect(path).toBe('/403');
    expect(mockToast).toHaveBeenCalledTimes(1);
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'destructive',
      })
    );
  });
});