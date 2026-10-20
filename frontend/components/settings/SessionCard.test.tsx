import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import faMessages from '@/messages/fa.json';
import { Session } from '@/types/auth';

import { SessionCard } from './SessionCard';

// Fixtures
const mobileChromeSession: Session = {
  _id: 'session-1',
  accountId: 'account-1',
  accountType: 'personal',
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile',
  ip: '192.168.1.1',
  expiresAt: '2026-12-31T00:00:00.000Z',
  createdAt: '2026-01-15T10:30:00.000Z',
  updatedAt: '2026-01-15T10:30:00.000Z',
};

const desktopFirefoxSession: Session = {
  _id: 'session-2',
  accountId: 'account-1',
  accountType: 'personal',
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/120.0',
  ip: '192.168.1.2',
  expiresAt: '2026-12-31T00:00:00.000Z',
  createdAt: '2026-01-10T08:00:00.000Z',
  updatedAt: '2026-01-10T08:00:00.000Z',
};

const renderSessionCard = (
  props: Partial<React.ComponentProps<typeof SessionCard>> & {
    session: Session;
    onRevoke: (sessionId: string) => Promise<void>;
  }
) => {
  return render(
    <NextIntlClientProvider locale="fa" messages={faMessages}>
      <SessionCard {...props} />
    </NextIntlClientProvider>
  );
};

describe('SessionCard', () => {
  const mockOnRevoke = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders mobile + chrome session correctly', () => {
    renderSessionCard({
      session: mobileChromeSession,
      onRevoke: mockOnRevoke,
    });

    expect(screen.getByText(/کروم — موبایل/)).toBeInTheDocument();
    expect(screen.getByText(/192\.168\.1\.1/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /خروج از این دستگاه/i })
    ).toBeInTheDocument();
  });

  it('renders desktop + firefox session correctly', () => {
    renderSessionCard({
      session: desktopFirefoxSession,
      onRevoke: mockOnRevoke,
    });

    expect(screen.getByText(/فایرفاکس — دسکتاپ/)).toBeInTheDocument();
    expect(screen.getByText(/192\.168\.1\.2/)).toBeInTheDocument();
  });

  it('calls onRevoke with the session id when revoke button is clicked', async () => {
    const user = userEvent.setup();
    mockOnRevoke.mockResolvedValue(undefined);

    renderSessionCard({
      session: mobileChromeSession,
      onRevoke: mockOnRevoke,
    });

    await user.click(
      screen.getByRole('button', { name: /خروج از این دستگاه/i })
    );

    await waitFor(() => {
      expect(mockOnRevoke).toHaveBeenCalledWith('session-1');
    });
  });

  it('shows revoking state while onRevoke is in progress', async () => {
    const user = userEvent.setup();
    let resolveRevoke: () => void;
    const slowRevoke = new Promise<void>((resolve) => {
      resolveRevoke = resolve;
    });
    mockOnRevoke.mockReturnValue(slowRevoke);

    renderSessionCard({
      session: mobileChromeSession,
      onRevoke: mockOnRevoke,
    });

    await user.click(
      screen.getByRole('button', { name: /خروج از این دستگاه/i })
    );

    // While pending
    expect(
      screen.getByRole('button', { name: /در حال خروج/i })
    ).toBeDisabled();

    // Resolve
    resolveRevoke!();
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /خروج از این دستگاه/i })
      ).not.toBeDisabled();
    });
  });

  it('disables the button when the disabled prop is true', () => {
    renderSessionCard({
      session: mobileChromeSession,
      onRevoke: mockOnRevoke,
      disabled: true,
    });

    expect(
      screen.getByRole('button', { name: /خروج از این دستگاه/i })
    ).toBeDisabled();
  });

  it('handles unknown userAgent gracefully', () => {
    const unknownSession: Session = {
      ...mobileChromeSession,
      userAgent: '',
    };

    renderSessionCard({
      session: unknownSession,
      onRevoke: mockOnRevoke,
    });

    expect(
      screen.getByText(/مرورگر ناشناخته — دسکتاپ/)
    ).toBeInTheDocument();
  });
});