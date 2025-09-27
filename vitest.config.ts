import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Exclude template projects from the test run
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
      'template-projects',
    ],
  },
});
