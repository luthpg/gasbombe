/// <reference types="vitest" />

import { gasnuki } from '@ciderjs/gasnuki/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { gas } from 'vite-plugin-google-apps-script';
import { viteSingleFile } from 'vite-plugin-singlefile';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: 'dist',
  },
  test: {
    coverage: {
      include: ['src/**/*.ts', 'src/**/*.tsx', 'server/**/*.ts'],
    },
  },
  plugins: [
    react(),
    tsconfigPaths(),
    gasnuki({
      srcDir: 'server',
      outDir: 'types/appsscript',
      outputFile: 'client.ts',
    }),
    gas(),
    viteSingleFile(),
  ],
});
