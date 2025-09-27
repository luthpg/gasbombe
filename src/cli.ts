#!/usr/bin/env node

import { input, select } from '@inquirer/prompts';
import { Command } from 'commander';
import { version } from '../package.json';
import type { ClaspOption, PackageManager, TemplateType } from '../types/index';
import { generateProject } from './index';

export async function main(): Promise<void> {
  const program = new Command();

  program.version(version, '-v, --version');

  program
    .description('Create project for GoogleAppsScript')
    .option(
      '-n, --name [projectName]',
      'Project name what you want to generate',
      '',
    )
    .option(
      '-p, --pkg [packageManager]',
      'Package manager what you want to use ("npm" | "pnpm" | "yarn")',
      '',
    )
    .option(
      '-t, --template [templateType]',
      'Project template label ("vanilla-ts" | "react-tsx")',
      '',
    )
    .option(
      '-c, --clasp [claspSetupCommand]',
      'Setup command how you want to use for Apps Script Project (create project | select project | input project id | skip)\n* If you use "create" or "select", you need to login to clasp first',
      '',
    )
    .option(
      '--skipInstall',
      'Skip install dependencies after generating the project',
      false,
    )
    .action(async (_param, command: Command) => {
      let {
        name: projectName,
        pkg: packageManager,
        template: templateType,
        clasp,
        skipInstall,
      } = command.opts<{
        name: string;
        pkg: PackageManager;
        template: TemplateType;
        clasp: ClaspOption;
        skipInstall: boolean;
      }>();

      let claspProjectId: string | undefined;

      try {
        projectName ||= await input({
          message: 'Input project name what you want to generate...',
        });

        templateType ||= await select<TemplateType>({
          message: 'Choice project template...',
          choices: [
            { name: 'vanilla-ts', value: 'vanilla-ts' },
            { name: 'react-tsx', value: 'react-tsx' },
          ],
        });

        clasp ||= await select<ClaspOption>({
          message: 'How do you want to set up the Apps Script project?\n* If you use "create" or "select", you need to login to clasp first',
          choices: [
            {
              name: '[NEW] Create a new Apps Script project (need `npx @google/clasp login`)',
              value: 'create',
              description:
                'Runs `npx @google/clasp create` to generate a new project.',
            },
            {
              name: '[SELECT] Use an existing Apps Script project (need `npx @google/clasp login`)',
              value: 'list',
              description:
                'Runs `npx @google/clasp list` and lets you choose from your projects.',
            },
            {
              name: '[INPUT] Input Script ID manually',
              value: 'input',
              description: 'Manually provide an existing Script ID.',
            },
            {
              name: '[NONE] Skip for now',
              value: 'skip',
              description:
                'Create a `.clasp.json` file without Apps Script project ID.',
            },
          ],
        });

        if (clasp === 'input') {
          claspProjectId = await input({
            message: 'Input Apps Script project ID...',
            required: false,
          });
        }

        if (
          packageManager === ('' as PackageManager) &&
          clasp !== 'create' && clasp !== 'list' &&
          skipInstall
        ) {
          packageManager = 'npm';
        }

        packageManager ||= await select<PackageManager>({
          message: 'Choice package manager what you want to use...',
          choices: [
            { name: 'npm', value: 'npm' },
            { name: 'pnpm', value: 'pnpm' },
            { name: 'yarn', value: 'yarn' },
          ],
        });
      } catch (e) {
        (e as Error).message === 'User force closed the prompt with SIGINT' &&
          process.exit(0);
        throw e as Error;
      }

      await generateProject({
        projectName,
        packageManager,
        templateType,
        clasp,
        claspProjectId,
        install: !skipInstall,
      });
    });

  program.parse(process.argv);
}

main();
