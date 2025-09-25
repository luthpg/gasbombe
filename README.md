# **GasBombe**

🛢 'Gasbombe' the TypeScript Project Generator for GoogleAppsScript.

This project provides both a command-line interface (CLI) and a WebAssembly (Wasm) module to scaffold new TypeScript projects for Google Apps Script, with templates for Vanilla TS and React.

## **Features**

* **CLI Tool**: Interactive command-line prompts to guide you through project setup.  
* **Wasm Module**: Use the generator logic directly in the browser or other JavaScript environments.  
* **Templates**:  
  * Vanilla TypeScript  
  * React with TSX  
* **Package Manager Support**: Works with npm, Yarn, and pnpm.

## **1. CLI Usage**

### **Installation**

Install the CLI tool directly using cargo:

```bash
# Replace with your actual repository URL  
cargo install --git https://github.com/luthpg/gasbombe.git gasbombe
```

### **How to Use**

Run the command and follow the interactive prompts:

```bash
gasbombe
```

You will be asked for:

1. Project name  
2. Package manager (npm, yarn, pnpm)  
3. Template (Vanilla TS, React)

The tool will create a new directory with the specified project name, generate the template files, and install the dependencies.

## **2. Wasm Module Usage**

### **Installation**

Install the Wasm package from npm:

```bash
# Replace with your actual package name  
npm install @ciderjs/gasbombe
```

### **How to Use**

You can import and use the run_generator function in your JavaScript/TypeScript code.

```ts
// Replace with your actual package name  
import init, { run_generator } from '@ciderjs/gasbombe';

// Initialize the Wasm module  
async function main() {  
  await init();

  const options = {  
    project_name: "my-gas-project-from-wasm",  
    package_manager: "npm", // "npm", "yarn", or "pnpm"  
    template_type: "vanilla-ts" // "vanilla-ts" or "react-tsx"  
  };

  try {  
    // This will create files and directories.  
    // Note: This operation may be restricted in a sandboxed browser environment.  
    await run_generator(options);  
    console.log("Project generated successfully\!");  
  } catch (error) {  
    console.error("Failed to generate project:", error);  
  }  
}

main();
```

**Note:** The Wasm-based generator **cannot** execute the npm install (or equivalent) step due to the sandboxed browser environment. It will only create the project files.

## **Development**

### **Prerequisites**

* [Rust](https://www.rust-lang.org/tools/install)  
* [wasm-pack](https://www.google.com/search?q=https://rustwasm.github.io/wasm-pack/installer/)  
* [Node.js](https://nodejs.org/)

### **Build**

To build the Wasm package locally:

```bash
# Navigate to the package directory  
cd package

# Run the build script  
npm run build
```

This will generate the necessary files (gasbombe\_bg.wasm, gasbombe.js, etc.) in the package directory.

## **License**

This project is licensed under the MIT License. See the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.
