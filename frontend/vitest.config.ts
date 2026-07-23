import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // محیط مرورگر مجازی برای React
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'app/**/*.test.{ts,tsx}',
      'components/**/*.test.{ts,tsx}',
      'lib/**/*.test.{ts,tsx}',
      'hooks/**/*.test.{ts,tsx}',
      'services/**/*.test.{ts,tsx}'
    ],
    exclude: [
      'node_modules',
      'node_modules_linux',
      '.next',
      'dist'
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});