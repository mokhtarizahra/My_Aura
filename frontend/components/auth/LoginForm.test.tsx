import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { LoginForm } from './LoginForm';
import { AuthProvider } from '@/context/AuthContext';

// Mock کردن next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => {
    return React.createElement('a', { href }, children);
  },
}));

// استفاده از React.createElement برای رندر
const renderWithAuth = (ui: React.ReactNode) => {
  return render(
    React.createElement(AuthProvider, null, ui)
  );
};

describe('LoginForm Component', () => {
  it('should render without crashing', () => {
    renderWithAuth(React.createElement(LoginForm));
    expect(screen.getByText(/ورود/i)).toBeInTheDocument();
  });
});
