#!/usr/bin/env node

import { input, select } from '@inquirer/prompts';
import { Command } from 'commander';
import { version } from './../package.json';
import type { ProjectOptions } from '../types/index';
import { generateProject } from './index';

export async function main(): Promise<void> {
  const program = new Command();

  program.version(version, '-v, --version');

  program
    .description('Create project for GoogleAppsScript')
    .option(
      '--name [projectName]',
      'Project name what you want to generate',
      '',
    )
    .option(
      '--pkg [packageManager]',
      'Package manager what you want to use ("npm" | "pnpm" | "yarn")',
      '',
    )
    .option(
      '--template [templateType]',
      'Project template label ("vanilla-ts" | "react-tsx")',
      '',
    )
    .action(async (_param, command: Command) => {
      let {
        name: projectName,
        pkg: packageManager,
        template: templateType,
      } = command.opts<{
        name: string;
        pkg: ProjectOptions['packageManager'];
        template: ProjectOptions['templateType'];
      }>();
      try {
        projectName ||= await input({
          message: 'Input project name what you want to generate...',
        });
        packageManager ||= await select<ProjectOptions['packageManager']>({
          message: 'Choise package manager what you want to use...',
          choices: ['npm', 'pnpm', 'yarn'],
        });
        templateType ||= await select<ProjectOptions['templateType']>({
          message: 'Choise project template...',
          choices: ['vanilla-ts', 'react-tsx'],
        });
      } catch (e) {
        (e as Error).message === 'User force closed the prompt with SIGINT' &&
          process.exit(0);
        throw e as Error;
      }
      await generateProject({ projectName, packageManager, templateType });
    });

  program.parse(process.argv);
}

main();
