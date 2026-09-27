# サーバーサイド GAS アーキテクチャ規約 (04-server-architecture)

本ドキュメントは、サーバーサイド特化テンプレート（`server-ts`, `server-js`, `server-ciderjs`）におけるアーキテクチャおよび関数公開の規約です。

---

## 🚨 Critical Constraints (エージェント遵守事項)

```text
- ALWAYS export public functions with named export (export function myFunction() { ... }).
- NEVER use `export default` for GAS entrypoint functions (it loses the function name in global scope).
- Rolldown automatically strips the trailing `export { ... }` via rolldown-plugin-remove-export.
- Follow the "self-cleaning trigger design" for scheduled triggers to avoid zombie triggers.
- Correctly choose PropertiesService scope (ScriptProperties, UserProperties, DocumentProperties).
```

---

## 1. エントリーポイントとバンドル構造

- **エントリーポイント**: `src/app.ts` (または `src/app.js`)
- **出力先**: `dist/app.js`
- **バンドラー**: **Rolldown** (`rolldown.config.ts`)

---

## 2. 関数公開規約と `rolldown-plugin-remove-export`

### 仕組み

Google Apps Script のランタイムは ES モジュールの `export { ... }` 構文を解釈できません。
本プロジェクトでは、`rolldown-plugin-remove-export` を利用して、バンドル結果の末尾にある `export` 宣言をビルド時に自動除去します。

### ルール

- GAS のエディタやトリガー、Web App から直接呼び出したい関数は、**通常の ES モジュールとして `export function ...` と定義してください**。
- バンドラーが export 宣言を除去するため、GAS 上ではグローバルスコープの関数宣言として展開されます。

```typescript
// Good: GAS から実行可能な関数として公開される
export function main() {
  Logger.log('Executed main task');
}

export function doGet(e: GoogleAppsScript.Events.DoGet) {
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// 内部でのみ使用するヘルパー関数は export しない
function calculateTax(amount: number): number {
  return amount * 0.1;
}
```

---

## 3. GAS 標準イベント・トリガー関数の実装規約

### (1) Web App エンドポイント

- `doGet(e)` / `doPost(e)`:
  戻り値には必ず `HtmlService.createHtmlOutput(...)` または `ContentService.createTextOutput(...)` を返してください。

### (2) シンプルイベントトリガー

- `onOpen(e)`: スプレッドシートやドキュメントを開いた際にカスタムメニューを追加。
- `onEdit(e)`: セル編集時に即座に実行（制限: 外部通信 `UrlFetchApp` 等は権限が必要なため呼び出し不可）。

### (3) インストーラブル・時間駆動トリガー

- 定期実行したいバッチ関数は、引数を取らない独立した関数として `export function cronJob()` のように定義します。

### (4) チーム運用を見据えた「セルフクリーニングトリガー設計」

GAS のトリガーは「設定者の Google アカウント」に紐づくため、作成者の異動・退職時にエラーを吐き続ける「ゾンビトリガー」化や、他人のトリガーが管理画面から消せない問題が発生します。
これを回避するため、定期実行関数の冒頭で `ScriptProperties` の停止フラグを確認し、自律的にトリガーを削除する設計が推奨されます。

```typescript
export function dailyTask() {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('TRIGGER_RESET_FLAG') === 'true') {
    console.warn('リセット命令を検知したため、自身のトリガーを削除します');
    const triggers = ScriptApp.getProjectTriggers();
    for (const trigger of triggers) {
      if (trigger.getHandlerFunction() === 'dailyTask') {
        ScriptApp.deleteTrigger(trigger);
      }
    }
    props.deleteProperty('TRIGGER_RESET_FLAG');
    return;
  }

  // === 通常業務ロジック ===
}
```

---

## 4. プロパティストア（PropertiesService）の3つのスコープ

データの永続化や設定管理では、スコープを正しく使い分けてください。

| スコープ | メソッド | 用途・共有範囲 |
| :--- | :--- | :--- |
| **ScriptProperties** | `PropertiesService.getScriptProperties()` | プロジェクト全体で全員共有（APIキー、システム設定、トリガー管理フラグ等） |
| **UserProperties** | `PropertiesService.getUserProperties()` | 実行ユーザーごとに独立（ユーザー別の設定、個人用トークン等） |
| **DocumentProperties** | `PropertiesService.getDocumentProperties()` | コンテナバインド時、そのシート/文書に紐づいて全員共有 |

---

## 5. 静的設定ファイルの管理

- `appsscript.json` などのマニフェストファイルは、ビルド時に `cpy src/*.json dist/` によって自動コピーされます。
- OAuth スコープや実行権限の変更は、`src/appsscript.json` を編集してください。
