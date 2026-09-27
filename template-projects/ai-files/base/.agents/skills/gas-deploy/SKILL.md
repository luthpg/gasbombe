---
name: gas-deploy
description: Web App / APIとしてのデプロイ作成、バージョン管理、および @ciderjs/clasp-auth による CI/CD 連携手順
---

# GAS デプロイスキル (gas-deploy)

本スキルは、Google Apps Script のデプロイ作成（Web App / API）および GitHub Actions での CI/CD 連携（`@ciderjs/clasp-auth`）の手順書です。

---

## 1. ローカルからのデプロイ作成

コードを push した後、新しいバージョンとしてデプロイを作成します。

```bash
# 新規デプロイの作成 (package.json に deploy が定義されている場合)
pnpm run deploy

# または直接 clasp コマンドを実行（server-* など deploy スクリプトがない場合）
pnpm exec clasp create-deployment
```

内部的には `clasp create-deployment` が実行され、デプロイ ID と URL が発行されます。

---

## 2. GitHub Actions CI/CD のセットアップ (`@ciderjs/clasp-auth`)

チーム開発や自動デプロイを行うため、ローカルの clasp 認証情報を GitHub Secrets に安全に登録します。

### 前提条件

- GitHub CLI (`gh`) がインストールされ、`gh auth login` でログイン済みであること
- `clasp login` でローカルに `~/.clasprc.json` が生成されていること
- ※ プロジェクトに `@ciderjs/clasp-auth` がインストールされていない場合は `npx @ciderjs/clasp-auth upload <owner/repo>` を使用してください。

### 認証情報のアップロード

```bash
# owner/repo に GitHub Secrets (CLASPRC_JSON) を登録（例: my-org/my-repo）
pnpm run auth my-org/my-repo

# または npx で直接実行
npx @ciderjs/clasp-auth upload my-org/my-repo
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

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Check and Test
        run: pnpm run check && pnpm test

      - name: Build
        run: pnpm run build

      - name: Push to GAS
        run: pnpm run push

      - name: Deploy
        # deploy スクリプトがないテンプレートでも動作するよう clasp を直接実行
        run: pnpm exec clasp create-deployment
```
