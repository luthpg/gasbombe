# gasnuki の型保持 JSON 通信と型安全復元 (03-gasnuki-types)

本ドキュメントは、本プロジェクトにおける `@ciderjs/gasnuki` を用いた型安全なデータ通信の規約です。

---

## 🚨 Critical Constraints (エージェント遵守事項)

```text
- ALWAYS use serialize(data) on server side to return typed JSON strings (JsonString<T>).
- ALWAYS configure getPromisedServerScripts<ServerScripts>({ parseJson: true }) on client side.
- NEVER use standard JSON.parse() on client side, as it loses type info and degrades to `any`.
- ALWAYS run `pnpm run generate` after modifying server-side function signatures to update types.
```

---

## 1. 課題: 通常の JSON 通信における「型落ち」

従来の GAS とクライアント間の通信で `JSON.stringify()` / `JSON.parse()` を使用すると、以下の深刻な問題が発生します。

1. **戻り値が `any` に落ちる**: `JSON.parse()` のシグネチャは `any` であるため、コンパイル時の型安全性が失われる。
2. **Date オブジェクトが文字列化される**: 日付データが文字列（ISO 8601）になり、手動で `new Date()` し直さない限り `Date` のメソッド（`getTime()`, `toISOString()` 等）が呼べず実行時エラーになる。

---

## 2. 解決策: `JsonString<T>` と `parseJson: true`

`@ciderjs/gasnuki` は、TypeScript の Branded Type を利用してこの問題を解決しています。

```typescript
// gasnuki 内部定義
declare const __brand: unique symbol;
export type JsonString<T> = string & { [__brand]: T };
```

### サーバー側の実装 (`<%= templateType.startsWith('server-') ? 'src/app.ts' : 'server/app.ts' %>`)

オブジェクトをクライアントへ返す際は、必ず `@ciderjs/gasnuki` の `serialize` 関数を使用してください。

```typescript
import { serialize, type JsonString } from '@ciderjs/gasnuki';

export interface UserProfile {
  id: string;
  name: string;
  createdAt: Date;
}

export function getUserProfile(userId: string): JsonString<UserProfile> {
  const profile: UserProfile = {
    id: userId,
    name: 'Alice',
    createdAt: new Date(),
  };

  // serialize() は JsonString<UserProfile> 型の文字列を返します
  return serialize(profile);
}
```

<% if (!templateType.startsWith('server-')) { -%>

### クライアント側の実装 (`src/lib/server.ts`)

クライアント側では、`getPromisedServerScripts` に `{ parseJson: true }` を渡します。

```typescript
import { getPromisedServerScripts } from '@ciderjs/gasnuki/promise';
import type { ServerScripts } from '~/types/appsscript/client';

export const serverScripts = getPromisedServerScripts<ServerScripts>({
  parseJson: true, // ★ これにより UnwrapJson<T> が適用される
});
```

### コンポーネントからの呼び出し

```typescript
const profile = await serverScripts.getUserProfile('123');

// profile の型は any ではなく完全な UserProfile として推論されます！
console.log(profile.name); // string
console.log(profile.createdAt instanceof Date); // true (自動的に Date に復元される)
```

<% } -%>

---

## 3. 型定義の自動生成と tsconfig

- サーバー関数を追加・変更した際は、必ず **`pnpm run generate`**（`gasnuki` コマンド）を実行してください。
- `types/appsscript.d.ts` に最新の `ServerScripts` 型が生成されます。
- `tsconfig.app.json` の `include` に `"types"` が含まれているため、プロジェクト全体で型が即座に同期されます。
