import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { select } from '@inquirer/prompts';
import { consola } from 'consola';
import ejs from 'ejs';
import { glob } from 'glob';
import type { ProjectOptions } from '../types';

export async function runCommand(
  command: string,
  args: string[],
  cwd: string,
  capture = false,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: capture ? 'pipe' : 'inherit',
      shell: true,
    });

    let stdout = '';
    let stderr = '';

    if (capture) {
      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
    }

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        const errorMsg = `Command failed with exit code ${code}${stderr ? `:\n${stderr}` : ''}`;
        reject(new Error(errorMsg));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

async function handleClaspSetup(
  claspOption: ProjectOptions['clasp'],
  projectName: string,
  outputDir: string,
  claspProjectId: string | undefined,
  packageManager: ProjectOptions['packageManager'] = 'npm',
): Promise<void> {
  if (claspOption === 'skip') {
    return;
  }

  const npxLikeCommand =
    packageManager === 'npm'
      ? 'npx'
      : packageManager === 'pnpm'
        ? 'pnpx'
        : 'yarn';

  consola.start('Setting up .clasp.json...');

  try {
    await runCommand(npxLikeCommand, ['@google/clasp', 'status'], outputDir);
  } catch {
    consola.error(
      `It seems you are not logged in to clasp. Please run \`${npxLikeCommand} @google/clasp login\` and try again.`,
    );
    return;
  }

  let scriptId: string | undefined;

  switch (claspOption) {
    case 'create':
      try {
        const result = await runCommand(
          npxLikeCommand,
          [
            '@google/clasp',
            'create',
            '--title',
            `"${projectName}"`,
            '--type',
            'standalone',
          ],
          outputDir,
          true,
        );
        const match = result.match(/Created new script: (.*)/);
        if (match?.[1]) {
          scriptId = match[1];
          consola.info(`Created new Apps Script project with ID: ${scriptId}`);
        } else {
          throw new Error('Could not parse scriptId from clasp output.');
        }
      } catch (e) {
        consola.error('Failed to create new Apps Script project.', e);
        return;
      }
      break;

    case 'list':
      try {
        const listOutput = await runCommand(
          npxLikeCommand,
          ['@google/clasp', 'list'],
          outputDir,
          true,
        );
        const projects = listOutput
          .split('\n')
          .slice(1) // Skip header
          .map((line) => {
            const parts = line.split(' - ');
            if (parts.length >= 2) {
              return { name: parts[0]?.trim(), value: parts[1]?.trim() };
            }
            return null;
          })
          .filter((p): p is { name: string; value: string } => p !== null);

        if (projects.length === 0) {
          consola.warn(
            'No existing Apps Script projects found. Please create one first.',
          );
          return;
        }

        scriptId = await select({
          message: 'Choose an existing Apps Script project:',
          choices: projects,
        });
      } catch (e) {
        consola.error('Failed to list Apps Script projects.', e);
        return;
      }
      break;

    case 'input':
      scriptId = claspProjectId;
      break;
  }

  if (scriptId) {
    const claspJsonPath = path.join(outputDir, '.clasp.json');
    let claspJson: { scriptId: string; [key: string]: string | string[] } = {
      scriptId,
    };
    let successMessage = `.clasp.json created successfully with scriptId: ${scriptId}`;

    try {
      const existingContent = await fs.readFile(claspJsonPath, 'utf-8');
      const existingJson = JSON.parse(existingContent);
      claspJson = { ...existingJson, scriptId };
      successMessage = `.clasp.json updated successfully with scriptId: ${scriptId}`;
    } catch {
      // If file doesn't exist or is invalid, we'll just create a new one.
    }

    const claspJsonContent = JSON.stringify(claspJson, null, 2);
    await fs.writeFile(claspJsonPath, claspJsonContent, { encoding: 'utf-8' });
    consola.success(successMessage);
  }
}

export async function generateProject({
  projectName,
  packageManager,
  templateType,
  clasp,
  claspProjectId,
  install,
}: ProjectOptions): Promise<void> {
  const outputDir = path.resolve(process.cwd(), projectName);
  const templateBaseDir = path.resolve(__dirname, '..', 'dist', 'templates');
  const commonTemplateDir = path.resolve(templateBaseDir, 'common');
  const specificTemplateDir = path.resolve(templateBaseDir, templateType);

  consola.start(
    `Creating a new Project for GoogleAppsScript in ${outputDir}...`,
  );

  try {
    await fs.access(outputDir);
    consola.error(`Directory ${projectName} already exists.`);
    process.exit(1);
    return;
  } catch {
    // Directory does not exist, which is what we want.
  }

  await fs.mkdir(outputDir, { recursive: true });
  consola.info(`Generating project files from template '${templateType}'...`);

  const ejsData = { projectName };
  const templateDirs = [commonTemplateDir, specificTemplateDir];
  for (const dir of templateDirs) {
    const files = await glob('./**/*', {
      cwd: dir,
      nodir: true,
      dot: true,
    });

    for (const file of files) {
      const relativePath = path.relative(dir, path.resolve(dir, file));
      const templatePath = path.join(dir, relativePath);
      const outputPath = path.join(outputDir, relativePath.replace('.ejs', ''));

      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      const templateContent = await fs.readFile(templatePath, {
        encoding: 'utf-8',
      });
      const renderedContent = ejs.render(templateContent, ejsData);
      await fs.writeFile(outputPath, renderedContent);
    }
  }

  await handleClaspSetup(clasp, projectName, outputDir, claspProjectId, packageManager);

  if (install) {
    consola.start(`Installing dependencies with ${packageManager}...`);
    try {
      await runCommand(packageManager, ['install'], outputDir);
      consola.success(`Dependencies installed successfully.`);
    } catch (e) {
      consola.fail('Failed to install dependencies. Please do it manually.');
      consola.error(e);
    }
  }

  consola.start(`Initializing Git repository...`);
  try {
    await runCommand('git', ['init'], outputDir);
    await runCommand('git', ['add', '-A'], outputDir);
    await runCommand(
      'git',
      ['commit', '-m', '"Initial commit from gasbombe"'],
      outputDir,
    );
    consola.success(`Git repository initialized successfully.`);
  } catch (e) {
    consola.fail('Failed to initialize Git repository. Please do it manually.');
    consola.error(e);
  }

  consola.success(`Project '${projectName}' created successfully!`);
  consola.log(`\nTo get started, run:\n`);
  projectName !== '.' && consola.log(`  cd ${projectName}`);
  templateType !== 'vanilla-ts'
    ? consola.log(`  ${packageManager} dev`)
    : consola.log(`  ...and write your GAS code!`);
}
