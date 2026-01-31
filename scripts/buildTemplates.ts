import fs from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';
import yaml from 'js-yaml';
import deepmerge from 'deepmerge';

/**
 * 設定: テンプレートの構成定義
 * ベースとなる共通ディレクトリと、固有のディレクトリを配列で指定します。
 * 後ろの要素が前の要素を上書きします。
 */
const TEMPLATE_LAYERS: Record<string, string[]> = {
  // dist名: [ ソースディレクトリのリスト ]
  'react': ['_base', 'react'],
  'react-ciderjs': ['_base', 'react-cider'],
  // 今後追加する場合もここ定義するだけ
  // 'vue': ['_base', 'vue'], 
};

const DIRS = {
  SRC: './template-projects',
  DIST: './dist/templates',
  WORKSPACE: './pnpm-workspace.yaml',
};

// 型定義
interface CatalogConfig {
  catalog?: Record<string, string>;
}
interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: any;
}

/**
 * pnpm-workspace.yaml から catalog 情報をロード
 */
async function loadCatalog(): Promise<Record<string, string>> {
  try {
    const content = await fs.readFile(DIRS.WORKSPACE, 'utf-8');
    const parsed = yaml.load(content) as CatalogConfig;
    return parsed.catalog || {};
  } catch (e) {
    console.error('Failed to load pnpm-workspace.yaml', e);
    process.exit(1);
  }
}

/**
 * JSONのマージとバージョン置換を行う
 */
function processPackageJson(
  baseParams: PackageJson,
  overrideParams: PackageJson,
  catalog: Record<string, string>
): string {
  // 1. マージ
  const merged = deepmerge(baseParams, overrideParams);

  // 2. nameをテンプレート変数に戻す
  merged.name = "<%= name %>";

  // 3. 依存関係のバージョン置換関数
  const replaceVersions = (deps?: Record<string, string>) => {
    if (!deps) return;
    for (const [pkg, ver] of Object.entries(deps)) {
      if (ver === 'catalog:') {
        if (!catalog[pkg]) {
          console.warn(`⚠️  Warning: No catalog version found for '${pkg}'. Keeping 'catalog:'.`);
          continue;
        }
        deps[pkg] = catalog[pkg];
      }
    }
  };

  replaceVersions(merged.dependencies);
  replaceVersions(merged.devDependencies);

  return JSON.stringify(merged, null, 2);
}

/**
 * メインビルド処理
 */
async function build() {
  console.log('🚀 Starting template build...');
  
  const catalog = await loadCatalog();
  console.log(`📦 Loaded ${Object.keys(catalog).length} catalog entries.`);

  // Clean dist
  await fs.rm(DIRS.DIST, { recursive: true, force: true });

  // 各テンプレートのビルド
  for (const [targetName, layers] of Object.entries(TEMPLATE_LAYERS)) {
    console.log(`\n🔨 Building template: ${targetName}`);
    const targetDir = path.join(DIRS.DIST, targetName);

    // 一時的にファイルの中身を保持するMap (path -> content)
    // これによりメモリ上でマージを行い、最後に書き出す
    const fileMap = new Map<string, string | Buffer>();

    // レイヤー順に処理
    for (const layer of layers) {
      const layerDir = path.join(DIRS.SRC, layer);
      
      // レイヤーが存在するか確認
      try {
        await fs.access(layerDir);
      } catch {
        console.warn(`   ⚠️  Layer '${layer}' not found. Skipping.`);
        continue;
      }

      const files = await glob('**/*', { cwd: layerDir, nodir: true, dot: true });

      for (const file of files) {
        // node_modulesなどは除外
        if (file.includes('node_modules')) continue;

        const srcPath = path.join(layerDir, file);
        
        // 特殊ファイルの処理
        if (file === 'package.json') {
          const content = await fs.readFile(srcPath, 'utf-8');
          // 既存があればマージ、なければ新規
          const existing = fileMap.get(file);
          if (existing) {
             const baseJson = JSON.parse(existing.toString());
             const newJson = JSON.parse(content);
             const mergedContent = processPackageJson(baseJson, newJson, catalog);
             fileMap.set(file, mergedContent);
          } else {
             // 初回ロード時もカタログ置換のため processPackageJson を通す
             const processed = processPackageJson({}, JSON.parse(content), catalog);
             fileMap.set(file, processed);
          }
        } else {
          // 通常ファイルは上書き (Bufferとして保持)
          const content = await fs.readFile(srcPath);
          fileMap.set(file, content);
        }
      }
    }

    // ファイル書き出し
    for (const [filePath, content] of fileMap.entries()) {
      // 全てに .ejs を付与するルールの場合
      const outPath = path.join(targetDir, filePath + '.ejs');
      await fs.mkdir(path.dirname(outPath), { recursive: true });
      await fs.writeFile(outPath, content);
    }
    console.log(`   ✅ Generated ${fileMap.size} files for ${targetName}`);
  }

  console.log('\n✨ All templates built successfully!');
}

build().catch(console.error);
