---
name: gas-build-and-push
description: コードの検証、ビルド、clasp push による GAS への反映およびトラブルシューティング
---

# GAS ビルド & Push スキル (gas-build-and-push)

本スキルは、コード変更後の検証、バンドル処理、および `@google/clasp` を用いた GAS へのコード反映を一貫して実行・検証する手順書です。

---

## ワークフロー

### Step 1: コード品質とリントの検証

```bash
pnpm run check
```

- Biome のフォーマットとリントエラーを自動修正・検証します。エラーが残る場合は内容を修正してください。

### Step 2: テストの実行

```bash
pnpm test
```

- 全テストがグリーン（成功）であることを確認します。

### Step 3: プロジェクトのビルド

```bash
pnpm run build
```

- `package.json` の `build` スクリプトに定義されたビルドパイプライン（型チェック、Rolldown / Vite バンドル等）が実行され、`dist/` ディレクトリに生成されます。

#### ビルドエラー時のトラブルシューティング

1. **型エラー (`tsc`)**:
   - `verbatimModuleSyntax: true` のため、型インポートに `import type` が抜けていないか確認。
   - `tsconfig` の `include` に含まれるディレクトリ内にファイルがあるか確認。
2. **バンドルエラー (Rolldown)**:
   - サーバーコードに Node.js 組み込みモジュールの依存が混入していないか確認。
<%= !templateType.startsWith('server-') ? `3. **バンドルエラー (Vite)**:
   - \`vite.config.ts\` で \`gas()\` プラグインが \`viteSingleFile()\` より前に配置されているか確認（詳細は \`spa-architecture.md\` 参照）。` : '' %>

### Step 4: GAS への Push

```bash
pnpm run push
```

- `.clasp.json` の設定に従い、`dist/` 配下のファイルが GAS プロジェクトへプッシュされます。

#### Push エラー時のトラブルシューティング

- **未ログインエラー**:
  `pnpm dlx @google/clasp login` を実行して、Google アカウントでログインを完了してください。
- **.clasp.json が存在しない / scriptId が不正**:
  `.clasp.json` 内の `scriptId` が対象の Apps Script プロジェクトの ID と一致しているか確認してください。
