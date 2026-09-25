# gasbombe 利用ガイド

## 1. 概要 (Introduction)

`@ciderjs/gasbombe` は、Google Apps Script (GAS) プロジェクトをコマンド一発で構築できるTypeScript製CLIジェネレーターです。
通常、GASでReactやVueを用いたモダンなフロントエンド開発環境や、TypeScript、claspを組み合わせたローカル開発環境を構築するには、複雑な設定ファイルやビルド構成を自作するなど多大な労力が必要です。
このパッケージは、それらのベストプラクティスが詰まったテンプレートからプロジェクトを自動生成し、「claspの設定」「パッケージのインストール」「Gitの初期化」までをシームレスに行うことで、開発者がすぐにビジネスロジックの実装に集中できる環境を提供します。

## 2. 基本的な使い方 (Basic Usage)

最もシンプルで標準的な使い方は、CLIツールとして `npx` や `pnpm dlx` 経由で対話的にプロジェクトを生成する方法です。

```bash
# npmを使用する場合
npx @ciderjs/gasbombe@latest

# pnpmを使用する場合
pnpm dlx @ciderjs/gasbombe@latest
```

コマンドを実行すると、対話式のプロンプトが表示され、プロジェクト名、パッケージマネージャー（npm / pnpm / yarn）、テンプレートの種類（React, Vue, TypeScriptのみ等）、および clasp の設定方法（新規作成・既存プロジェクトの選択・手動入力・スキップ）を順に尋ねられます。

CI環境や自動化用に、引数を使用してプロンプトをスキップし一括生成することも可能です。

```bash
npx @ciderjs/gasbombe -n my-gas-project -p pnpm -t react-ciderjs -c skip --skipInstall
```

## 3. 実践的な活用方法とベストプラクティス (Advanced Recipes)

本パッケージは CLI としての利用だけでなく、Node.js の API（`generateProject` 関数）としてもエクスポートされています。テストコード（`tests/index.spec.ts`）や内部ロジックからも分かる通り、独自のスクリプトや CI/CD パイプラインに組み込んでプロジェクト生成を完全に自動化することが可能です。

### レシピ1: CI/CD や自動化スクリプトでのプロジェクト生成

自社のワークフロー自動化ツール内で `generateProject` を呼び出し、GASプロジェクトの足場を自動生成するユースケースです。

```typescript
import { generateProject } from '@ciderjs/gasbombe';
import type { ProjectOptions } from '@ciderjs/gasbombe/types';

const options: ProjectOptions = {
  projectName: 'automated-gas-app',
  packageManager: 'pnpm',
  templateType: 'server-ts',
  clasp: 'create', // 新規のclaspプロジェクトを自動作成
  install: true,   // 依存関係も自動でインストール
};

// 対話プロンプトなしで完全に自動生成
await generateProject(options);
```

**なぜこの方法が効率的か:**
企業やチーム内で大量のGASプロジェクトを管理する場合、このAPIを用いて自社用のScaffoldingツールを構築することで、手動セットアップによる設定ミスを防ぐことができます。アーキテクチャの標準化と `scriptId` の自動払い出し（`clasp: 'create'`）を一貫して行う際に極めて強力です。

### レシピ2: モノレポ環境（カレントディレクトリ）への展開

既存のモノレポ（NxやTurborepoなど）の特定のパッケージ内に、GASプロジェクトを展開する場合のレシピです。

```typescript
import { generateProject } from '@ciderjs/gasbombe';

await generateProject({
  projectName: '.', // カレントディレクトリに展開
  packageManager: 'yarn',
  templateType: 'vue',
  clasp: 'input',
  claspProjectId: 'your-existing-script-id', // 既存のScript IDを直接指定
  install: false, // 依存関係のインストールはスキップ（モノレポのルートで管理するため）
});
```

**なぜこの方法が効率的か:**
`projectName: '.'` と `install: false` を組み合わせることで、余計なサブディレクトリの作成や重複した `node_modules` のインストールを回避できます。既存の開発環境を汚さずにシームレスにGASテンプレートをマージでき、さらにカレントディレクトリに既存の `.clasp.json` があれば自動的に `scriptId` を更新します。

## 4. 型定義とAPIリファレンスのハイライト (API Highlights)

プログラムから直接 API を呼び出す場合に頻繁に参照する `ProjectOptions` インターフェースの型定義は以下の通りです（`types/index.ts` より）。

```typescript
export interface ProjectOptions {
  projectName: string;
  packageManager: 'npm' | 'pnpm' | 'yarn';
  templateType: 'server-ts' | 'server-js' | 'server-ciderjs' | 'react' | 'react-ciderjs' | 'vue' | 'vue-ciderjs' | 'html-js';
  clasp: 'create' | 'list' | 'input' | 'skip';
  claspProjectId?: string | undefined;
  install: boolean;
}
```

- **`templateType`**: サーバーサイドのみの `server-ts` や、フロントエンドUIを含む `react`, `vue` 、軽量な `html-js` などの豊富なテンプレートを選択できます。
- **`clasp`**: `'create'` を指定すると、内部で自動的に `clasp create` プロセスが起動し、GASプロジェクトの新規作成と `.clasp.json` の設定が完了します。

## 5. よくある落とし穴と注意点 (Pitfalls & Troubleshooting)

1. **事前に `clasp login` が必須**
   CLI や API の `clasp` オプションで `'create'` や `'list'` を指定する場合、実行環境において事前に `npx @google/clasp login` などで Google アカウントの認証を済ませておく必要があります。ログイン状態がないと、claspコマンドが失敗し、認証エラーにより作成プロセスが中断します。
2. **既存ディレクトリの衝突**
   `projectName` に指定したディレクトリが既に存在する場合（`'.'` を除く）、上書きによるコード喪失を防ぐためにプロセスがエラー (`process.exit(1)`) で直ちに終了します。スクリプトから自動化して呼び出す際は、出力先のディレクトリが空であるか、未作成であることを事前に担保してください。
3. **カレントディレクトリ (`.`) 指定時の対話的ブロック**
   `projectName: '.'` を指定した際、対象ディレクトリ内に隠しファイル（`.`で始まるファイル）以外の既存ファイルが存在すると、内部の `@inquirer/prompts` により継続確認の対話的なプロンプトが表示されます。API経由で非対話的に CI などを実行している場合、このプロンプトによってプロセスがブロックされてしまう可能性があるため、対象ディレクトリは極力空の状態にしておくことを推奨します。
