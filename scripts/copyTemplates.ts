import * as fs from "node:fs";
import * as path from "node:path";

// 元となるディレクトリ
const sourceRoot = "./template-projects";
// 出力先のディレクトリ
const distRoot = "./dist/templates";

/**
 * ファイルを再帰的にコピーし、拡張子 .ejs を付けてリネームします。
 * 元のフォルダ構造は維持されます。
 * @param sourceDir 現在処理中のソースディレクトリ
 * @param destDir 対応する出力先ディレクトリ
 */
function copyAndRenameFilesRecursively(
  sourceDir: string,
  destDir: string,
): void {
  // 出力先ディレクトリが存在しない場合は作成する
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // ソースディレクトリ内のアイテムをすべて読み込む
  const items = fs.readdirSync(sourceDir);

  for (const item of items) {
    const sourcePath = path.join(sourceDir, item);
    const destPath = path.join(destDir, item);
    const stats = fs.statSync(sourcePath);

    // アイテムがディレクトリの場合、再帰的に関数を呼び出す
    if (stats.isDirectory()) {
      copyAndRenameFilesRecursively(sourcePath, destPath);
    }
    // アイテムがファイルの場合、名前を変更してコピーする
    else if (stats.isFile()) {
      const newDestPath = `${destPath}.ejs`;
      fs.copyFileSync(sourcePath, newDestPath);
      console.log(`Copied and Renamed: ${sourcePath} -> ${newDestPath}`);
    }
  }
}

// スクリプトの実行
try {
  console.log(`Starting process from ${sourceRoot} to ${distRoot}...`);

  // 実行前に出力先ディレクトリをクリーンアップする
  if (fs.existsSync(distRoot)) {
    fs.rmSync(distRoot, { recursive: true, force: true });
    console.log(`Cleaned up old directory: ${distRoot}`);
  }

  copyAndRenameFilesRecursively(sourceRoot, distRoot);
  console.log("All files have been copied and renamed successfully.");
} catch (error) {
  console.error("An error occurred:", error);
}
