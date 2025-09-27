import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { spawn } from 'node:child_process';
import type { EventEmitter } from 'node:events';
import fs from 'node:fs/promises';
import path from 'node:path';
import { select } from '@inquirer/prompts';
import { consola } from 'consola';
import ejs from 'ejs';
import { glob } from 'glob';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateProject, runCommand } from '../src/index';

// Mock all dependencies
vi.mock('node:child_process');
vi.mock('node:fs/promises');
vi.mock('@inquirer/prompts');
vi.mock('consola');
vi.mock('ejs');
vi.mock('glob');

// Helper to create a mock process
const createMockProcess = (): ChildProcessWithoutNullStreams & EventEmitter => {
  const mockProcess = new (require('events')
    .EventEmitter)() as ChildProcessWithoutNullStreams & EventEmitter;
  mockProcess.stdout = new (require('stream').Readable)();
  mockProcess.stderr = new (require('stream').Readable)();
  mockProcess.stdout._read = () => {};
  mockProcess.stderr._read = () => {};
  return mockProcess;
};

describe('runCommand', () => {
  let mockProcess: ChildProcessWithoutNullStreams & EventEmitter;

  beforeEach(() => {
    mockProcess = createMockProcess();
    vi.mocked(spawn).mockReturnValue(mockProcess);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should execute a command without capturing output', async () => {
    const promise = runCommand('ls', ['-la'], '/fake/dir');
    mockProcess.emit('close', 0);
    await expect(promise).resolves.toBe('');
    expect(spawn).toHaveBeenCalledWith('ls', ['-la'], {
      cwd: '/fake/dir',
      stdio: 'inherit',
      shell: true,
    });
  });

  it('should execute a command and capture output', async () => {
    const promise = runCommand('echo', ['hello'], '/fake/dir', true);
    mockProcess.stdout.emit('data', 'hello ');
    mockProcess.emit('close', 0);
    await expect(promise).resolves.toBe('hello');
    expect(spawn).toHaveBeenCalledWith('echo', ['hello'], {
      cwd: '/fake/dir',
      stdio: 'pipe',
      shell: true,
    });
  });

  it('should reject on non-zero exit code', async () => {
    const promise = runCommand('error-command', [], '/fake/dir', true);
    mockProcess.stderr.emit('data', 'Something went wrong');
    mockProcess.emit('close', 1);
    await expect(promise).rejects.toThrow(
      'Command failed with exit code 1:\nSomething went wrong',
    );
  });

  it('should reject on non-zero exit code without stderr', async () => {
    const promise = runCommand('error-command', [], '/fake/dir', false);
    mockProcess.emit('close', 1);
    await expect(promise).rejects.toThrow('Command failed with exit code 1');
  });

  it('should reject on spawn error', async () => {
    const error = new Error('Spawn error');
    const promise = runCommand('any-command', [], '/fake/dir');
    mockProcess.emit('error', error);
    await expect(promise).rejects.toThrow(error);
  });
});

