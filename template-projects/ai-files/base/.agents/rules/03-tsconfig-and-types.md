# tsconfig と型解決ルール (03-tsconfig-and-types)

本プロジェクトにおける TypeScript の設定方針と、型解決を正常に行うための重要なルールです。

---

## 🚨 Critical Constraints (エージェント遵守事項)

```text
- ALWAYS configure "types": ["google-apps-script"] in tsconfig for global GAS APIs.
- ALWAYS place source code within directories listed in tsconfig "include" (src, tests, server, types).
- NEVER omit the "types" directory from tsconfig "include", as generated gasnuki types live there.
- ALWAYS use path aliases (@/* -> ./src/*, ~/* -> ./*) instead of deeply nested relative imports.
```

---

## 1. `compilerOptions.types` の明示指定

GAS のグローバル API（`SpreadsheetApp`, `DriveApp`, `Logger` 等）をグローバルスコープとして正しく認識させるため、`tsconfig.json`（または `tsconfig.app.json`）では以下のように明示指定されています。

```json
{
  "compilerOptions": {
    "types": ["google-apps-script"]
  }
}
```

> [!WARNING]
> **TypeScript の探索仕様上の注意**
> `compilerOptions.types` を指定すると、`node_modules/@types` 配下にある他の型定義の自動ロードが無効化されます。新規に型定義パッケージ（例: `@types/react` 等）を追加・参照する際は、必要に応じて `types` 配列または `include` に正しく含まれているか確認してください。

---

## 2. `include` への必須ディレクトリの包含

プロジェクト内のファイルは、必ず `tsconfig` の `include` に指定されたディレクトリ配下に配置してください。

一般的な指定例:

```json
{
  "include": ["src", "tests", "server", "types"]
}
```

### 特に重要な注意点

- **`types` ディレクトリ**:
  型定義ファイルや自動生成ファイル（`gasnuki` 生成物等）は `types/` ディレクトリ配下に出力されます。これが `include` から外れると、型推論が完全に失われ、ビルドエラーの原因となります。
- **新規ファイル追加時**:
  スクリプトやヘルパー関数を追加する際は、必ず `src/` または `server/` 配下に作成し、未登録の新規トップレベルディレクトリに直接配置しないようにしてください。

---

## 3. パスエイリアス

プロジェクトでは以下のパスエイリアスが設定されています。相対パスの過度なネスト（`../../../`）を避け、エイリアスを活用してください。

- `@/*` → `./src/*`
- `~/*` → `./*`
