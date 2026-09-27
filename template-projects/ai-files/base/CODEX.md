# OpenAI Codex / ChatGPT Guide for <%= projectName %>

Google Apps Script (GAS) 向け開発プロジェクト（Gasbombe 生成）です。
Codex および ChatGPT は、以下の英語制約ブロックおよび日本語のワークフローガイドを遵守してください。

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

## 主なコマンド

- **リント & フォーマット**: `pnpm run check` (Biome)
- **テスト実行**: `pnpm test` (Vitest + GAS Mock)
- **ビルド**: `pnpm run build`
- **GAS 反映**: `pnpm run push` (`clasp push`)
- **デプロイ**: `pnpm run deploy` (`clasp create-deployment`)

---

## 設計規約と詳細ルール

- 総合ガイド: [.agents/AGENTS.md](.agents/AGENTS.md)
- GASサンドボックス制約: [.agents/rules/01-gas-constraints.md](.agents/rules/01-gas-constraints.md)
- コーディング規約: [.agents/rules/02-coding-style.md](.agents/rules/02-coding-style.md)
- tsconfig & 型設定: [.agents/rules/03-tsconfig-and-types.md](.agents/rules/03-tsconfig-and-types.md)
- アンチパターン集: [.agents/rules/05-antipatterns.md](.agents/rules/05-antipatterns.md)
