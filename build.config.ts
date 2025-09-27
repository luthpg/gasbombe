import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  clean: true,
  declaration: 'compatible',
  entries: ['src/index.ts', 'src/cli.ts'],
  outDir: 'dist',
  rollup: {
    emitCJS: true,
    cjsBridge: true,
  },
  externals: ['consola', 'glob', 'ejs', 'commander', '@inquirer/prompts'],
});
