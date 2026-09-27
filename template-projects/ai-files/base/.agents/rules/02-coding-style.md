# コーディングスタイル規約 (02-coding-style)

本プロジェクトでは、コードの統一性と堅牢性を確保するため、以下のコーディングスタイル規約を定めています。

---

## 🚨 Critical Constraints (エージェント遵守事項)

```text
- ALWAYS follow Biome rules (run `pnpm run check` before committing).
- ALWAYS use strict equality (=== and !==), excluding nullish checks (== null and != null).
- ALWAYS use `import type` for type-only imports (verbatimModuleSyntax: true).
- AVOID TypeScript runtime syntax like `enum` or `namespace` (erasableSyntaxOnly: true).
- AVOID `any` (use `unknown` with type guards or Zod schemas).
```

---

## 1. Biome 規約の遵守

- コードのフォーマットおよび静的解析には **Biome** を使用します。
- コミットやプルリクエストの前に必ず `pnpm run check` を実行し、フォーマットおよびリントエラーを自動修正・解決してください。
- 警告やエラーを無効化する `biome-ignore` の安易な追加は禁止します。

---

## 2. 厳格等価演算子 (Strict Equality)

- 等価比較には、常に厳格等価演算子 **`===`** および **`!==`** を使用してください。
- **唯一の例外**: `null` または `undefined` の両方を一度に判定する nullish チェック（`val == null` または `val != null`）のみ、緩やかな比較演算子を許容します。

```typescript
// Good
if (status === 'active') { ... }
if (item !== target) { ... }
if (value == null) { /* null or undefined */ }

// Bad
if (status == 'active') { ... }
if (count != 0) { ... }
```

---

## 3. TypeScript 5.8+ 設定と型安全規約

### (1) `verbatimModuleSyntax: true`

TypeScript の設定により、型のみをインポートする場合は必ず **`import type`** 構文を使用してください。

```typescript
// Good
import type { User, ProjectConfig } from './types';
import { executeTask } from './task';

// Bad (ビルドエラーの原因)
import { User, executeTask } from './task';
```

### (2) `erasableSyntaxOnly: true`

JavaScript へのトランスパイル時にランタイムコードを残さないため、TypeScript 独自の構文（`enum` や `namespace`）を避け、標準的な JavaScript 構文または `as const` オブジェクトを活用してください。

```typescript
// Good
export const TaskStatus = {
  Pending: 'PENDING',
  InProgress: 'IN_PROGRESS',
  Done: 'DONE',
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

// Bad
export enum TaskStatus {
  Pending = 'PENDING',
  InProgress = 'IN_PROGRESS',
  Done = 'DONE',
}
```

### (3) `any` の使用禁止

型安全性とエディタの推論を保つため、`any` の安易な使用は避けてください。型が不明な場合は `unknown` を使用し、型ガードや Zod スキーマで型を絞り込んでください。
