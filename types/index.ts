export type PackageManager = 'npm' | 'pnpm' | 'yarn';
export type TemplateType = 'server-ts' | 'server-js' | 'react' | 'react-ciderjs' | 'vue' | 'vue-ciderjs' | 'html-js';
export type ClaspOption = 'create' | 'list' | 'input' | 'skip';

export interface ProjectOptions {
  projectName: string;
  packageManager: PackageManager;
  templateType: TemplateType;
  clasp: ClaspOption;
	claspProjectId?: string | undefined;
	install: boolean;
}
