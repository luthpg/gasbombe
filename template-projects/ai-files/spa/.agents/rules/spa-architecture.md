# クライアント UI / HtmlService アーキテクチャ規約 (spa-architecture)

本ドキュメントは、フロントエンド連携における SPA ビルドと HtmlService 連携の規約です。

---

## 🚨 Critical Constraints (エージェント遵守事項)

```text
- ALWAYS configure Vite plugins in strict order: plugins: [..., gas(), viteSingleFile()].
- gas() (vite-plugin-google-apps-script) MUST be placed BEFORE viteSingleFile().
- NEVER use standard fetch() for GAS backend calls on the client side (use gasnuki / google.script.run).
- ALL static assets (images, icons) are bundled into a single HTML file; keep them small (SVG / inline base64).
```

---

## 1. ビルドシステムと Vite プラグイン順序の鉄則

Google Apps Script の `HtmlService` は、外部リソースへの参照ではなく、単一の HTML ファイル内に JS/CSS がインライン化された形式を要求します。

### プラグイン順序の厳守

`vite.config.ts` において、**必ず `gas()` を `viteSingleFile()` の前に配置してください**。

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { gas } from 'vite-plugin-google-apps-script';

export default defineConfig({
  plugins: [
    // 1. フレームワークプラグイン (react, vue 等)
    // 2. gas() プラグイン (Terser改行保護、URL除去、スクリプトレットエスケープ)
    gas(),
    // 3. viteSingleFile() プラグイン (単一HTMLへのインライン化)
    viteSingleFile(),
  ],
  build: {
    outDir: 'dist',
  },
});
```

### なぜ順序が重要なのか？

- **GASの2重iframeセキュリティによる構文破壊問題**:
  GAS（HtmlService）はWebアプリ描画時に2重のiframeを使って埋め込みますが、その展開時にソースコード内のURL文字列（Vue/ReactのエラーリファレンスURL等）をセキュリティ目的の正規表現で削ってしまい、`Uncaught SyntaxError: Invalid destructuring assignment target` 等の構文エラーを引き起こします。
- `gas()` (`vite-plugin-google-apps-script`):
  Vite内部で `terser` を強制利用し、テンプレートリテラル内の改行を保護するとともに、GAS展開時にエラーの原因となるURLやJSDocコメント、スクリプトレット（`<?!= ... ?>`）を自動的にサニタイズ・エスケープします。
- `viteSingleFile()`:
  すべての JS/CSS チャンクを単一の `index.html` にインライン埋め込みします。
- `gas()` が先にコードをサニタイズしないと、インライン化された HTML 内でコードが削られてクラッシュします。

---

## 2. クライアント・サーバー間通信の基本

<% if (templateType.includes('ciderjs')) { -%>

自動型付け・モックライブラリ `@ciderjs/gasnuki` を使用してサーバー関数を型安全に呼び出します（詳細は `ciderjs-architecture.md` を参照）。
<% } else { -%>

### `google.script.run` のプロミス化パターン

コールバック地獄を防ぐために Promise ラッパーを作成して呼び出します。

```typescript
export function callGasServer<T>(functionName: string, ...args: any[]): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!('google' in window) || !google?.script?.run) {
      console.warn(`[Local Dev] Simulated call to ${functionName}`);
      resolve({} as T);
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
