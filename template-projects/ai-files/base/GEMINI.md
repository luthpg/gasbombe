# Gemini / Antigravity Guide for <%= projectName %>

このプロジェクトは Google Apps Script (GAS) 向けの開発環境（Gasbombe 生成）です。
Gemini および Google Antigravity は、以下の英語制約ブロックおよび `.agents/` 以下のルール・スキルを優先して読み込み、自律的に遵守してください。

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

## 開発コマンド

- **リント & フォーマット**: `pnpm run check` (Biome)
- **テスト実行**: `pnpm test` (Vitest + GAS Mock)
- **ビルド**: `pnpm run build`
- **GAS 反映**: `pnpm run push` (`clasp push`)
- **デプロイ**: `pnpm run deploy` (`clasp create-deployment`)

---

## 必須ルール・ガイドライン

1. **GAS サンドボックス制約**:
   - サーバーサイドコードでは Node.js 組み込みモジュール（`fs`, `path`, `http` 等）やブラウザ API（`window`, `document` 等）は使用できません。
   - 詳細: [.agents/rules/01-gas-constraints.md](.agents/rules/01-gas-constraints.md)

2. **コーディングスタイル (Biome & Strict Equality)**:
   - Biome ルールに従い、常に `===` / `!==` を使用してください（nullish 比較 `== null` / `!= null` のみ例外）。
   - 型インポートは `import type { ... }` を使用してください。
   - 詳細: [.agents/rules/02-coding-style.md](.agents/rules/02-coding-style.md)

3. **型定義 & tsconfig**:
   - GAS グローバル型は `@types/google-apps-script` で提供されます。
   - 詳細: [.agents/rules/03-tsconfig-and-types.md](.agents/rules/03-tsconfig-and-types.md)

4. **アンチパターン防止**:
   - スプレッドシートのループ内アクセス禁止など、[.agents/rules/05-antipatterns.md](.agents/rules/05-antipatterns.md) を確認してください。

---

## 利用可能なスキル

- テスト作成: [.agents/skills/gas-test/SKILL.md](.agents/skills/gas-test/SKILL.md)
- ビルド・Push: [.agents/skills/gas-build-and-push/SKILL.md](.agents/skills/gas-build-and-push/SKILL.md)
- デプロイ: [.agents/skills/gas-deploy/SKILL.md](.agents/skills/gas-deploy/SKILL.md)
