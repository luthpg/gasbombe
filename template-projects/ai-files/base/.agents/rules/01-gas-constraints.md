# GAS 実行環境の制約とガードレール (01-gas-constraints)

Google Apps Script (GAS) のサーバー実行環境は、一般的な Node.js やブラウザ環境とは根本的に異なるサンドボックスです。
AI Coding Agent は以下の制約を厳守してコードを生成してください。

---

## 🚨 Critical Constraints (エージェント遵守事項)

```text
- NEVER use Node.js runtime modules (fs, path, http, crypto, child_process, etc.) in server code.
- NEVER use browser DOM globals (window, document, localStorage) in server code.
- NEVER access Spreadsheet / Drive / Gmail APIs inside loops without batching.
- ALWAYS use PropertiesService.getScriptProperties() for persistent configuration.
- Execution timeout: Maximum 6 minutes per single run.
```

---

## 1. Node.js 組み込みモジュールの禁止

GAS サーバー環境には Node.js のコアモジュールは存在しません。以下のようなインポートや呼び出しはコンパイルまたは実行時にクラッシュします。

- ❌ **禁止**: `import fs from 'node:fs';` / `require('fs')`
- ❌ **禁止**: `import path from 'node:path';`
- ❌ **禁止**: `import http from 'node:http';` (外部HTTP通信には `UrlFetchApp.fetch()` を使用)
- ❌ **禁止**: `import crypto from 'node:crypto';` (ハッシュ生成等には `Utilities.computeDigest()` を使用)
- ❌ **禁止**: `import child_process from 'node:child_process';`

---

## 2. ブラウザ API / DOM の禁止

サーバーサイドコード（`src/app.ts`, `server/app.ts` など）はヘッドレスな V8 環境で動作します。

- ❌ **禁止**: `window`, `document`, `HTMLElement`, `localStorage`, `sessionStorage`
- ❌ **禁止**: 生の `fetch()` や `XMLHttpRequest`（クライアント側以外）

---

## 3. 実行時間制限とクォータ

- **実行時間制限**: 1回の関数実行上限は **最大6分** です（Google Workspace アカウントでも同様）。
- **長時間処理の設計**:
  - 大量データのループ処理は、一度に処理しようとせず、プロパティ（`PropertiesService`）に現在位置を保存して次回トリガーで再開するか、一括バッチ処理を活用してください。
- **呼び出し回数制限**:
  - `SpreadsheetApp`, `DriveApp`, `GmailApp`, `UrlFetchApp` などの外部サービス呼び出しには日次の利用クォータが存在します。不要な連続呼び出しは厳禁です。

---

## 4. 環境変数・設定値の永続化

- GAS には `.env` ファイルを読み込むランタイムの仕組みはありません（ビルド時を除く）。
- API キー、Webhook URL、接続情報などの設定値は、**`PropertiesService.getScriptProperties()`** を使用して取得・保存してください。

```typescript
// Good
const scriptProperties = PropertiesService.getScriptProperties();
const apiKey = scriptProperties.getProperty('API_KEY');
if (!apiKey) {
  throw new Error('API_KEY is not configured in Script Properties.');
}
```
