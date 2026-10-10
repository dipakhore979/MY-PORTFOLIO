import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    setupFiles: ['./tests/helpers/setup.js'],
    // All files share one test database, so run them one after another
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 30000,
  },
});
