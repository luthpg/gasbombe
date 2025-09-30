# **Gasbombe**

[![README-en](https://img.shields.io/badge/English-blue?logo=ReadMe)](./README.md)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@ciderjs/gasbombe.svg)](https://www.npmjs.com/package/@ciderjs/gasbombe)
[![GitHub issues](https://img.shields.io/github/issues/luthpg/gasbombe.svg)](https://github.com/luthpg/gasbombe/issues)

🛢 「Gasbombe」は、GoogleAppsScriptのためのTypeScriptプロジェクトジェネレーターです。

このプロジェクトは、Vanilla TSおよびReactのテンプレートを使用して、Google Apps Script用の新しいTypeScriptプロジェクトを構築するためのコマンドラインインターフェース（CLI）を提供します。

## **機能**

* **CLIツール**: 対話型のコマンドラインプロンプトにより、プロジェクトのセットアップをガイドします。
* **テンプレート**:
  * Vanilla TypeScript
  * React with TSX
* **パッケージマネージャーのサポート**: npm、Yarn、pnpmに対応しています。

## **使用方法**

### **インストール**

`npx`を使用すると、グローバルにインストールせずにCLIを実行できます。

```bash
npx @ciderjs/gasbombe
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

以下の項目について質問されます。

1. プロジェクト名
2. プロジェクトテンプレート（Vanilla TS, React）
3. Apps Scriptプロジェクトのセットアップ方法（`.clasp.json`）
4. パッケージマネージャー（npm, yarn, pnpm）

このツールは、指定されたプロジェクト名で新しいディレクトリを作成し、テンプレートファイルを生成して、依存関係をインストールします。

### **CLIオプション**

コマンドラインオプションを指定することで、対話型のプロンプトを省略できます。これは、スクリプトや自動化に便利です。

```bash
# 例: pnpmを使用して新しいReactプロジェクトを作成し、同時に新しいApps Scriptプロジェクトも作成する
gasbombe --name my-react-app --template react-tsx --clasp create --pkg pnpm
```

| オプション | エイリアス | 引数 | 説明 | 選択肢 |
| :--- | :--- | :--- | :--- | :--- |
| `--name` | `-n` | `[projectName]` | 生成するプロジェクトの名前。 | - |
| `--template` | `-t` | `[templateType]` | 使用するプロジェクトテンプレート。 | `vanilla-ts`, `react-tsx` |
| `--clasp` | `-c` | `[claspOption]` | `.clasp.json`のセットアップ方法。<br/>`create`と`list`は事前にclaspへのログインが必要です。 | `create`, `list`, `input`, `skip` |
| `--pkg` | `-p` | `[packageManager]` | 使用するパッケージマネージャー。 | `npm`, `pnpm`, `yarn` |
| `--skipInstall` | | | 依存関係のインストールをスキップします。 | - |

これらのオプションのいずれかが省略された場合、対話形式で値を入力するよう求められます。

## **開発**

### **前提条件**

* [Node.js](https://nodejs.org/)
* [pnpm](https://pnpm.io/installation)

### **セットアップ**

リポジトリをクローンし、依存関係をインストールします。

```bash
git clone https://github.com/luthpg/gasbombe.git
cd gasbombe
pnpm install
```

### **ビルド**

プロジェクトをローカルでビルドするには：

```bash
pnpm run build
```

これにより、必要なファイルが`dist`ディレクトリに生成されます。

## **ライセンス**

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルをご覧ください。
