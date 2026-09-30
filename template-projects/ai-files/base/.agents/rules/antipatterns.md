# GAS / モダン開発におけるアンチパターン集 (antipatterns)

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
// ※ 空シート時の対応はビジネスロジックの要件次第です。
//   データが必須ならエラー、任意なら以下のようにスキップするなど要件に応じて選択してください。
if (lastRow === 0) return;
const values = sheet.getRange(1, 1, lastRow, 1).getValues();
const newValues = values.map(([val]) => [Number(val) * 2]);
sheet.getRange(1, 2, lastRow, 1).setValues(newValues);
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

<% if (templateType.includes('ciderjs')) { -%>

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

<% } else { -%>

## 3. テストにおけるグローバル直接代入モック

他のテストスイートへの影響を防ぐため、`global.SpreadsheetApp = ...` などの直接代入を避け、Vitest の `vi.stubGlobal` を使用してください。

### ❌ Bad (グローバル直接破壊)

```typescript
// @ts-ignore
global.SpreadsheetApp = {
  getActiveSpreadsheet: vi.fn().mockReturnValue({ ... })
};
```

### ⭕ Good (`vi.stubGlobal` を利用し、`afterEach` でクリーンアップ)

```typescript
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';

describe('SpreadsheetApp を使うテスト', () => {
  beforeEach(() => {
    vi.stubGlobal('SpreadsheetApp', {
      getActiveSpreadsheet: () => ({
        getName: () => 'TestSheet',
      }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals(); // 他テストへのスタブ漏れを防ぐ
  });

  it('シート名を取得できること', () => {
    expect(SpreadsheetApp.getActiveSpreadsheet().getName()).toBe('TestSheet');
  });
});
```

<% } -%>

<% if (!templateType.startsWith('server-')) { -%>

---

## 4. クライアント側での通常 `fetch` の使用

GAS の Web App や HtmlService において、SPA からのバックエンド非同期通信に内部相対パスの `fetch('/api/...')` を使うことはできません（GAS は独立した HTTP エンドポイントの内部ルーティングを持たないため。`doPost` トリガーは `form.submit()` によるフォーム送信では有効です）。

### ❌ Bad

```typescript
const res = await fetch('/api/users');
const data = await res.json();
```

### ⭕ Good

<% if (templateType.includes('ciderjs')) { -%>

```typescript
import { serverScripts } from '../lib/server';

// parseJson: true 設定済みのため、型付きオブジェクトとして得られます
const users = await serverScripts.getUsers();
```

<% } else { -%>

```typescript
// google.script.run の成功ハンドラで JSON 文字列が返る場合はパースが必要です
google.script.run
  .withSuccessHandler((json: string) => {
    const users = JSON.parse(json) as User[];
    // ...
  })
  .getUsers();
```

<% } -%>
<% } -%>
