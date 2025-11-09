# React + TypeScript + Vite + AppsScript

This template provides a minimal setup to get React working in Vite with HMR and Apps Script Backend.

Currently, these plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
- [@ciderjs/gasnuki](https://github.com/luthpg/gasnuki) for Type Definition Bridge
- [@ciderjs/city-gas](https://github.com/luthpg/city-gas) for Router
- [rolldown](https://github.com/rolldown/rolldown) for transpile TypeScript files and bundle files

## Using Clasp authentication in CI/CD workflow with @ciderjs/clasp-auth

You can upload your Clasp authentication json file to your Github repository, and use it in CI/CD cycle.

0. Log in with @google/clasp, GitHub CLI
1. `pnpm run auth repoOwner/repoName` * replace with repository name
2. Push code, and set Version Tag in GitHub
3. ...and your codes are pushed and deployed to Apps-Script!
