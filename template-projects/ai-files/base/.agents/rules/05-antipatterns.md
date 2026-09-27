# GAS / モダン開発におけるアンチパターン集 (05-antipatterns)

AI Coding Agent が Google Apps Script 開発において生成しがちな失敗例（Bad）と、推奨される正解コード（Good）の対比集です。

---

## 1. スプレッドシートのセル単位ループアクセス

GAS で最も一般的なパフォーマンス問題です。API 呼び出しのオーバーヘッドにより実行時間上限（6分）を超過します。

### ❌ Bad (1セルずつアクセス)

```typescript
for (let i = 1; i <= 1000; i++) {
  const value = sheet.getRange(i, 1).getValue(); // 1000回API呼び出し
  sheet.getRange(i, 2).setValue(value * 2);       // 1000回API呼び出し
}
```

### ⭕ Good (2D 配列で一括取得・一括書き込み)

```typescript
const lastRow = sheet.getLastRow();
const values = sheet.getRange(1, 1, lastRow, 1).getValues(); // 1回で取得
const newValues = values.map(([val]) => [Number(val) * 2]);
sheet.getRange(1, 2, lastRow, 1).setValues(newValues);        // 1回で書き込み
```

---

## 2. サーバーサイド関数での `export default`

Rolldown やビルドツールが GAS 向けにトップレベルグローバル関数を露出させる際、`export default` を使用すると関数名が失われ、GAS のスクリプトエディタから実行できなくなります。

### ❌ Bad

```typescript
export default function handleRequest() { ... }
```

### ⭕ Good (名前付き関数としてエクスポート)

```typescript
export function handleRequest() { ... }
export function doGet(e: GoogleAppsScript.Events.DoGet) { ... }
```

---

## 3. テストにおける GAS グローバルの手作業モック

`@ciderjs/vitest-plugin-gas-mock` が組み込まれているため、`global.SpreadsheetApp = ...` などの手作業による不完全なモックを作成してはいけません。

### ❌ Bad

```typescript
// @ts-ignore
global.SpreadsheetApp = {
  getActiveSpreadsheet: vi.fn().mockReturnValue({ ... })
};
```

### ⭕ Good (`vitest-plugin-gas-mock` の `mockChain` を利用)

```typescript
import { mockChain } from '@ciderjs/vitest-plugin-gas-mock';

mockChain('SpreadsheetApp.getActiveSpreadsheet.getName', 'TestSheet');
```

---

## 4. クライアント側での通常 `fetch` の使用

GAS の Web App や HtmlService において、バックエンド通信に通常の `fetch('/api/...')` を呼ぶことはできません（GAS には独立した HTTP エンドポイントの内部ルーティングがないため）。

### ❌ Bad

```typescript
const res = await fetch('/api/users');
const data = await res.json();
```

### ⭕ Good (プロジェクトの提供する RPC または `google.script.run`)

```typescript
// CiderJS プロジェクトの場合
const data = await gas.getUsers();

// 標準プロジェクトの場合
google.script.run
  .withSuccessHandler((users) => { ... })
  .getUsers();
```
