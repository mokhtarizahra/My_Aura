import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node', // محیط Node.js برای بک‌اند
    globals: true,
    include: [
      'src/**/*.test.{ts,js}',
      '*.test.{ts,js}'
    ],
    exclude: [
      'node_modules',
      'dist'
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});