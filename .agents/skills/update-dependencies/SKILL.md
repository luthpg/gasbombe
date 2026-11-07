---
name: update-dependencies
description: テンプレートプロジェクト群（@gasbombe/*）およびルートの依存関係を一括で最新化（update -L）し、Vue テンプレートの TypeScript バージョン維持・整合性同期・ビルド・テストまでを一貫して実行するワークフロー
---

# 依存関係一括アップデートスキル (update-dependencies)

本スキルは、`pnpm-workspace.yaml` の `catalog:`、各テンプレートプロジェクト（`template-projects/*` / `@gasbombe/*`）、およびルートパッケージ（`@ciderjs/gasbombe`）の依存関係を最新バージョン（`--latest` / `-L`）へ更新し、検証を行うための手順書です。

---

## 重要な前提条件（Vue 系テンプレートの TypeScript 制約）

`template-projects/vue`（`@gasbombe/vue`）および `template-projects/vue-ciderjs`（`@gasbombe/vue-ciderjs`）では、`vue-tsc` がまだ `typescript@7` に対応していないため、以下の構成を採っています。

- **`"typescript": "^5.8.3"`**: フロントエンドおよび `vue-tsc` 用に TypeScript 5.x 系を維持（**`^7.x` へ上げてはいけない**）
- **`"@typescript/v7": "npm:typescript@^7.x"`**: サーバーサイド（`pnpm run tsc`）の型チェック用に TypeScript 7 系をエイリアス導入

そのため、全テンプレートに対して単純に `pnpm -r update -L` や `pnpm -F @gasbombe/vue* update -L` を実行すると、`vue` / `vue-ciderjs` の `"typescript"` まで `^7.x` に書き換わってしまい、`vue-tsc` が壊れます。必ず以下のスクリプトまたは除外指定（`"!typescript"`）を使用してください。

---

## ワークフロー

### Step 1: 依存関係の一括アップデート実行

ルートディレクトリの `package.json` に定義された以下のスクリプトを実行します。

- **テンプレートプロジェクト群（＋ `catalog:`）のみを更新する場合**:

  ```bash
  pnpm run up:templates
  ```

- **ルートパッケージも含めてワークスペース全体を更新する場合**:

  ```bash
  pnpm run up:all
  ```

> **内部で実行されるコマンド**:
>
> 1. `pnpm --filter "@gasbombe/*" --filter "!@gasbombe/vue*" update -L`（または `-r`）により、Vue 以外の全パッケージと `pnpm-workspace.yaml` の `catalog:`（`typescript` を含む）を最新化します。
> 2. `pnpm --filter "@gasbombe/vue*" update -L "!typescript"` により、`vue` / `vue-ciderjs` の `"typescript": "^5.8.3"` を維持したまま、`@typescript/v7` やその他の依存関係を最新化します。

※ もし誤って `vue` / `vue-ciderjs` の `"typescript"` が `^7.x` に更新されてしまった場合は、`template-projects/vue/package.json` と `template-projects/vue-ciderjs/package.json` の `"typescript"` を `"^5.8.3"` に戻してから `pnpm install` を実行してください。

---

### Step 2: マニフェスト・設定ファイルの整合性チェック

アップデート完了後、`git diff` を確認し、以下の3点をチェック・同期します。

1. **Vue テンプレートの `typescript` と `@typescript/v7` の確認**
   - `template-projects/vue/package.json` と `template-projects/vue-ciderjs/package.json` において、`"typescript": "^5.8.3"` が維持されていること。
   - `"@typescript/v7"` のバージョン指定（`npm:typescript@^7.x.x`）が、`pnpm-workspace.yaml` の `catalog.typescript` のバージョンと一致していること。
2. **ルート `package.json` の `peerDependencies` の同期**
   - ルート `package.json` の `devDependencies` に含まれる CLI ランタイム依存（`@inquirer/prompts`, `commander`, `consola`, `ejs`, `glob`）のメジャーバージョンが上がった場合、`peerDependencies` の許容レンジ（例: `"ejs": "^3 || ^4 || ^5 || ^6 || ^7"`）にも新しいメジャーバージョンを追加すること。
3. **ルート `biome.json` のマイグレーション（`$schema` バージョン同期）**
   - `pnpm-workspace.yaml` の `catalog['@biomejs/biome']` が更新された場合、ルートディレクトリで以下のコマンドを実行して `biome.json` をマイグレーションすること：

     ```bash
     pnpm exec biome migrate --write
     ```

   - （※ `template-projects/common/common_biome.json` は `<%= biomeVersion %>` によりビルド時に自動展開されるため手動変更不要です）

---

### Step 3: コード品質・ビルド・全テンプレートテストの実行

以下のコマンドを順に実行し、アップデートによる破壊的変更がないことを検証します。

1. **Biome リント & フォーマットチェック**:

   ```bash
   pnpm run check
   ```

2. **Markdown リントチェック**:

   ```bash
   pnpm run lint:md
   ```

3. **ビルドとテンプレート再生成（`dist/catalog.json`・`dist/templates/` 更新）**:

   ```bash
   pnpm run build
   ```

4. **全単体テスト & 全テンプレート統合検証の実行**:

   ```bash
   pnpm run test
   ```

   - `tests/index.spec.ts`（CLI / ジェネレーター単体テスト）および `tests/templates.spec.ts`（全8テンプレートの Biome チェック、ビルド、`tsc` / `vue-tsc` 型チェック、Vite 開発サーバー起動、Vitest 単体テスト）がすべてパスすることを確認します。
