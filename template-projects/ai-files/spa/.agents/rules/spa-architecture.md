# クライアント UI / HtmlService アーキテクチャ規約 (spa-architecture)

本ドキュメントは、フロントエンド連携における SPA ビルドと HtmlService 連携の規約です。

---

## 🚨 Critical Constraints (エージェント遵守事項)

```text
- NEVER use standard fetch() for GAS backend calls on the client side (use gasnuki / google.script.run).
- ALL static assets (images, icons) are bundled into a single HTML file; keep them small (SVG / inline base64).
- vite-plugin-google-apps-script (gas()) は createTemplateFromFile() + スクリプトレット使用時のみ必要。
  createHtmlOutputFromFile() を使う場合は副作用（URL削除・JSDoc削除）を避けるため gas() を外すこと。
- gas() 有効時は NEVER write URLs inside template literals (`https://.../${id}`); they will be stripped at build time!
  Instead, use string concatenation ('https://.../' + id) or `new URL()`.
- gas() を使用する場合は ALWAYS configure Vite plugins in strict order: [..., gas(), viteSingleFile()].
```

---

## 1. ビルドシステムの設計方針

HtmlService では、JS / CSS をそれぞれ HTML ファイルとして GAS プロジェクトにアップロードし、サーバーサイドのスクリプトレット（`<?= ?>` 等）を通じて出力します。このスクリプトレット構文はローカル IDE では補完が効かないため、**本テンプレートではローカル開発を標準的な Vite + TypeScript + HMR のスキームで行い、ビルドで GAS 向けに変換する**設計を採用しています。

`viteSingleFile()` を使うことで、すべての JS / CSS を単一の `index.html` にインライン化し、GAS へのファイルアップロードを 1 ファイルに集約します。

### `vite-plugin-google-apps-script` (`gas()`) の要否判断と注意点

`HtmlService.createTemplateFromFile()`（スクリプトレット評価）を使用する際、バンドル後のコード内にテンプレートリテラル内の改行や URL（`//`）、JSDoc コメント等が含まれていると GAS 側のパーサーで構文エラーやコード欠損が発生します。これを回避するため、`gas()` プラグインはビルド時に以下の変換を行います：

1. **Terser による Minify 強制**: `esbuild` の代わりに `terser` を使用し、テンプレートリテラル内の改行を `\n` として保持。
2. **テンプレートリテラル内の URL 削除**: AST を走査し、テンプレートリテラル（`` `...` ``）およびその内部の文字列に含まれる URL（`https?://`, `ftp://`, `blob:`, `data:`, `//`）を空文字に置換。
3. **JSDoc 削除・スクリプトレット引用符変換**: バンドル結果から JSDoc コメント（`/** ... */`）を削除し、`"(<?...?>)"` のダブルクォートをシングルクォートに変換。

#### (A) スクリプトレットを使わない場合は `gas()` を外す（推奨）

サーバー側で初期パラメータの埋め込み（`<?!= parameters ?>`）を行わず、`HtmlService.createHtmlOutputFromFile("index")` を使用する場合（初期データも `google.script.run` / `gasnuki` で取得する場合）は、GAS のスクリプトレットパーサーを通らないため **`gas()` プラグインは不要**です。
不要な状態で `gas()` を有効にしておくと、上記のような URL 置換や JSDoc 削除、Terser 強制によるビルド速度低下といった副作用のみが残るため、以下の手順で外してください：

1. `server/app.ts`（または `server/app.js`）の `doGet` 内で `HtmlService.createHtmlOutputFromFile("index")` を使用するよう変更。
2. `index.html` からスクリプトレット（`<?!= parameters ?>` を読み込む `<script>` タグ）を削除。
3. `vite.config.ts`（または `vite.config.js`）の `plugins` から `gas()` を削除。

#### (B) `gas()` を使用する場合に気をつけるべきポイント

`HtmlService.createTemplateFromFile()` + スクリプトレットを引き続き使用し、`gas()` を有効にする場合は以下の点に必ず注意してください：

1. **テンプレートリテラル（`` `...` ``）の中に URL を直接書かない**
   - `gas()` はテンプレートリテラル内の `http://` や `https://` 等をビルド時に削除します。そのため、`` `https://api.example.com/users/${id}` `` のように書くと、ビルド後に URL 部分が消えてしまいます。
   - **対策**: URL を組み立てる際は、通常の文字列結合（`"https://api.example.com/users/" + id`）や `new URL(id, "https://api.example.com/users/").toString()` を使用するか、`gas({ url: { excludes: [...] } })` で対象ファイルを除外してください。
2. **JSDoc（`/** ... */`）がバンドル時にすべて除去される**
   - デフォルトで `/** ... */` にマッチするコメントが削除されます。もし特定のコメントや文字列パターンを残す必要がある場合は、`gas({ replace: { useDefault: false, replaceRules: [...] } })` でルールをカスタマイズしてください。
3. **プラグインの配置順序を厳守する**
   - `gas()` が先にコードをサニタイズしてからインライン化する必要があるため、`plugins` 配列では必ず **`viteSingleFile()` よりも前**に `gas()` を配置してください。

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { gas } from 'vite-plugin-google-apps-script';

export default defineConfig({
  plugins: [
    // 1. フレームワークプラグイン (react, vue 等)
    // 2. gas() プラグイン — createTemplateFromFile() + スクリプトレット使用時のみ（viteSingleFile より前に配置）
    gas(),
    // 3. viteSingleFile() — 単一 HTML へのインライン化
    viteSingleFile(),
  ],
  build: {
    outDir: 'dist',
  },
});
```

---

## 2. クライアント・サーバー間通信の基本

<% if (templateType.includes('ciderjs')) { -%>

自動型付け・モックライブラリ `@ciderjs/gasnuki` を使用してサーバー関数を型安全に呼び出します（詳細は `ciderjs-architecture.md` を参照）。
<% } else { -%>

### `google.script.run` のプロミス化パターン

コールバック地獄を防ぐために Promise ラッパーを作成して呼び出します。ローカル開発環境では `google.script.run` が存在しないため、モック or reject で対応してください。

```typescript
export function callGasServer<T>(functionName: string, ...args: unknown[]): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!('google' in window) || !google?.script?.run) {
      // ローカル開発環境: 空オブジェクトを返さず、明示的に reject して未対応呼び出しを検知する
      reject(new Error(`[Local Dev] google.script.run is unavailable. Mock the function: ${functionName}`));
      return;
    }

    google.script.run
      .withSuccessHandler((result: T) => resolve(result))
      .withFailureHandler((error: Error) => reject(error))
      [functionName](...args);
  });
}
```

<% } -%>

---

## 3. 静的アセット（画像・アイコン）の取り扱い

- 単一 HTML にバンドルされるため、画像やフォントは可能な限り SVG または小さめの Base64 インライン形式を使用してください。
- 巨大な画像ファイル（数MB以上）をインライン化すると、GAS の 50MB 制限や読み込み速度低下に直結します。
