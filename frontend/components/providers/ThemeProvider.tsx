'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class" // writes class="dark" on <html>
      defaultTheme="system" // respects OS preference on first visit
      enableSystem
      disableTransitionOnChange // prevents color transition flash on switch
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
