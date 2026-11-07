# **Gasbombe**

[![README-ja](https://img.shields.io/badge/日本語-blue?logo=ReadMe)](./README.ja.md)
[![Docs](https://img.shields.io/badge/docs-ciderlabs.link-blue)](https://ciderlabs.link/docs/gasbombe)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@ciderjs/gasbombe.svg)](https://www.npmjs.com/package/@ciderjs/gasbombe)
[![NPM Downloads](https://img.shields.io/npm/dw/@ciderjs/gasbombe)](https://www.npmjs.com/package/@ciderjs/gasbombe)
[![GitHub issues](https://img.shields.io/github/issues/luthpg/gasbombe.svg)](https://github.com/luthpg/gasbombe/issues)

🛢 'Gasbombe' — The TypeScript & Frontend Project Generator for Google Apps Script.

This project provides a command-line interface (CLI) and Node.js API to scaffold modern Google Apps Script (GAS) projects with templates for Server-side TypeScript/JavaScript, React, Vue 3, HTML/JS, and CiderJS-integrated stacks, complete with out-of-the-box AI coding agent configurations.

## **Official Reference**

Full documentation, template architecture guides, CLI options, and programmatic API references are available at:

* **[https://ciderlabs.link/docs/gasbombe](https://ciderlabs.link/docs/gasbombe)**

## **Features**

* **CLI & Programmatic API**: Interactive command-line prompts to guide you through project setup, plus a `generateProject` API for scripting and CI/CD automation.
* **8 Ready-to-Use Templates**:
  * **Server-side**: `server-ts` (TypeScript), `server-js` (JavaScript), `server-ciderjs` (TypeScript + CiderJS)
  * **SPA / Web App**: `react` (React 19 + TS), `react-ciderjs` (React 19 + TS + CiderJS), `vue` (Vue 3 + TS), `vue-ciderjs` (Vue 3 + TS + CiderJS), `html-js` (Vanilla HTML/JS)
* **Modern Build & Test Toolchain**:
  * Fast server-side bundling powered by [Rolldown](https://rolldown.rs/)
  * Single-file HTML bundling for GAS Web Apps powered by [Vite](https://vite.dev/) and `vite-plugin-singlefile`
  * Formatting and linting with [Biome](https://biomejs.dev/) and unit testing with [Vitest](https://vitest.dev/)
* **CiderJS Ecosystem Integration (`*-ciderjs` templates)**:
  * [`@ciderjs/gasnuki`](https://github.com/luthpg/gasnuki): Automatic type definition bridge between GAS server functions and frontend client code
  * [`@ciderjs/city-gas`](https://github.com/luthpg/city-gas): Type-safe routing for GAS Web Apps
  * [`@ciderjs/vitest-plugin-gas-mock`](https://github.com/luthpg/vitest-plugin-gas-mock): Type-safe GAS global service mocking in Vitest
  * [`@ciderjs/clasp-auth`](https://github.com/luthpg/clasp-auth): Automated GitHub Actions CI/CD deployment workflow with Clasp authentication
* **AI Agent-Ready**: Out-of-the-box support for AI coding assistants (Claude Code, Cursor, GitHub Copilot, Gemini / Antigravity, OpenAI Codex) with pre-configured rules (`.agents/rules/`) and actionable workflows (`.agents/skills/`) dynamically tailored to the chosen template.
* **Package Manager Support**: Works seamlessly with `npm`, `pnpm`, and `yarn`.

## **AI Agent-Ready Architecture (`.agents`)**

Every scaffolded project includes a comprehensive set of AI coding agent configuration files tailored to guide AI assistants toward generating robust, idiomatically sound Google Apps Script code:

* **Master Guide (`.agents/AGENTS.md`)**: Project architecture overview, core lifecycle commands, and critical constraints.
* **Rules (`.agents/rules/`)**: Strict rules covering GAS sandbox limitations (banning Node.js/DOM APIs, spreadsheet cell batching), Biome code style, template architecture (`server`, `spa`, `ciderjs`), and anti-patterns.
* **Skills (`.agents/skills/`)**: Executable, step-by-step workflows for adding server functions/endpoints, adding UI components, mocking GAS APIs with Vitest, building, pushing with clasp, and deploying.
* **Agent Entrypoints**: Automatically pre-configured root instruction files for major AI tools:
  * `CLAUDE.md` (Claude Code)
  * `GEMINI.md` (Gemini / Google Antigravity)
  * `CODEX.md` (OpenAI Codex / ChatGPT)
  * `.cursor/rules/gasbombe.mdc` (Cursor)
  * `.github/copilot-instructions.md` (GitHub Copilot)

## **Usage**

### **Installation**

You can run the CLI directly without installing it globally using `npx`, `pnpm dlx`, or `yarn dlx`:

```bash
# npm
npx @ciderjs/gasbombe

# pnpm
pnpm dlx @ciderjs/gasbombe

# yarn
yarn dlx @ciderjs/gasbombe
```

Or install it globally:

```bash
npm install -g @ciderjs/gasbombe
```

### **How to Use**

Run the command and follow the interactive prompts:

```bash
gasbombe
```

You will be asked for:

1. **Project name** (or `.` to scaffold in the current directory)
2. **Project template** (`server-ts`, `server-js`, `server-ciderjs`, `react`, `react-ciderjs`, `vue`, `vue-ciderjs`, `html-js`)
3. **Apps Script project setup (`.clasp.json`)** (`create`, `list`, `input`, `skip`)
4. **Package manager** (`npm`, `pnpm`, `yarn`, or skip installation)
5. **Git repository initialization** (`true` / `false`)

The tool will create the project directory, render the template files, configure `.clasp.json`, install dependencies, and initialize a Git repository.

### **CLI Options**

You can bypass the interactive prompts by providing command-line options. This is useful for scripting and CI/CD automation.

```bash
# Example: Create a new React + CiderJS project with pnpm and create a new Apps Script project
gasbombe --name my-react-app --template react-ciderjs --clasp create --pkg pnpm --git
```

| Option | Alias | Argument | Description | Choices |
| :--- | :--- | :--- | :--- | :--- |
| `--name` | `-n` | `[projectName]` | The name of the project to generate (or `.` for current directory). | - |
| `--template` | `-t` | `[templateType]` | The project template to use. | `server-ts`, `server-js`, `server-ciderjs`, `react`, `react-ciderjs`, `vue`, `vue-ciderjs`, `html-js` |
| `--clasp` | `-c` | `[claspOption]` | How to set up the `.clasp.json` file.<br/>`create` and `list` require prior login to clasp (`npx @google/clasp login`). | `create`, `list`, `input`, `skip` |
| `--pkg` | `-p` | `[packageManager]` | The package manager to use. | `npm`, `pnpm`, `yarn` |
| `--skipInstall` | | | Skip installing dependencies. | - |
| `--git` | `-g` | `[boolean]` | Initialize Git repository (default: `true`). | `true`, `false` |
| `--skipGit` | | | Skip Git repository initialization. | - |

If any of these options are omitted, you will be prompted to enter the value interactively.

### **Programmatic API**

You can also use `@ciderjs/gasbombe` programmatically in Node.js scripts:

```typescript
import { generateProject, type ProjectOptions } from "@ciderjs/gasbombe";

const options: ProjectOptions = {
  projectName: "my-gas-app",
  packageManager: "pnpm",
  templateType: "react-ciderjs",
  clasp: "skip",
  install: true,
  git: true,
};

await generateProject(options);
```

See the [Official Reference](https://ciderlabs.link/docs/gasbombe) for advanced recipes and API details.

## **Development**

### **Prerequisites**

* [Node.js](https://nodejs.org/) (`>= 22`)
* [pnpm](https://pnpm.io/installation)

### **Setup**

Clone the repository and install the dependencies:

```bash
git clone https://github.com/luthpg/gasbombe.git
cd gasbombe
pnpm install
```

### **Build & Test**

To build the project locally (type-check, bundle CLI, and generate templates into `dist/`):

```bash
pnpm run build
```

To run the unit and template verification test suites:

```bash
pnpm run test
```

To update dependencies across all template projects (preserving TypeScript 5.x compatibility for Vue templates):

```bash
pnpm run up:templates
```

## **License**

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
