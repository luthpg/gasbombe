# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## Using Clasp authentication in CI/CD workflow with @ciderjs/clasp-auth

You can upload your Clasp authentication json file to your Github repository, and use it in CI/CD cycle.

0. Log in with @google/clasp, GitHub CLI
1. `pnpm run auth repoOwner/repoName` * replace with repository name
2. Push code, and set Version Tag in GitHub
3. ...and your codes are pushed and deployed to Apps-Script!
