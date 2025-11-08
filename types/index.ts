export type PackageManager = 'npm' | 'pnpm' | 'yarn';
export type TemplateType = 'vanilla-ts' | 'vanilla-js' | 'react-tsx';
export type ClaspOption = 'create' | 'list' | 'input' | 'skip';

export interface ProjectOptions {
  projectName: string;
  packageManager: PackageManager;
  templateType: TemplateType;
  clasp: ClaspOption;
	claspProjectId?: string | undefined;
	install: boolean;
}
