# クライアント UI / HtmlService アーキテクチャ規約 (spa-architecture)

本ドキュメントは、フロントエンド連携における SPA ビルドと HtmlService 連携の規約です。

---

## 🚨 Critical Constraints (エージェント遵守事項)

```text
- NEVER use standard fetch() for GAS backend calls on the client side (use gasnuki / google.script.run).
- ALL static assets (images, icons) are bundled into a single HTML file; keep them small (SVG / inline base64).
- vite-plugin-google-apps-script (gas()) は createTemplateFromFile() + スクリプトレット使用時に必要。
  createHtmlOutputFromFile() のみ使う場合は省略可能。
- gas() を使用する場合は ALWAYS configure Vite plugins in strict order: [..., gas(), viteSingleFile()].
```

---

## 1. ビルドシステムの設計方針

HtmlService では、JS / CSS をそれぞれ HTML ファイルとして GAS プロジェクトにアップロードし、サーバーサイドのスクリプトレット（`<?= ?>` 等）を通じて出力します。このスクリプトレット構文はローカル IDE では補完が効かないため、**本テンプレートではローカル開発を標準的な Vite + TypeScript + HMR のスキームで行い、ビルドで GAS 向けに変換する**設計を採用しています。

`viteSingleFile()` を使うことで、すべての JS / CSS を単一の `index.html` にインライン化し、GAS へのファイルアップロードを 1 ファイルに集約します。

### `vite-plugin-google-apps-script` (`gas()`) が必要なケース

`gas()` プラグインは以下の処理を行います:

- Vite 内部で `terser` を強制利用し、テンプレートリテラル内の改行を保護
- GAS の 2 重 iframe セキュリティによる URL 文字列の削除（Vue / React のエラーリファレンス URL 等）への対策
- スクリプトレット（`<?= ?>`, `<?!= ?>`）の自動エスケープ

**必要なケース**: `HtmlService.createTemplateFromFile()` を使い、サーバーサイドでスクリプトレットに動的な値を埋め込む場合

**不要なケース**: `HtmlService.createHtmlOutputFromFile()` のみを使う場合（スクリプトレット不使用）。この場合 `viteSingleFile()` のみで十分です。

### `gas()` を使用する場合のプラグイン順序

`gas()` が先にコードをサニタイズしないと、`viteSingleFile()` でインライン化された後に URL やコードが削られてクラッシュします。

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { gas } from 'vite-plugin-google-apps-script';

export default defineConfig({
  plugins: [
    // 1. フレームワークプラグイン (react, vue 等)
    // 2. gas() プラグイン — createTemplateFromFile() + スクリプトレット使用時のみ
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
