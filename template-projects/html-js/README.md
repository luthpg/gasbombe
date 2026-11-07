# HTML + JavaScript + Vite + AppsScript

This template provides a minimal setup to build a Google Apps Script (GAS) Web App using Vanilla HTML/JavaScript with Vite and Rolldown, scaffolded by [Gasbombe](https://ciderlabs.link/docs/gasbombe).

Currently, these tools and plugins are configured:

- [Vite](https://vite.dev/) + [vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile) for bundling frontend assets into a single HTML file
- [vite-plugin-google-apps-script](https://github.com/luthpg/vite-plugin-google-apps-script) for sanitizing bundled output when using GAS scriptlets (`HtmlService.createTemplateFromFile()`)
- [rolldown](https://github.com/rolldown/rolldown) for transpiling and bundling server-side JavaScript files
- [Biome](https://biomejs.dev/) for linting and formatting
- [Vitest](https://vitest.dev/) for unit testing

## Notes on `vite-plugin-google-apps-script` (`gas()`)

By default, `vite.config.js` includes `gas()` from `vite-plugin-google-apps-script` to prevent syntax errors when evaluating GAS scriptlets (`<?= ... ?>` / `<?!= ... ?>`) via `HtmlService.createTemplateFromFile()`.

- **When you do NOT use scriptlets**: If you use `HtmlService.createHtmlOutputFromFile("index")` instead of `createTemplateFromFile()`, **you do not need `gas()`**. Removing `gas()` from `vite.config.js` is recommended to avoid unnecessary transformations (such as URL stripping in template literals, JSDoc removal, and forced Terser minification).
- **Caveats when keeping `gas()` enabled**:
  1. **Do NOT write URLs inside template literals (`` `https://.../${id}` ``)**: The plugin strips URL patterns (`http://`, `https://`, `//`, etc.) inside template literals at build time. Use string concatenation (`"https://.../" + id`) or `new URL()` instead, or exclude files via `gas({ url: { excludes: [...] } })`.
  2. **JSDoc comments (`/** ... */`) are removed**: The plugin strips JSDoc comments by default. You can customize this via `gas({ replace: { useDefault: false, replaceRules: [...] } })`.
  3. **Plugin order**: Always place `gas()` **before** `viteSingleFile()` in `vite.config.js`.

## Documentation

- [Gasbombe Official Reference](https://ciderlabs.link/docs/gasbombe)
