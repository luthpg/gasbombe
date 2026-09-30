---
name: gas-add-endpoint
description: CiderJS プロジェクトにおける新規 RPC エンドポイントの追加、型自動生成、モック作成、クライアント呼び出しの一連ワークフロー
---

# CiderJS エンドポイント追加スキル (gas-add-endpoint)

本スキルは、新しいサーバーサイド関数を追加し、<%= templateType.startsWith('server-') ? '型安全に公開' : 'クライアントから型安全に呼び出せるように' %>する手順書です。

---

## ワークフロー

### Step 1: サーバー関数の実装 (`<%= templateType.startsWith('server-') ? 'src/app.ts' : 'server/app.ts' %>`)

1. `@ciderjs/gasnuki` の `serialize` を使用して、型情報を保持した関数を定義します。

```typescript
// <%= templateType.startsWith('server-') ? 'src/app.ts' : 'server/app.ts' %>
import { serialize, type JsonString } from '@ciderjs/gasnuki/json';

export interface Item {
  id: string;
  title: string;
  updatedAt: Date;
}

export function getItemList(category: string): JsonString<Item[]> {
  // GAS ロジック（Spreadsheet 等）
  const items: Item[] = [
    { id: '1', title: `Item in ${category}`, updatedAt: new Date() },
  ];

  return serialize(items);
}
```

<% if (!templateType.startsWith('server-')) { -%>

### Step 2: 型定義の自動生成 (`gasnuki`)

ターミナルで以下のコマンドを実行します。

```bash
pnpm run generate
```

`types/appsscript/client.ts` が自動生成・更新され、`ServerScripts` インターフェースに `getItemList` が反映されます。
<% } -%>
<% if (!templateType.startsWith('server-')) { -%>

### Step 3: ローカルモックの追加 (`src/lib/server.ts`)

ローカル開発（`pnpm dev`）時に動作するように、モック関数を登録します。

```typescript
// src/lib/server.ts
const mockupFunctions: PartialScriptType<ServerScripts> = {
  // 既存のモック...
  getItemList: async (category) => {
    return JSON.stringify([
      { id: 'mock-1', title: `Mock Item (${category})`, updatedAt: new Date().toISOString() },
    ]) as any;
  },
};
```

### Step 4: クライアントコンポーネントからの呼び出し

```tsx
import { serverScripts } from '../lib/server';

async function fetchItems() {
  // items は自動的に Item[] 型（Date 復元済み）として推論されます！
  const items = await serverScripts.getItemList('books');
  console.log(items[0].title);
}
```

<% } -%>

### Step <%= !templateType.startsWith('server-') ? '5' : '2' %>: リント・テスト・ビルド検証

```bash
pnpm run check && pnpm test && pnpm run build
```

型エラーなく正常にビルドが完了することを確認します。