describe('generateProject', () => {
  const projectOptions = {
    projectName: 'test-project',
    packageManager: 'pnpm' as const,
    templateType: 'react-tsx' as const,
    clasp: 'skip' as const,
    claspProjectId: undefined,
    install: false,
  };

  beforeEach(() => {
    // Default mocks for a successful run
    vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT')); // File doesn't exist
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue('template content');
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
    vi.mocked(glob).mockResolvedValue(['file1.js.ejs', 'file2.css']);
    vi.mocked(ejs.render).mockReturnValue('rendered content');
    vi.spyOn(process, 'exit').mockImplementation((() => {}) as (
      code?: string | number | null,
    ) => never);

    // Default mock for spawn: all commands succeed
    vi.mocked(spawn).mockImplementation(() => {
      const mockProcess = createMockProcess();
      process.nextTick(() => mockProcess.emit('close', 0));
      return mockProcess;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Use restoreAllMocks for spies
  });

  it('should exit if project directory already exists', async () => {
    vi.mocked(fs.access).mockResolvedValue(undefined); // File exists

    await generateProject(projectOptions);

    expect(consola.error).toHaveBeenCalledWith(
      'Directory test-project already exists.',
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should create project files from templates', async () => {
    const outputDir = path.resolve(process.cwd(), projectOptions.projectName);
    await generateProject(projectOptions);

    expect(fs.mkdir).toHaveBeenCalledWith(outputDir, { recursive: true });
    expect(glob).toHaveBeenCalledTimes(2); // common and specific
    expect(fs.readFile).toHaveBeenCalledTimes(4); // 2 files * 2 dirs
    expect(ejs.render).toHaveBeenCalledTimes(4);
    expect(fs.writeFile).toHaveBeenCalledTimes(4);
    expect(consola.start).toHaveBeenCalledWith(
      expect.stringContaining('Creating a new Project'),
    );
    expect(consola.info).toHaveBeenCalledWith(
      expect.stringContaining('Generating project files'),
    );
  });

  it('should initialize git repository', async () => {
    await generateProject(projectOptions);
    const outputDir = path.resolve(process.cwd(), projectOptions.projectName);

    const spawnOptions = expect.objectContaining({ cwd: outputDir });
    expect(spawn).toHaveBeenCalledWith('git', ['init'], spawnOptions);
    expect(spawn).toHaveBeenCalledWith('git', ['add', '-A'], spawnOptions);
    expect(spawn).toHaveBeenCalledWith(
      'git',
      ['commit', '-m', '"Initial commit from gasbombe"'],
      spawnOptions,
    );
    expect(consola.success).toHaveBeenCalledWith(
      'Git repository initialized successfully.',
    );
  });

  it('should handle git initialization failure', async () => {
    vi.mocked(spawn).mockImplementation((command) => {
      const mockProcess = createMockProcess();
      if (command === 'git') {
        process.nextTick(() => mockProcess.emit('close', 1));
      } else {
        process.nextTick(() => mockProcess.emit('close', 0));
      }
      return mockProcess;
    });

    await generateProject(projectOptions);

    expect(consola.fail).toHaveBeenCalledWith(
      'Failed to initialize Git repository. Please do it manually.',
    );
  });

  it('should install dependencies when install is true', async () => {
    const outputDir = path.resolve(process.cwd(), projectOptions.projectName);
    await generateProject({ ...projectOptions, install: true });

    expect(consola.start).toHaveBeenCalledWith(
      'Installing dependencies with pnpm...', 
    );
    expect(spawn).toHaveBeenCalledWith(
      'pnpm',
      ['install'],
      expect.objectContaining({ cwd: outputDir }),
    );
    expect(consola.success).toHaveBeenCalledWith(
      'Dependencies installed successfully.',
    );
  });

  it('should handle dependency installation failure', async () => {
    vi.mocked(spawn).mockImplementation((command) => {
      const mockProcess = createMockProcess();
      if (command === 'pnpm') {
        process.nextTick(() => mockProcess.emit('close', 1));
      } else {
        process.nextTick(() => mockProcess.emit('close', 0));
      }
      return mockProcess;
    });

    await generateProject({ ...projectOptions, install: true });

    expect(consola.fail).toHaveBeenCalledWith(
      'Failed to install dependencies. Please do it manually.',
    );
  });

  describe('handleClaspSetup integration', () => {
    const outputDir = path.resolve(process.cwd(), projectOptions.projectName);

    it('should skip clasp setup', async () => {
      await generateProject({ ...projectOptions, clasp: 'skip' });

      const spawnCalls = vi.mocked(spawn).mock.calls;
      const claspCalls = spawnCalls.filter((call) => {
        return call[1]?.includes('@google/clasp');
      });

      expect(claspCalls.length).toBe(0);
    });

    it('should handle clasp login failure', async () => {
      vi.mocked(spawn).mockImplementation((_cmd, args) => {
        const mockProcess = createMockProcess();
        if (args?.includes('status')) {
          process.nextTick(() => mockProcess.emit('close', 1));
        } else {
          process.nextTick(() => mockProcess.emit('close', 0));
        }
        return mockProcess;
      });
      await generateProject({ ...projectOptions, clasp: 'create' });
      expect(consola.error).toHaveBeenCalledWith(
        expect.stringContaining('It seems you are not logged in to clasp.'),
      );
    });

    it('should create a new clasp project', async () => {
      const scriptId = 'fake-script-id-123';
      vi.mocked(spawn).mockImplementation((_cmd, args) => {
        const mockProcess = createMockProcess();
        process.nextTick(() => {
          if (args?.includes('create')) {
            mockProcess.stdout.emit('data', `Created new script: ${scriptId}`);
          }
          mockProcess.emit('close', 0);
        });
        return mockProcess;
      });

      await generateProject({ ...projectOptions, clasp: 'create' });

      expect(spawn).toHaveBeenCalledWith(
        'pnpx',
        expect.arrayContaining(['create']),
        expect.objectContaining({ cwd: outputDir }),
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(outputDir, '.clasp.json'),
        JSON.stringify({ scriptId }, null, 2),
        { encoding: 'utf-8' },
      );
      expect(consola.success).toHaveBeenCalledWith(
        expect.stringContaining('.clasp.json created successfully'),
      );
    });

    it('should handle failure when creating a new clasp project', async () => {
      vi.mocked(spawn).mockImplementation((_cmd, args) => {
        const mockProcess = createMockProcess();
        process.nextTick(() => {
          mockProcess.emit('close', args?.includes('create') ? 1 : 0);
        });
        return mockProcess;
      });

      await generateProject({ ...projectOptions, clasp: 'create' });
      expect(consola.error).toHaveBeenCalledWith(
        'Failed to create new Apps Script project.',
        expect.any(Error),
      );
    });

    it('should handle failure when parsing scriptId from clasp create output', async () => {
      vi.mocked(spawn).mockImplementation((_cmd, args) => {
        const mockProcess = createMockProcess();
        process.nextTick(() => {
          if (args?.includes('create')) {
            mockProcess.stdout.emit('data', 'some other output');
          }
          mockProcess.emit('close', 0);
        });
        return mockProcess;
      });

      await generateProject({ ...projectOptions, clasp: 'create' });
      expect(consola.error).toHaveBeenCalledWith(
        'Failed to create new Apps Script project.',
        new Error('Could not parse scriptId from clasp output.'),
      );
    });

    it('should select from a list of clasp projects', async () => {
      const scriptId = 'selected-script-id';
      vi.mocked(spawn).mockImplementation((_cmd, args) => {
        const mockProcess = createMockProcess();
        process.nextTick(() => {
          if (args?.includes('list')) {
            mockProcess.stdout.emit(
              'data',
              'Header\nProject 1 - id1\nProject 2 - selected-script-id',
            );
          }
          mockProcess.emit('close', 0);
        });
        return mockProcess;
      });
      vi.mocked(select).mockResolvedValue(scriptId);

      await generateProject({ ...projectOptions, clasp: 'list' });

      expect(spawn).toHaveBeenCalledWith(
        'pnpx',
        ['@google/clasp', 'list'],
        expect.objectContaining({ cwd: outputDir }),
      );
      expect(select).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(outputDir, '.clasp.json'),
        JSON.stringify({ scriptId }, null, 2),
        { encoding: 'utf-8' },
      );
    });

    it('should warn if no projects found in list', async () => {
      vi.mocked(spawn).mockImplementation((_cmd, args) => {
        const mockProcess = createMockProcess();
        process.nextTick(() => {
          if (args?.includes('list')) {
            mockProcess.stdout.emit('data', 'Header\n');
          }
          mockProcess.emit('close', 0);
        });
        return mockProcess;
      });

      await generateProject({ ...projectOptions, clasp: 'list' });
      expect(consola.warn).toHaveBeenCalledWith(
        'No existing Apps Script projects found. Please create one first.',
      );
    });

    it('should use input clasp project ID', async () => {
      const claspProjectId = 'input-script-id';
      await generateProject({ ...projectOptions, clasp: 'input', claspProjectId });

      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(outputDir, '.clasp.json'),
        JSON.stringify({ scriptId: claspProjectId }, null, 2),
        { encoding: 'utf-8' },
      );
    });

    it('should update an existing .clasp.json file', async () => {
      const existingClaspJson = { scriptId: 'old-id', rootDir: './dist' };
      const newScriptId = 'new-id';

      vi.mocked(fs.readFile).mockImplementation(async (p) => {
        if (typeof p === 'string' && p.endsWith('.clasp.json')) {
          return JSON.stringify(existingClaspJson);
        }
        return 'template content';
      });

      await generateProject({
        ...projectOptions,
        clasp: 'input',
        claspProjectId: newScriptId,
      });

      const expectedJson = { ...existingClaspJson, scriptId: newScriptId };
      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(outputDir, '.clasp.json'),
        JSON.stringify(expectedJson, null, 2),
        { encoding: 'utf-8' },
      );
      expect(consola.success).toHaveBeenCalledWith(
        expect.stringContaining('.clasp.json updated successfully'),
      );
    });
  });

  it('should show correct final message for vanilla-ts', async () => {
    await generateProject({ ...projectOptions, templateType: 'vanilla-ts' });
    expect(consola.log).not.toHaveBeenCalledWith('  pnpm dev');
    expect(consola.log).toHaveBeenCalledWith('...and write your GAS code!');
  });

  it('should show correct final message for other templates', async () => {
    await generateProject({ ...projectOptions, templateType: 'react-tsx' });
    expect(consola.log).toHaveBeenCalledWith('  pnpm dev');
    expect(consola.log).toHaveBeenCalledWith('...and write your GAS code!');
  });
});
