# CiderJS フルスタックアーキテクチャ規約 (ciderjs-architecture)

本ドキュメントは、CiderJS を採用した本プロジェクトにおける設計規約です。

---

## 🚨 Critical Constraints (エージェント遵守事項)

```text
- ALWAYS define parameter schemas (export const schema = z.object(...)) in the SAME file as the page component.
- NEVER import route schemas from external files (static AST analysis will fail).
- NEVER use the reserved word `page` in schema keys (use `pageIndex` instead).
- NEVER pass large objects as route parameters (GAS URL limit is ~2KB).
- NEVER execute side effects at the top level of page files (they evaluate on app startup).
- ALWAYS return a cleanup function from useEffect (React) to prevent memory leaks in SPA.
- ALWAYS register cleanup via onUnmounted (Vue) — do NOT return a cleanup function from onMounted.
```

---

## 1. サーバーサイド関数公開と `rolldown-plugin-remove-export`

- **サーバー側エントリーポイント**: `<%= templateType.startsWith('server-') ? 'src/app.ts' : 'server/app.ts' %>`
- **バンドル出力先**: `dist/app.js`
- **ルール**:
  GAS から実行させたい関数（Web App, トリガー, RPC）は通常通り `export function ...` として定義してください。
  Rolldown ビルド時に `removeExportPlugin` が末尾の export 宣言を除去し、GAS のグローバルスコープに関数宣言を展開します。
<% if (!templateType.startsWith('server-')) { -%>

---

## 2. ファイルベースルーティング (`@ciderjs/city-gas`)

本プロジェクトでは、`src/pages/` 配下のファイル構造に基づいた型安全なファイルベースルーティングを提供します。

### (1) ページコンポーネントとスキーマ定義

- ページコンポーネントは **default export** してください。
- ページパラメータのバリデーションは **`export const schema = z.object(...)`** で定義します。

```tsx
// src/pages/users/[id].<%= templateType === 'vue-ciderjs' ? 'vue' : 'tsx' %>
import { z } from 'zod';
import { useParams, useNavigate } from '<%= templateType === 'vue-ciderjs' ? '@ciderjs/city-gas/vue' : '@ciderjs/city-gas/react' %>';

// ★ 同一ファイル内に直接スキーマを定義する（別ファイルからの import は禁止）
export const schema = z.object({
  tab: z.string().optional(),
  pageIndex: z.coerce.number().optional(), // ★ 予約語 'page' は使用禁止！
});

export default function UserDetailPage() {
  const params = useParams('/users/[id]');
  const navigate = useNavigate();

  return (
    <div>
      <h1>User ID: {params.id}</h1>
      <button onClick={() => navigate('/users/[id]', { id: '456', tab: 'profile' })}>
        Next User
      </button>
    </div>
  );
}
```

### (2) 重要制約

1. **スキーマの同一ファイル内定義**:
   静的 AST 解析によりルート定義を生成するため、別ファイルから `schema` をインポートしてはなりません。
2. **予約語 `page` の禁止**:
   内部で `?page=...` クエリを使用するため、スキーマのキー名に `page` を使用できません。ページネーションには `pageIndex` などを命名してください。
3. **GAS URL 長 2KB 制限**:
   パラメータは URL に JSON シリアライズされるため、巨大な配列やオブジェクトをルートパラメータとして渡さないでください。
4. **トップレベル副作用の禁止**:
   全ページがアプリ起動時に初期評価されます。トップレベルでの API 呼び出しやログ出力は避け、必ず `useEffect` / `onMounted` 内で行ってください。
5. **クリーンアップの実装**:
   - **React**: `useEffect` のコールバックからクリーンアップ関数を返してください（タイマー・イベントリスナーの解除）。
   - **Vue**: `onMounted` からはクリーンアップ関数を返せません。代わりに `onUnmounted` を使用してください。

### (3) 特殊ファイル

- `_root.<%= templateType === 'vue-ciderjs' ? 'vue' : 'tsx' %>`: アプリケーション全体の最上位レイアウト
- `_layout.<%= templateType === 'vue-ciderjs' ? 'vue' : 'tsx' %>`: ディレクトリ内の全ルートに適用されるネストレイアウト
- `_404.<%= templateType === 'vue-ciderjs' ? 'vue' : 'tsx' %>`: 存在しないルートへアクセスされた際のコンポーネント
- `_loading.<%= templateType === 'vue-ciderjs' ? 'vue' : 'tsx' %>`: 画面遷移時・初期化中に表示されるコンポーネント

---

## 3. ローカル開発用モック機能 (`gasnuki`)

`clasp push` せずにローカル Vite dev サーバー上で画面開発・デバッグを行うため、`mockupFunctions` を定義します。

```typescript
// src/lib/server.ts
import { getPromisedServerScripts, type PartialScriptType } from '@ciderjs/gasnuki/promise';
import type { ServerScripts } from '~/types/appsscript/client';

const mockupFunctions: PartialScriptType<ServerScripts> = {
  getUserProfile: async (id) => {
    await new Promise((r) => setTimeout(r, 200)); // 擬似遅延
    return JSON.stringify({
      id,
      name: 'Mock User',
      createdAt: new Date().toISOString(),
    }) as any;
  },
};

export const serverScripts = getPromisedServerScripts<ServerScripts>({
  mockupFunctions,
  parseJson: true,
  strictMock: false,
});
```

<% } -%>
