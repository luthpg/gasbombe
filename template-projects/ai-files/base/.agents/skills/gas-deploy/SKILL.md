---
name: gas-deploy
description: GAS デプロイ作成・バージョン更新、デプロイメントライフサイクル管理、および CI/CD 連携手順
---

# GAS デプロイスキル (gas-deploy)

本スキルは、Google Apps Script のデプロイ作成・更新（Web App / API）および GitHub Actions での CI/CD 連携手順書です。

---

## デプロイメントライフサイクル

| ステップ | スクリプト | コマンド | 用途 |
| :--- | :--- | :--- | :--- |
| コードを GAS へ反映 | `pnpm run push` | `clasp push` | `dist/` の内容を GAS プロジェクトへ転送 |
| 初回デプロイ作成 | `pnpm run deploy` | `clasp create-deployment` | 新規デプロイメント（URL・ID）を発行 |
| 継続的な更新 | `pnpm run update` | `clasp update-deployment $GAS_DEPLOYMENT_ID` | 既存 URL のまま最新バージョンを適用 |

> **ポイント**: `pnpm run deploy`（`create-deployment`）は新規 ID を発行するため URL が変わります。
> 公開済みの Web App URL を保ちたい場合は `pnpm run update`（`update-deployment`）を使用してください。

---

## 1. ローカルからのデプロイ作成（初回）

```bash
pnpm run push   # GAS へコードを反映
pnpm run deploy # 新規デプロイメント発行
```

デプロイ後に表示される **Deployment ID** を `.env` ファイルへ記録してください:

```bash
# .env（.gitignore に追加すること）
GAS_DEPLOYMENT_ID=AKfycb...your-deployment-id...
```

---

## 2. 継続的なデプロイ更新（通常運用）

```bash
pnpm run push   # GAS へコードを反映
pnpm run update # 既存デプロイを最新バージョンへ更新（URL 不変）
```

`pnpm run update` は内部的に `.env` の `GAS_DEPLOYMENT_ID` を読み込み、`dotenv-cli` + `cross-var` を使って以下を実行します:

```bash
clasp update-deployment <GAS_DEPLOYMENT_ID>
```

---

## 3. GitHub Actions CI/CD のセットアップ

<% if (templateType.includes('ciderjs')) { -%>

### 認証情報のアップロード（@ciderjs/clasp-auth 利用）

ローカルで `clasp login` を実行後、GitHub Secrets に認証情報を登録します:

```bash
pnpm run auth my-org/my-repo
```

### GitHub Actions ワークフローの例 (`.github/workflows/deploy.yml`)

```yaml
name: Deploy GAS
on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: pnpm/action-setup@v4
        with:
          version: 11.24.0
      - uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: 'pnpm'

      - name: Setup clasp auth
        uses: ciderjs/clasp-auth@v0.1.3
        with:
          json: ${{ secrets.CLASPRC_JSON }}

      - name: Setup .clasp.json
        env:
          CLASP_JSON: ${{ secrets.CLASP_JSON }}
        run: printf '%s' "$CLASP_JSON" > ".clasp.json"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Check and Test
        run: pnpm run check && pnpm test

      - name: Build
        run: pnpm run build

      - name: Push to GAS
        run: pnpm run push

      - name: Deploy (update existing deployment)
        env:
          GAS_DEPLOYMENT_ID: ${{ secrets.GAS_DEPLOYMENT_ID }}
        run: clasp update-deployment "$GAS_DEPLOYMENT_ID"
```

<% } else { -%>

### 前提: Secrets の準備

ローカルで `clasp login` を実行し、生成された `~/.clasprc.json` と `.clasp.json`（プロジェクト設定）を GitHub Secrets に登録します:

```bash
# clasp 認証情報を登録
gh secret set CLASPRC_JSON --repo my-org/my-repo < "$HOME/.clasprc.json"

# プロジェクト設定ファイルを登録
gh secret set CLASP_JSON --repo my-org/my-repo < ".clasp.json"

# デプロイメント ID を登録
gh secret set GAS_DEPLOYMENT_ID --repo my-org/my-repo
```

### ワークフローの例（`.github/workflows/deploy.yml`）

```yaml
name: Deploy GAS
on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: pnpm/action-setup@v4
        with:
          version: 11.24.0
      - uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: 'pnpm'

      - name: Setup clasp auth
        env:
          CLASPRC_JSON: ${{ secrets.CLASPRC_JSON }}
        run: |
          test -n "$CLASPRC_JSON"
          printf '%s' "$CLASPRC_JSON" > "$HOME/.clasprc.json"
          chmod 600 "$HOME/.clasprc.json"

      - name: Setup .clasp.json
        env:
          CLASP_JSON: ${{ secrets.CLASP_JSON }}
        run: printf '%s' "$CLASP_JSON" > ".clasp.json"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Check and Test
        run: pnpm run check && pnpm test

      - name: Build
        run: pnpm run build

      - name: Push to GAS
        run: pnpm run push

      - name: Deploy (update existing deployment)
        env:
          GAS_DEPLOYMENT_ID: ${{ secrets.GAS_DEPLOYMENT_ID }}
        run: clasp update-deployment "$GAS_DEPLOYMENT_ID"
```

<% } -%>
