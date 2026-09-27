# <%= projectName %> - AI Agent 開発ガイド

このプロジェクトは、Google Apps Script (GAS) 向けの開発環境（Gasbombe により生成）です。
AI Coding Agent（Gemini, Codex, Claude Code, Cursor, Copilot 等）は、本ドキュメントおよび `.agents/rules/` に記載された制約とワークフローを必ず遵守してください。

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

## 1. プロジェクト基本コマンド

| コマンド | 説明 |
| :--- | :--- |
| `npm run check` / `pnpm run check` | Biomeによるリント & フォーマット修正（コミット前に必ず実行） |
| `npm test` / `pnpm test` | Vitestによる単体テスト実行（`@ciderjs/vitest-plugin-gas-mock` 内包） |
| `npm run build` / `pnpm run build` | プロジェクトの完全ビルド（型チェック、バンドル処理） |
| `npm run push` / `pnpm run push` | `@google/clasp` による GAS へのスクリプト反映（`clasp push`） |
| `npm run deploy` / `pnpm run deploy` | GAS デプロイの作成（または `pnpm exec clasp create-deployment`） |

---

## 2. コア制約とアーキテクチャ原則

### (1) GAS サンドボックス制約

- サーバーサイドのコードは Node.js ではなく Google Apps Script (V8) 上で実行されます。
- `fs`, `path`, `http`, `crypto`, `child_process` 等の **Node.js 組み込みモジュールは絶対に使用できません**。
- `window`, `document` 等のブラウザ API はサーバーコード内では使用できません。
- 詳細は [.agents/rules/01-gas-constraints.md](.agents/rules/01-gas-constraints.md) を参照してください。

### (2) コーディング規約 (Biome & TypeScript)

- リント・フォーマットは Biome のルールに従います。
- 常に厳格等価演算子（`===` / `!==`）を使用してください（nullish 比較 `== null` / `!= null` のみ例外）。
- TypeScript 5.8+ の `verbatimModuleSyntax: true` を採用しているため、型のみのインポートには必ず `import type { ... }` を使用してください。
- 詳細は [.agents/rules/02-coding-style.md](.agents/rules/02-coding-style.md) を参照してください。

### (3) tsconfig と型解決ルール

- `tsconfig.json`（または `tsconfig.app.json`）では `"types": ["google-apps-script"]` を指定しています。
- 新規ファイルを作成する際は、必ず `include` に含まれるディレクトリ（`src`, `tests`, `server`, `types` 等）に配置してください。
- 詳細は [.agents/rules/03-tsconfig-and-types.md](.agents/rules/03-tsconfig-and-types.md) を参照してください。

---

## 3. 定型タスク（Agent Skills）

定型作業を実行する際は、`.agents/skills/` 内の手順書を参照・実行してください。

1. **単体テストの作成・実行**: [.agents/skills/gas-test/SKILL.md](.agents/skills/gas-test/SKILL.md)
   - `@ciderjs/vitest-plugin-gas-mock` を使用した型安全な GAS API モック作成。
2. **ビルド & Push**: [.agents/skills/gas-build-and-push/SKILL.md](.agents/skills/gas-build-and-push/SKILL.md)
   - `check` → `test` → `build` → `clasp push` の検証・トラブルシュート。
3. **デプロイ & CI/CD**: [.agents/skills/gas-deploy/SKILL.md](.agents/skills/gas-deploy/SKILL.md)
   - Web App デプロイおよび `@ciderjs/clasp-auth` による GitHub Actions 連携。

---

## 4. やってはいけないアンチパターン

AI Agent が最も起こしやすいミス（スプレッドシートのループ内セルアクセス、手動モックの自作、`export default` の多用等）については、[.agents/rules/05-antipatterns.md](.agents/rules/05-antipatterns.md) を必ず確認してください。
