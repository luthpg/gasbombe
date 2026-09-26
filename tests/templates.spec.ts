import { exec } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { createServer } from "vite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const execAsync = promisify(exec);

// 全テンプレート一覧
const TEMPLATES = [
  "html-js",
  "react",
  "react-ciderjs",
  "vue",
  "vue-ciderjs",
  "server-js",
  "server-ts",
  "server-ciderjs",
] as const;

type TemplateName = (typeof TEMPLATES)[number];

// フロントエンド（Vite 開発サーバーあり）
const FRONTEND_TEMPLATES: ReadonlySet<TemplateName> = new Set([
  "html-js",
  "react",
  "react-ciderjs",
  "vue",
  "vue-ciderjs",
]);

// TypeScript 型チェック対象と実行コマンド
const TYPECHECK_COMMANDS: Partial<Record<TemplateName, string>> = {
  react: "pnpm -C template-projects/react exec tsc -b",
  "react-ciderjs": "pnpm -C template-projects/react-ciderjs exec tsc -b",
  vue: "pnpm -C template-projects/vue exec vue-tsc -b",
  "vue-ciderjs": "pnpm -C template-projects/vue-ciderjs exec vue-tsc -b",
  "server-ts": "pnpm -C template-projects/server-ts exec tsc",
  "server-ciderjs": "pnpm -C template-projects/server-ciderjs exec tsc",
};

const ROOT_DIR = path.resolve(__dirname, "..");
const TEMPLATES_DIR = path.resolve(ROOT_DIR, "template-projects");

/**
 * テンプレートディレクトリ配下の dist フォルダを安全に削除するヘルパー
 */
async function cleanupDist(templateName: string): Promise<void> {
  const distPath = path.resolve(TEMPLATES_DIR, templateName, "dist");
  await fs.rm(distPath, { recursive: true, force: true });
}

describe("テンプレートプロジェクト検証テストスイート", { timeout: 120_000 }, () => {
  beforeAll(async () => {
    // テスト開始前に残骸があればクリーンアップ
    for (const template of TEMPLATES) {
      await cleanupDist(template);
    }
  });

  afterAll(async () => {
    // テスト終了後に生成された成果物を確実にクリーンアップ
    for (const template of TEMPLATES) {
      await cleanupDist(template);
    }
  });

  describe.each(TEMPLATES)("テンプレート: %s", (templateName) => {
    const templateDir = path.resolve(TEMPLATES_DIR, templateName);

    it("設定ファイル（package.json, clasp等）が正しく構文エラーがないこと", async () => {
      const packageJsonPath = path.resolve(templateDir, "package.json");
      const packageJsonContent = await fs.readFile(packageJsonPath, "utf-8");
      const parsedPackageJson = JSON.parse(packageJsonContent);

      expect(parsedPackageJson).toHaveProperty("name");
      expect(parsedPackageJson).toHaveProperty("scripts");
      expect(parsedPackageJson.scripts).toHaveProperty("build");
      expect(parsedPackageJson.scripts).toHaveProperty("check");
      expect(parsedPackageJson.scripts).toHaveProperty("test");

      const claspJsonPath = path.resolve(templateDir, ".clasp.json");
      try {
        const claspContent = await fs.readFile(claspJsonPath, "utf-8");
        const parsedClasp = JSON.parse(claspContent);
        expect(parsedClasp).toHaveProperty("scriptId");
      } catch (err: unknown) {
        // clasp.json が存在しないテンプレートの場合はスキップ
        const error = err as NodeJS.ErrnoException;
        if (error.code !== "ENOENT") {
          throw err;
        }
      }
    });

    it("記法・構文チェック（Biome check）にパスすること", async () => {
      const { stdout, stderr } = await execAsync(
        `pnpm -C template-projects/${templateName} run check`,
        { cwd: ROOT_DIR },
      );
      // Biome check が正常に終了（エラーなし）
      expect(stderr).not.toContain("error");
    });

    if (TYPECHECK_COMMANDS[templateName]) {
      it("TypeScript 型チェックにパスすること", async () => {
        const typecheckCmd = TYPECHECK_COMMANDS[templateName];
        expect(typecheckCmd).toBeDefined();
        if (typecheckCmd !== undefined) {
          const { stderr } = await execAsync(typecheckCmd, { cwd: ROOT_DIR });
          expect(stderr).not.toContain("error TS");
        }
      });
    }

    if (FRONTEND_TEMPLATES.has(templateName)) {
      it("Vite 開発サーバーが正常に起動し、HTTPリクエストに応答できること", async () => {
        const server = await createServer({
          root: templateDir,
          server: {
            port: 0, // OSが空きポートを自動選択
          },
          logLevel: "silent",
        });

        try {
          await server.listen();
          const address = server.httpServer?.address();
          expect(address).toBeDefined();

          const port =
            typeof address === "object" && address !== null
              ? address.port
              : server.config.server.port;

          const response = await fetch(`http://localhost:${port}/`);
          expect(response.status).toBe(200);

          const html = await response.text();
          expect(html.toLowerCase()).toContain("<!doctype html");
        } finally {
          await server.close();
        }
      });
    }

    it("プロジェクト内単体テスト（vitest）にパスすること", async () => {
      const { stderr } = await execAsync(
        `pnpm -C template-projects/${templateName} run test`,
        { cwd: ROOT_DIR },
      );
      expect(stderr).not.toContain("FAIL");
    });

    it("ビルド（build）が成功し、成果物が出力された後、クリーンアップされること", async () => {
      try {
        await execAsync(`pnpm -C template-projects/${templateName} run build`, {
          cwd: ROOT_DIR,
        });

        const distDir = path.resolve(templateDir, "dist");
        const files = await fs.readdir(distDir);
        expect(files.length).toBeGreaterThan(0);

        if (FRONTEND_TEMPLATES.has(templateName)) {
          expect(files).toContain("index.html");
        } else {
          expect(files).toContain("app.js");
        }
      } finally {
        // テスト終了時に成果物を確実に削除
        await cleanupDist(templateName);
      }
    });
  });
});
