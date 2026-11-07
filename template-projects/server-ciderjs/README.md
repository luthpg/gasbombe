# TypeScript + AppsScript (CiderJS)

This template provides a minimal setup to get TypeScript working for an Apps Script Backend with CiderJS utilities, scaffolded by [Gasbombe](https://ciderlabs.link/docs/gasbombe).

Currently, these plugins and tools are configured:

- [@ciderjs/gasnuki](https://github.com/luthpg/gasnuki) for Type Definition Bridge
- [@ciderjs/city-gas](https://github.com/luthpg/city-gas) for Router
- [@ciderjs/vitest-plugin-gas-mock](https://github.com/luthpg/vitest-plugin-gas-mock) for GAS API Mocking in Vitest
- [rolldown](https://github.com/rolldown/rolldown) for transpiling TypeScript files and bundling server-side files

## Using Clasp authentication in CI/CD workflow with @ciderjs/clasp-auth

You can upload your Clasp authentication json file to your GitHub repository, and use it in CI/CD cycle.

0. Log in with @google/clasp, GitHub CLI
1. `pnpm run auth repoOwner/repoName` * replace with repository name
2. Push code, and set Version Tag in GitHub
3. ...and your codes are pushed and deployed to Apps-Script!

## Documentation

- [Gasbombe Official Reference](https://ciderlabs.link/docs/gasbombe)
