---
name: gas-test
description: Vitest と @ciderjs/vitest-plugin-gas-mock を使用した GAS ロジックの単体テスト作成・実行手順
---

# GAS テスト作成スキル (gas-test)

本スキルは、`@ciderjs/vitest-plugin-gas-mock` を活用して、Google Apps Script の API を呼び出すロジックの単体テストを安全かつ高速に作成・実行する手順書です。

---

## ワークフロー

### 1. テストファイルの作成場所

テストファイルは `tests/` ディレクトリ配下に `*.test.ts` として配置します。

### 2. 基本的なテスト記述

GAS のグローバルオブジェクト（`SpreadsheetApp`, `DriveApp`, `PropertiesService`, `Logger` 等）は、プラグインによって自動的にグローバル注入されています。

```typescript
import { describe, it, expect } from 'vitest';
import { mySheetLogic } from '../src/app';

describe('mySheetLogic', () => {
  it('SpreadsheetApp が正常にモックされること', () => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    expect(ss).toBeDefined();
  });
});
```

### 3. `mockChain` による戻り値のオーバーライド

深いメソッドチェーン（例: `SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName()`）の戻り値を型安全に設定するには、`mockChain` を使用します。

```typescript
import { it, expect } from 'vitest';
import { mockChain } from '@ciderjs/vitest-plugin-gas-mock';

it('シート名を取得するテスト', () => {
  mockChain('SpreadsheetApp.getActiveSpreadsheet.getActiveSheet.getName', 'TargetSheet');
  
  const sheetName = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
  expect(sheetName).toBe('TargetSheet');
});
```

### 4. コールバック関数による動的モック

引数に応じた戻り値の分岐や `DeepPartial` を返す場合:

```typescript
mockChain('SpreadsheetApp.getActiveSpreadsheet.getSheetByName', (sheetName) => {
  if (sheetName === 'NotFound') return null;
  return {
    getName: () => sheetName,
    getLastRow: () => 10,
  };
});
```

### 5. テストの実行と検証

以下のコマンドを実行してテストを確認します。

```bash
pnpm test
```

カバレッジを測定する場合は、設定されているテストスクリプト（`pnpm test` 等）の出力を確認してください。
