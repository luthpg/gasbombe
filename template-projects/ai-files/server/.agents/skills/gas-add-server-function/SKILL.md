---
name: gas-add-server-function
description: サーバーサイド GAS 関数の新規追加、型定義、テスト作成、およびビルド確認手順
---

# サーバー関数追加スキル (gas-add-server-function)

本スキルは、`server-ts`, `server-js`, `server-ciderjs` テンプレートにおいて、新しいサーバーサイド GAS 関数やトリガー関数を追加する手順書です。

---

## ワークフロー

### Step 1: 関数の実装 (`src/app.ts` または `src/`)

1. 外部・GAS から実行させたい関数を、名前付きエクスポートとして定義します。

```typescript
// src/app.ts
import type { TaskResult } from './types';

export function processDailyBatch(): TaskResult {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Data');
  if (!sheet) {
    throw new Error('Data sheet not found');
  }

  const values = sheet.getDataRange().getValues();
  // 処理ロジック...

  return { success: true, count: values.length };
}
```

### Step 2: 単体テストの追加 (`tests/`)

1. `tests/app.test.ts` にテストケースを追加します。

```typescript
import { describe, it, expect } from 'vitest';
import { mockChain } from '@ciderjs/vitest-plugin-gas-mock';
import { processDailyBatch } from '../src/app';

describe('processDailyBatch', () => {
  it('正常にバッチ処理が完了すること', () => {
    mockChain('SpreadsheetApp.getActiveSpreadsheet.getSheetByName', () => ({
      getDataRange: () => ({
        getValues: () => [['header'], ['row1'], ['row2']],
      }),
    }));

    const result = processDailyBatch();
    expect(result.success).toBe(true);
    expect(result.count).toBe(3);
  });
});
```

### Step 3: リント & テスト検証

```bash
pnpm run check && pnpm test
```

### Step 4: ビルド確認

```bash
pnpm run build
```

- `dist/app.js` を確認し、末尾に `export { processDailyBatch }` が残っておらず、関数がトップレベルに宣言されていることを確認します（`rolldown-plugin-remove-export` の動作確認）。
