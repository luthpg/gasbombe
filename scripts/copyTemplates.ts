import * as fs from "node:fs";
import * as path from "node:path";
import * as yaml from "js-yaml";

const DIRS = {
  SRC: "./template-projects",
  DIST: "./dist",
  DIST_TEMPLATES: "./dist/templates",
  WORKSPACE: "./pnpm-workspace.yaml",
};

// 型定義
interface CatalogConfig {
  catalog?: Record<string, string>;
}
interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  // biome-ignore lint/suspicious/noExplicitAny: package.jsonの型が複雑なため
  [key: string]: any;
}

/**
 * pnpm-workspace.yaml から catalog 情報をロード
 */
export async function loadCatalog(): Promise<Record<string, string>> {
  try {
    const content = await fs.readFileSync(DIRS.WORKSPACE, {
      encoding: "utf-8",
    });
    const parsed = yaml.load(content) as CatalogConfig;
    return parsed.catalog || {};
  } catch (e) {
    console.error("Failed to load pnpm-workspace.yaml", e);
    process.exit(1);
  }
}

/**
 * package.jsonのバージョン置換を行う
 */
export function processPackageJson(
  packageJson: PackageJson,
  catalog: Record<string, string>,
): PackageJson {
  // nameをテンプレート変数に戻す
  packageJson.name = "<%= projectName %>";

  // 依存関係のバージョン置換関数
  const replaceVersions = (deps?: Record<string, string>) => {
    if (!deps) return;
    for (const [pkg, ver] of Object.entries(deps)) {
      if (ver === "catalog:") {
        if (!catalog[pkg]) {
          console.warn(
            `⚠️  Warning: No catalog version found for '${pkg}'. Keeping 'catalog:'.`,
          );
          continue;
        }
        deps[pkg] = catalog[pkg];
      }
    }
  };

  replaceVersions(packageJson.dependencies);
  replaceVersions(packageJson.devDependencies);

  return packageJson;
}

/**
 * ファイルを再帰的にコピーし、拡張子 .ejs を付けてリネームします。
 * 元のフォルダ構造は維持されます。
 * @param sourceDir 現在処理中のソースディレクトリ
 * @param destDir 対応する出力先ディレクトリ
 */
async function copyAndRenameFilesRecursively(
  sourceDir: string,
  destDir: string,
) {
  // 出力先ディレクトリが存在しない場合は作成する
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  } else {
    // 実行前に出力先ディレクトリをクリーンアップする
    fs.rmSync(destDir, { recursive: true, force: true });
    console.log(`Cleaned up old directory: ${destDir}`);
  }

  // ソースディレクトリ内のアイテムをすべて読み込む
  const items = fs.readdirSync(sourceDir);

  // catalogをロード
  const catalog = await loadCatalog();

  for (const item of items) {
    const sourcePath = path.join(sourceDir, item);
    const destPath = path.join(destDir, item);
    const stats = fs.statSync(sourcePath);

    const skipDirNames = ["node_modules", "dist", "build", "coverage", ".git"];

    if (skipDirNames.includes(item)) {
      continue;
    }

    // アイテムがディレクトリの場合、再帰的に関数を呼び出す
    if (stats.isDirectory()) {
      copyAndRenameFilesRecursively(sourcePath, destPath);
    }
    // アイテムがファイルの場合、名前を変更してコピーする
    else if (stats.isFile()) {
      if (item === "package.json") {
        const content = fs.readFileSync(sourcePath, "utf-8");
        const parsed = JSON.parse(content);
        const processed = processPackageJson(parsed, catalog);
        const newDestPath = `${destPath}.ejs`;
        fs.writeFileSync(newDestPath, JSON.stringify(processed, null, 2));
      } else if (item.startsWith("common_")) {
        const newDestPath = `${path.join(destDir, item.replace("common_", ""))}.ejs`;
        fs.copyFileSync(sourcePath, newDestPath);
      } else {
        const newDestPath = `${destPath}.ejs`;
        fs.copyFileSync(sourcePath, newDestPath);
      }
    }
  }
  fs.writeFileSync(
    path.join(DIRS.DIST, "catalog.json"),
    JSON.stringify(catalog, null, 2),
  );
}

// スクリプトの実行
(async () => {
  try {
    console.log(
      `Starting process from ${DIRS.SRC} to ${DIRS.DIST_TEMPLATES}...`,
    );
    await copyAndRenameFilesRecursively(DIRS.SRC, DIRS.DIST_TEMPLATES);
    console.log("All files have been copied and renamed successfully.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();
