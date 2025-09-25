import * as fs from 'node:fs';
import * as path from 'node:path';

// 変更対象のディレクトリ
const targetDir = './template-projects';
const distDir = './templates';

function renameFilesRecursively(directory: string): void {
  // 指定されたディレクトリ内のすべてのアイテムを読み込む
  const items = fs.readdirSync(directory);

  // ディレクトリを作成する
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
  }

  for (const item of items) {
    const fullPath = path.join(directory, item);
    const stats = fs.statSync(fullPath);

    // アイテムがディレクトリの場合、再帰的に関数を呼び出す
    if (stats.isDirectory()) {
      renameFilesRecursively(fullPath);
    } 
    // アイテムがファイルの場合、名前を変更する
    else if (stats.isFile()) {
      const newPath = path.join(distDir, `${item}.tera`);
      fs.copyFileSync(fullPath, newPath);
      console.log(`Renamed: ${fullPath} -> ${newPath}`);
    }
  }
}

// スクリプトの実行
try {
  console.log(`Starting to rename files in ${targetDir}...`);
  renameFilesRecursively(targetDir);
  console.log('All files have been renamed successfully.');
} catch (error) {
  console.error('An error occurred:', error);
}
