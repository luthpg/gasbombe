# Vue 3 + TypeScript + Vite + AppsScript (CiderJS)

This template should help get you started developing with Vue 3 and TypeScript in Vite with an Apps Script Backend, scaffolded by [Gasbombe](https://ciderlabs.link/docs/gasbombe). The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

Currently, these plugins and tools are configured:

- [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue) for Vue 3 SFC support
- [vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile) for bundling frontend assets into a single HTML file
- [vite-plugin-google-apps-script](https://github.com/luthpg/vite-plugin-google-apps-script) for sanitizing bundled output when using GAS scriptlets (`HtmlService.createTemplateFromFile()`)
- [@ciderjs/gasnuki](https://github.com/luthpg/gasnuki) for Type Definition Bridge
- [@ciderjs/city-gas](https://github.com/luthpg/city-gas) for Router
- [@ciderjs/vitest-plugin-gas-mock](https://github.com/luthpg/vitest-plugin-gas-mock) for GAS API Mocking in Vitest
- [rolldown](https://github.com/rolldown/rolldown) for transpiling TypeScript files and bundling server-side files

## Notes on `vite-plugin-google-apps-script` (`gas()`)

By default, `vite.config.ts` includes `gas()` from `vite-plugin-google-apps-script` to prevent syntax errors when evaluating GAS scriptlets (`<?= ... ?>` / `<?!= ... ?>`) via `HtmlService.createTemplateFromFile()`.

- **When you do NOT use scriptlets**: If you use `HtmlService.createHtmlOutputFromFile("index")` instead of `createTemplateFromFile()`, **you do not need `gas()`**. Removing `gas()` from `vite.config.ts` is recommended to avoid unnecessary transformations (such as URL stripping in template literals, JSDoc removal, and forced Terser minification).
- **Caveats when keeping `gas()` enabled**:
  1. **Do NOT write URLs inside template literals (`` `https://.../${id}` ``)**: The plugin strips URL patterns (`http://`, `https://`, `//`, etc.) inside template literals at build time. Use string concatenation (`"https://.../" + id`) or `new URL()` instead, or exclude files via `gas({ url: { excludes: [...] } })`.
  2. **JSDoc comments (`/** ... */`) are removed**: The plugin strips JSDoc comments by default. You can customize this via `gas({ replace: { useDefault: false, replaceRules: [...] } })`.
  3. **Plugin order**: Always place `gas()` **before** `viteSingleFile()` in `vite.config.ts`.

## Using Clasp authentication in CI/CD workflow with @ciderjs/clasp-auth

You can upload your Clasp authentication json file to your GitHub repository, and use it in CI/CD cycle.

0. Log in with @google/clasp, GitHub CLI
1. `pnpm run auth repoOwner/repoName` * replace with repository name
2. Push code, and set Version Tag in GitHub
3. ...and your codes are pushed and deployed to Apps-Script!

## Documentation

- [Gasbombe Official Reference](https://ciderlabs.link/docs/gasbombe)
