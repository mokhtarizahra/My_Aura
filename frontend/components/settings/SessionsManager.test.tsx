import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSessions } from '@/hooks/authentication/useSessions';
import faMessages from '@/messages/fa.json';
import { Session } from '@/types/auth';

import { SessionsManager } from './SessionsManager';

// ─── Stable mocks (module-level) ────────────────────────────────
const mockFetchSessions = vi.fn();
const mockRevokeSessionById = vi.fn();
const mockRevokeAllSessions = vi.fn();
const mockReplace = vi.fn();

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/hooks/authentication/useSessions', () => ({
  useSessions: vi.fn(),
}));

// ─── Fixtures ───────────────────────────────────────────────────
const mockSessions: Session[] = [
  {
    _id: 'session-1',
    accountId: 'account-1',
    accountType: 'personal',
    userAgent: 'Chrome Mobile',
    ip: '192.168.1.1',
    expiresAt: '2026-12-31T00:00:00.000Z',
    createdAt: '2026-01-15T10:30:00.000Z',
    updatedAt: '2026-01-15T10:30:00.000Z',
  },
  {
    _id: 'session-2',
    accountId: 'account-1',
    accountType: 'personal',
    userAgent: 'Firefox',
    ip: '192.168.1.2',
    expiresAt: '2026-12-31T00:00:00.000Z',
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-01-10T08:00:00.000Z',
  },
];

// ─── Helper ─────────────────────────────────────────────────────
interface SetupOverrides {
  isLoading?: boolean;
  fetchSessions?: (...args: any[]) => any;
  revokeSessionById?: (...args: any[]) => any;
  revokeAllSessions?: (...args: any[]) => any;
}

const setupMock = (overrides: SetupOverrides = {}) => {
  // useSessions always returns the SAME stable functions
  (useSessions as any).mockReturnValue({
    isLoading: overrides.isLoading ?? false,
    fetchSessions: mockFetchSessions,
    revokeSessionById: mockRevokeSessionById,
    revokeAllSessions: mockRevokeAllSessions,
  });

  // Configure the implementations per test
  mockFetchSessions.mockImplementation(
    overrides.fetchSessions ??
      (async () => ({ success: true, sessions: mockSessions }))
  );
  mockRevokeSessionById.mockImplementation(
    overrides.revokeSessionById ??
      (async () => ({ success: true, revoked: true }))
  );
  mockRevokeAllSessions.mockImplementation(
    overrides.revokeAllSessions ??
      (async () => ({ success: true, revoked: true }))
  );
};

const renderSessionsManager = () => {
  return render(
    <NextIntlClientProvider locale="fa" messages={faMessages}>
      <SessionsManager />
    </NextIntlClientProvider>
  );
};

// ─── Tests ──────────────────────────────────────────────────────
describe('SessionsManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMock();
  });

  it('renders title and description', async () => {
    renderSessionsManager();

    expect(screen.getByText('دستگاه‌های فعال')).toBeInTheDocument();
    expect(
      screen.getByText(/لیست تمام دستگاه‌هایی که به حساب کاربری شما وارد شده‌اند/)
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.queryByText('در حال بارگذاری نشست‌ها...')
      ).not.toBeInTheDocument();
    });
  });

  it('renders loading state while fetching', () => {
    setupMock({ isLoading: true });
    renderSessionsManager();

    expect(screen.getByText('در حال بارگذاری نشست‌ها...')).toBeInTheDocument();
  });

  it('renders empty state when there are no sessions', async () => {
    setupMock({
      fetchSessions: async () => ({ success: true, sessions: [] }),
    });
    renderSessionsManager();

    await waitFor(() => {
      expect(
        screen.getByText('هیچ دستگاه فعالی یافت نشد')
      ).toBeInTheDocument();
    });
  });

  it('renders all sessions after fetching', async () => {
    renderSessionsManager();

    await waitFor(() => {
      expect(screen.getByText(/192\.168\.1\.1/)).toBeInTheDocument();
      expect(screen.getByText(/192\.168\.1\.2/)).toBeInTheDocument();
    });
  });

  it('revokes a session and removes it from the list', async () => {
    const user = userEvent.setup();
    const revokeSpy = vi.fn(async () => ({ success: true, revoked: true }));
    setupMock({ revokeSessionById: revokeSpy });

    renderSessionsManager();

    await waitFor(() => {
      expect(screen.getByText(/192\.168\.1\.1/)).toBeInTheDocument();
    });

    const revokeButtons = screen.getAllByRole('button', {
      name: /خروج از این دستگاه/i,
    });
    await user.click(revokeButtons[0]);

    await waitFor(() => {
      expect(revokeSpy).toHaveBeenCalledWith('session-1');
      expect(screen.queryByText(/192\.168\.1\.1/)).not.toBeInTheDocument();
      expect(screen.getByText(/192\.168\.1\.2/)).toBeInTheDocument();
    });
  });

  it('shows revoke-all confirmation when revoke-all button is clicked', async () => {
    const user = userEvent.setup();
    renderSessionsManager();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /خروج از همه‌ی دستگاه‌ها/i })
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: /خروج از همه‌ی دستگاه‌ها/i })
    );

    await waitFor(() => {
      const confirmButtons = screen.getAllByRole('button', {
        name: /خروج از همه‌ی دستگاه‌ها/i,
      });
      expect(confirmButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('cancels revoke-all confirmation and does not call revokeAllSessions', async () => {
    const user = userEvent.setup();
    const revokeAllSpy = vi.fn(async () => ({ success: true, revoked: true }));
    setupMock({ revokeAllSessions: revokeAllSpy });

    renderSessionsManager();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /خروج از همه‌ی دستگاه‌ها/i })
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: /خروج از همه‌ی دستگاه‌ها/i })
    );

    await user.click(screen.getByRole('button', { name: /بازگشت به داشبورد/i }));

    expect(revokeAllSpy).not.toHaveBeenCalled();
  });

  it('confirms revoke-all, calls revokeAllSessions, and redirects to login', async () => {
    const user = userEvent.setup();
    const revokeAllSpy = vi.fn(async () => ({ success: true, revoked: true }));
    setupMock({ revokeAllSessions: revokeAllSpy });

    renderSessionsManager();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /خروج از همه‌ی دستگاه‌ها/i })
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: /خروج از همه‌ی دستگاه‌ها/i })
    );

    const confirmButtons = screen.getAllByRole('button', {
      name: /خروج از همه‌ی دستگاه‌ها/i,
    });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    await waitFor(() => {
      expect(revokeAllSpy).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('/auth/login');
    });
  });
});