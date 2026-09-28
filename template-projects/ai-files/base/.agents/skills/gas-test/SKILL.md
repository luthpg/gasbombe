---
name: gas-test
description: <%= templateType.includes('ciderjs') ? 'Vitest と @ciderjs/vitest-plugin-gas-mock を使用した GAS ロジックの単体テスト作成・実行手順' : 'Vitest を使用した GAS ロジックの単体テスト作成・実行手順' %>
---

# GAS テスト作成スキル (gas-test)

本スキルは、<%= templateType.includes('ciderjs') ? '`@ciderjs/vitest-plugin-gas-mock` を活用して、' : '' %>Google Apps Script の API を呼び出すロジックの単体テストを安全かつ高速に作成・実行する手順書です。

---

## ワークフロー

### 1. テストファイルの作成場所

テストファイルは `tests/` ディレクトリ配下に `<%= templateType === 'server-js' ? '*.test.js' : '*.test.ts' %>` として配置します。
<% if (templateType.includes('ciderjs')) { -%>

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

<% } else { -%>

### 2. 基本的なテスト記述 (`vi.stubGlobal` による GAS モック)

GAS のグローバルオブジェクト（`SpreadsheetApp`, `Logger` 等）は、Vitest の `vi.stubGlobal` を使用してモックします。

```<%= templateType === 'server-js' ? 'javascript' : 'typescript' %>
import { afterEach, describe, it, expect, vi } from 'vitest';
import { myFunction } from '../src/app';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('myFunction', () => {
  it('正常にログが出力されること', () => {
    const mockLog = vi.fn();
    vi.stubGlobal('Logger', { log: mockLog });

    myFunction();
    expect(mockLog).toHaveBeenCalled();
  });
});
```

### 3. スプレッドシート等のメソッドチェーンモック

```<%= templateType === 'server-js' ? 'javascript' : 'typescript' %>
import { afterEach, it, expect, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
});

it('シート名を取得するテスト', () => {
  vi.stubGlobal('SpreadsheetApp', {
    getActiveSpreadsheet: () => ({
      getActiveSheet: () => ({
        getName: () => 'TargetSheet',
      }),
    }),
  });

  const sheetName = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
  expect(sheetName).toBe('TargetSheet');
});
```

<% } -%>

### <%= templateType.includes('ciderjs') ? '5' : '4' %>. テストの実行と検証

以下のコマンドを実行してテストを確認します。

```bash
pnpm test
```

カバレッジを測定する場合は、設定されているテストスクリプト（`pnpm test` 等）の出力を確認してください。
