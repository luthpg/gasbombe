import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { consola } from 'consola';
import ejs from 'ejs';
import { glob } from 'glob';
import type { ProjectOptions } from '../types';

export async function runCommand(
  command: string,
  args: string[],
  cwd: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true,
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    child.on('error', (err) => {
      reject(err);
    });
  });
}

export async function generateProject({
  projectName,
  packageManager,
  templateType,
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
  } catch {
    // Directory dose not exits, which is what we want.
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
      dotRelative: true,
      follow: true,
      windowsPathsNoEscape: true,
    });

    for (const file of files) {
      const templatePath = path.join(dir, file);
      const outputPath = path.join(outputDir, file.replace('.ejs', ''));

      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      const templateContent = await fs.readFile(templatePath, {
        encoding: 'utf-8',
      });
      const renderedContent = ejs.render(templateContent, ejsData);
      await fs.writeFile(outputPath, renderedContent);
    }
  }

  consola.start(`Installing dependencies with ${packageManager}...`);
  try {
    await runCommand(packageManager, ['install'], outputDir);
    consola.success(`Dependencies installed successfully.`);
  } catch (e) {
    consola.fail('Failed to install dependencies.');
    consola.error(e);
    process.exit(1);
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
  } catch {
    consola.fail('Failed to initialize Git repository. Please do it manually.');
  }

  consola.success(`Project '${projectName}' created successfully!`);
  consola.log(`\nTo get started, run:\n`);
  projectName !== '.' && consola.log(`  cd ${projectName}`);
  templateType !== 'vanilla-ts'
    ? consola.log(`  ${packageManager} dev`)
    : consola.log(`  ...and write your GAS code!`);
}
