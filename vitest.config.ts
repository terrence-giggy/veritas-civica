import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/lib/**/*.test.ts'],
    globals: true,
    environment: 'node',
    alias: {
      '$lib': '/home/ubuntu/veritas-civica/src/lib',
    },
    coverage: {
      provider: 'v8',
      include: ['src/lib/content/**', 'src/lib/integrations/**'],
      reporter: ['text', 'json', 'html'],
    },
  },
});
