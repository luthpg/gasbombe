import path from 'node:path';
import alias from '@rollup/plugin-alias';
import { defineConfig } from 'rolldown';
import { removeExportPlugin } from 'rolldown-plugin-remove-export';

const outputFile = 'index.js';

export default defineConfig({
  input: 'server/app.ts',
  output: {
    format: 'esm',
    file: `dist/${outputFile}`,
  },
  plugins: [
    alias({
      entries: [
        {
          find: '~',
          replacement: path.resolve(__dirname),
        },
      ],
    }),
    removeExportPlugin(outputFile),
  ],
});
