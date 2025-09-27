export interface ProjectOptions {
	projectName: string;
	packageManager: "npm" | "pnpm" | "yarn";
	templateType: "vanilla-ts" | "react-tsx";
}
