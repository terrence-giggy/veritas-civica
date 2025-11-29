import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    include: ['tests/lib/**/*.test.ts'],
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/lib/content/**', 'src/lib/integrations/**'],
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '$lib': resolve(__dirname, './src/lib'),
    },
  },
});
