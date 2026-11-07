# **Gasbombe**

[![README-en](https://img.shields.io/badge/English-blue?logo=ReadMe)](./README.md)
[![Docs](https://img.shields.io/badge/docs-ciderlabs.link-blue)](https://ciderlabs.link/docs/gasbombe)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@ciderjs/gasbombe.svg)](https://www.npmjs.com/package/@ciderjs/gasbombe)
[![NPM Downloads](https://img.shields.io/npm/dw/@ciderjs/gasbombe)](https://www.npmjs.com/package/@ciderjs/gasbombe)
[![GitHub issues](https://img.shields.io/github/issues/luthpg/gasbombe.svg)](https://github.com/luthpg/gasbombe/issues)

🛢 「Gasbombe」は、Google Apps Script (GAS) のためのモダン TypeScript & フロントエンドプロジェクトジェネレーターです。

サーバーサイド TypeScript / JavaScript、React、Vue 3、HTML/JS、および CiderJS エコシステム統合テンプレート（全8種類）に対応し、AI コーディングエージェント向けのルール・ワークフロー資産を標準搭載した GAS プロジェクトを CLI または Node.js API から構築できます。

## **公式リファレンス**

詳細なドキュメント、各テンプレートのアーキテクチャ解説、CLI オプション、Programmatic API リファレンスは以下の公式ページをご覧ください。

* **[https://ciderlabs.link/docs/gasbombe](https://ciderlabs.link/docs/gasbombe)**

## **機能**

* **CLI & Programmatic API**: 対話型プロンプトによるプロジェクト構築に加え、自動化スクリプトや CI/CD から呼び出せる `generateProject` API を提供します。
* **用途に合わせて選べる8種類のテンプレート**:
  * **サーバーサイド専用**: `server-ts` (TypeScript), `server-js` (JavaScript), `server-ciderjs` (TypeScript + CiderJS)
  * **SPA / Web アプリ**: `react` (React 19 + TS), `react-ciderjs` (React 19 + TS + CiderJS), `vue` (Vue 3 + TS), `vue-ciderjs` (Vue 3 + TS + CiderJS), `html-js` (Vanilla HTML/JS)
* **モダンなビルド & テスト基盤**:
  * [Rolldown](https://rolldown.rs/) による高速なサーバーサイドコードのバンドル
  * [Vite](https://vite.dev/) + `vite-plugin-singlefile` による GAS Web アプリ向け単一 HTML バンドル
  * [Biome](https://biomejs.dev/) による高速なリント・フォーマットと [Vitest](https://vitest.dev/) による単体テスト環境
* **CiderJS エコシステム統合 (`*-ciderjs` テンプレート)**:
  * [`@ciderjs/gasnuki`](https://github.com/luthpg/gasnuki): GAS サーバー関数から型定義を自動抽出し、クライアント側から型安全に呼び出すブリッジ
  * [`@ciderjs/city-gas`](https://github.com/luthpg/city-gas): GAS Web アプリ向けの型安全なルーター
  * [`@ciderjs/vitest-plugin-gas-mock`](https://github.com/luthpg/vitest-plugin-gas-mock): Vitest での型安全な GAS グローバル API モックプラグイン
  * [`@ciderjs/clasp-auth`](https://github.com/luthpg/clasp-auth): Clasp 認証情報の GitHub Secrets 登録と GitHub Actions 自動デプロイワークフロー
* **AIエージェント対応**: Claude Code、Cursor、GitHub Copilot、Gemini / Antigravity、OpenAI Codex などの AI コーディングエージェントに最適化されたルール資産（`.agents/rules/`）と定型ワークフロー（`.agents/skills/`）を標準バンドル。選択したテンプレートに合わせて動的に構成されます。
* **パッケージマネージャーのサポート**: `npm`、`pnpm`、`yarn` に対応しています。

## **AIエージェント対応アーキテクチャ (`.agents`)**

生成されるすべてのプロジェクトには、AI コーディングエージェントが GAS 特有の制約を理解し、安全かつ高精度にコード生成を行うためのコンテキスト資産が同梱されています。

* **総合ガイド (`.agents/AGENTS.md`)**: プロジェクト概要、ライフサイクルコマンド、および厳守すべき制約事項。
* **ルール集 (`.agents/rules/`)**: GAS サンドボックス制約（Node.js / ブラウザ DOM API の禁止、Spreadsheet の一括読み書き）、Biome コーディング規約、アーキテクチャ設計（`server`, `spa`, `ciderjs`）、およびアンチパターン集。
* **スキル集 (`.agents/skills/`)**: サーバー関数・エンドポイントの追加、UI コンポーネントの追加、Vitest による GAS API モック作成、ビルド & `clasp push`、デプロイなどの定型作業を再現する手順書。
* **各 AI ツール向けエントリーファイル**: 主要な AI エージェントが自動で読み込むルート指示ファイルも初期配置されます：
  * `CLAUDE.md` (Claude Code)
  * `GEMINI.md` (Gemini / Google Antigravity)
  * `CODEX.md` (OpenAI Codex / ChatGPT)
  * `.cursor/rules/gasbombe.mdc` (Cursor)
  * `.github/copilot-instructions.md` (GitHub Copilot)

## **使用方法**

### **インストール**

`npx`、`pnpm dlx`、`yarn dlx` を使用すると、グローバルにインストールせずに直接 CLI を実行できます。

```bash
# npm
npx @ciderjs/gasbombe

# pnpm
pnpm dlx @ciderjs/gasbombe

# yarn
yarn dlx @ciderjs/gasbombe
```

または、グローバルにインストールすることもできます。

```bash
npm install -g @ciderjs/gasbombe
```

### **使い方**

コマンドを実行し、対話型のプロンプトに従ってください。

```bash
gasbombe
```

以下の項目について順に質問されます。

1. **プロジェクト名**（カレントディレクトリに展開する場合は `.`）
2. **プロジェクトテンプレート**（`server-ts`, `server-js`, `server-ciderjs`, `react`, `react-ciderjs`, `vue`, `vue-ciderjs`, `html-js`）
3. **Apps Script プロジェクトのセットアップ方法（`.clasp.json`）**（`create`, `list`, `input`, `skip`）
4. **パッケージマネージャー**（`npm`, `pnpm`, `yarn`、またはインストールをスキップ）
5. **Git リポジトリの初期化**（`true` / `false`）

指定された設定に基づき、ディレクトリの作成、テンプレートファイルの展開、`.clasp.json` の構成、依存関係のインストール、および Git リポジトリの初期コミットが自動で行われます。

### **CLIオプション**

コマンドラインオプションを指定することで、対話型のプロンプトを省略できます。スクリプトや CI/CD での自動化に便利です。

```bash
# 例: pnpm を使用して React + CiderJS プロジェクトを作成し、同時に新しい Apps Script プロジェクトも作成する
gasbombe --name my-react-app --template react-ciderjs --clasp create --pkg pnpm --git
```

| オプション | エイリアス | 引数 | 説明 | 選択肢 |
| :--- | :--- | :--- | :--- | :--- |
| `--name` | `-n` | `[projectName]` | 生成するプロジェクトの名前（カレントディレクトリの場合は `.`）。 | - |
| `--template` | `-t` | `[templateType]` | 使用するプロジェクトテンプレート。 | `server-ts`, `server-js`, `server-ciderjs`, `react`, `react-ciderjs`, `vue`, `vue-ciderjs`, `html-js` |
| `--clasp` | `-c` | `[claspOption]` | `.clasp.json` のセットアップ方法。<br/>`create` と `list` は事前に clasp へのログイン（`npx @google/clasp login`）が必要です。 | `create`, `list`, `input`, `skip` |
| `--pkg` | `-p` | `[packageManager]` | 使用するパッケージマネージャー。 | `npm`, `pnpm`, `yarn` |
| `--skipInstall` | | | 依存関係のインストールをスキップします。 | - |
| `--git` | `-g` | `[boolean]` | Git リポジトリを初期化します（デフォルト: `true`）。 | `true`, `false` |
| `--skipGit` | | | Git リポジトリの初期化をスキップします。 | - |

これらのオプションのいずれかが省略された場合、対話形式で値を入力するよう求められます。

### **Programmatic API**

Node.js スクリプトから `generateProject` 関数を直接インポートしてプロジェクト生成を自動化することも可能です。

```typescript
import { generateProject, type ProjectOptions } from "@ciderjs/gasbombe";

const options: ProjectOptions = {
  projectName: "my-gas-app",
  packageManager: "pnpm",
  templateType: "react-ciderjs",
  clasp: "skip",
  install: true,
  git: true,
};

await generateProject(options);
```

実践的なレシピや詳細な型定義については、[公式リファレンス](https://ciderlabs.link/docs/gasbombe)を参照してください。

## **開発**

### **前提条件**

* [Node.js](https://nodejs.org/) (`>= 22`)
* [pnpm](https://pnpm.io/installation)

### **セットアップ**

リポジトリをクローンし、依存関係をインストールします。

```bash
git clone https://github.com/luthpg/gasbombe.git
cd gasbombe
pnpm install
```

### **ビルド & テスト**

プロジェクトをローカルでビルド（型チェック、CLI バンドル、`dist/` へのテンプレート生成）するには：

```bash
pnpm run build
```

単体テストおよび全テンプレートの検証スイートを実行するには：

```bash
pnpm run test
```

全テンプレートプロジェクトの依存関係を一括で最新化する（Vue テンプレートの TypeScript 5.x 互換性を維持したまま更新する）には：

```bash
pnpm run up:templates
```

## **ライセンス**

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルをご覧ください。
