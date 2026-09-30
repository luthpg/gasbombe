# GitHub Copilot Instructions for <%= projectName %>

Google Apps Script (GAS) 向け TypeScript アプリケーションの開発指示書です。
GitHub Copilot は、以下の英語制約ブロックおよび日本語の規約に従って補完・コード生成を行ってください。

---

## 🚨 Critical Constraints (エージェント遵守事項)

```text
- NEVER use Node.js runtime modules (fs, path, http, crypto, child_process, etc.) in server code.
- NEVER use browser DOM globals (window, document, localStorage) in server code.
- NEVER use standard fetch() for GAS backend calls on client side (use gasnuki / google.script.run).
- NEVER access Spreadsheet cells in loops (ALWAYS use getValues() / setValues() for batching).
- ALWAYS use strict equality (=== and !==), excluding nullish checks (== null and != null).
- ALWAYS use `import type` for type-only imports (verbatimModuleSyntax: true).
- ALWAYS place code inside directories included in tsconfig (src, tests, server, types).
```

---

## 重要な開発原則

1. **GAS 実行環境**:
   - サーバーは Google Apps Script (V8) で動作し、Node.js ではありません。
   - 設定値や機密情報の永続化には `PropertiesService.getScriptProperties()` を使用してください。

2. **品質・コーディング標準**:
   - Biome のリント・フォーマットルールに従ってください。
   - 常に厳格等価演算子（`===` / `!==`）を使用してください（nullish 比較 `== null` / `!= null` のみ例外）。
   - 型インポートには必ず `import type` を使用してください。

3. **パフォーマンス最適化**:
   - スプレッドシート等の操作は、`getValues()` で 2D 配列を一括取得し、メモリ上で処理した後に `setValues()` で一括書き込みしてください。

詳細なルールやワークフロースキルは `.agents/` ディレクトリを参照してください。
