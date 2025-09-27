# **Gasbombe**

[![README-ja](https://img.shields.io/badge/日本語-blue?logo=ReadMe)](./README.ja.md)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@ciderjs/gasbombe.svg)](https://www.npmjs.com/package/@ciderjs/gasbombe)
[![GitHub issues](https://img.shields.io/github/issues/luthpg/gasbombe.svg)](https://github.com/luthpg/gasbombe/issues)

🛢 'Gasbombe' the TypeScript Project Generator for GoogleAppsScript.

This project provides a command-line interface (CLI) to scaffold new TypeScript projects for Google Apps Script, with templates for Vanilla TS and React.

## **Features**

* **CLI Tool**: Interactive command-line prompts to guide you through project setup.
* **Templates**:
  * Vanilla TypeScript
  * React with TSX
* **Package Manager Support**: Works with npm, Yarn, and pnpm.

## **Usage**

### **Installation**

You can use `npx` to run the CLI without installing it globally:

```bash
npx @ciderjs/gasbombe
```

Or, you can install it globally:

```bash
npm install -g @ciderjs/gasbombe
```

### **How to Use**

Run the command and follow the interactive prompts:

```bash
gasbombe
```

You will be asked for:

1. Project name
2. Project template (Vanilla TS, React)
3. How to set up the Apps Script project (`.clasp.json`)
4. Package manager (npm, yarn, pnpm)

The tool will create a new directory with the specified project name, generate the template files, and install the dependencies.

### **CLI Options**

You can bypass the interactive prompts by providing command-line options. This is useful for scripting and automation.

```bash
# Example: Create a new React project with pnpm, creating a new Apps Script project along with it
gasbombe --name my-react-app --template react-tsx --clasp create --pkg pnpm
```

| Option | Alias | Argument | Description | Choices |
| :--- | :--- | :--- | :--- | :--- |
| `--name` | `-n` | `[projectName]` | The name of the project to generate. | - |
| `--template` | `-t` | `[templateType]` | The project template to use. | `vanilla-ts`, `react-tsx` |
| `--clasp` | `-c` | `[claspOption]` | How to set up the `.clasp.json` file.<br/>`create` and `list` require prior login to clasp. | `create`, `list`, `input`, `skip` |
| `--pkg` | `-p` | `[packageManager]` | The package manager to use. | `npm`, `pnpm`, `yarn` |
| `--skipInstall` | | | Skip installing dependencies. | - |

If any of these options are omitted, you will be prompted to enter the value interactively.

## **Development**

### **Prerequisites**

* [Node.js](https://nodejs.org/)
* [pnpm](https://pnpm.io/installation)

### **Setup**

Clone the repository and install the dependencies:

```bash
git clone https://github.com/luthpg/gasbombe.git
cd gasbombe
pnpm install
```

### **Build**

To build the project locally:

```bash
pnpm run build
```

This will generate the necessary files in the `dist` directory.

## **License**

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
