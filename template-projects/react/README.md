# React + TypeScript + Vite + AppsScript

This template provides a minimal setup to get React working in Vite with HMR and an Apps Script Backend, scaffolded by [Gasbombe](https://ciderlabs.link/docs/gasbombe).

Currently, these plugins and tools are configured:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) for Fast Refresh
- [vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile) for bundling frontend assets into a single HTML file
- [vite-plugin-google-apps-script](https://github.com/luthpg/vite-plugin-google-apps-script) for sanitizing bundled output when using GAS scriptlets (`HtmlService.createTemplateFromFile()`)
- [rolldown](https://github.com/rolldown/rolldown) for transpiling TypeScript files and bundling server-side files

## Notes on `vite-plugin-google-apps-script` (`gas()`)

By default, `vite.config.ts` includes `gas()` from `vite-plugin-google-apps-script` to prevent syntax errors when evaluating GAS scriptlets (`<?= ... ?>` / `<?!= ... ?>`) via `HtmlService.createTemplateFromFile()`.

- **When you do NOT use scriptlets**: If you use `HtmlService.createHtmlOutputFromFile("index")` instead of `createTemplateFromFile()`, **you do not need `gas()`**. Removing `gas()` from `vite.config.ts` is recommended to avoid unnecessary transformations (such as URL stripping in template literals, JSDoc removal, and forced Terser minification).
- **Caveats when keeping `gas()` enabled**:
  1. **Do NOT write URLs inside template literals (`` `https://.../${id}` ``)**: The plugin strips URL patterns (`http://`, `https://`, `//`, etc.) inside template literals at build time. Use string concatenation (`"https://.../" + id`) or `new URL()` instead, or exclude files via `gas({ url: { excludes: [...] } })`.
  2. **JSDoc comments (`/** ... */`) are removed**: The plugin strips JSDoc comments by default. You can customize this via `gas({ replace: { useDefault: false, replaceRules: [...] } })`.
  3. **Plugin order**: Always place `gas()` **before** `viteSingleFile()` in `vite.config.ts`.

## Documentation

- [Gasbombe Official Reference](https://ciderlabs.link/docs/gasbombe)
