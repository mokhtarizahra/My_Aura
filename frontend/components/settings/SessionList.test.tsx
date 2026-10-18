import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';

import faMessages from '@/messages/fa.json';
import { Session } from '@/types/auth';

import { SessionList } from './SessionList';

// Fixtures
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

const renderSessionList = (
  props: Partial<React.ComponentProps<typeof SessionList>> = {}
) => {
  const defaultProps: React.ComponentProps<typeof SessionList> = {
    sessions: [],
    isLoading: false,
    errorMessage: '',
    onRevoke: vi.fn(),
    ...props,
  };

  return render(
    <NextIntlClientProvider locale="fa" messages={faMessages}>
      <SessionList {...defaultProps} />
    </NextIntlClientProvider>
  );
};

describe('SessionList', () => {
  it('shows loading state when isLoading is true', () => {
    renderSessionList({ isLoading: true });

    expect(screen.getByText('در حال بارگذاری نشست‌ها...')).toBeInTheDocument();
  });

  it('shows error message when errorMessage is provided', () => {
    renderSessionList({
      errorMessage: 'خطا در دریافت لیست دستگاه‌ها',
    });

    expect(
      screen.getByText('خطا در دریافت لیست دستگاه‌ها')
    ).toBeInTheDocument();
  });

  it('shows empty state when sessions array is empty', () => {
    renderSessionList({ sessions: [] });

    expect(
      screen.getByText('هیچ دستگاه فعالی یافت نشد')
    ).toBeInTheDocument();
  });

  it('renders all sessions when array has items', () => {
    renderSessionList({ sessions: mockSessions });

    // Each session has an IP, so we should see both
    expect(screen.getByText(/192\.168\.1\.1/)).toBeInTheDocument();
    expect(screen.getByText(/192\.168\.1\.2/)).toBeInTheDocument();

    // 2 revoke buttons (one per session)
    const revokeButtons = screen.getAllByRole('button', {
      name: /خروج از این دستگاه/i,
    });
    expect(revokeButtons).toHaveLength(2);
  });

  it('prioritizes loading over other states', () => {
    renderSessionList({
      isLoading: true,
      errorMessage: 'Some error',
      sessions: mockSessions,
    });

    expect(screen.getByText('در حال بارگذاری نشست‌ها...')).toBeInTheDocument();
    expect(screen.queryByText('Some error')).not.toBeInTheDocument();
    expect(screen.queryByText(/192\.168\.1\.1/)).not.toBeInTheDocument();
  });

  it('prioritizes error over empty state', () => {
    renderSessionList({
      errorMessage: 'خطا',
      sessions: [],
    });

    expect(screen.getByText('خطا')).toBeInTheDocument();
    expect(
      screen.queryByText('هیچ دستگاه فعالی یافت نشد')
    ).not.toBeInTheDocument();
  });
});