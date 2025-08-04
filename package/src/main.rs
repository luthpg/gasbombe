use anyhow::{Context, Result};
use clap::Parser;
use inquire::{Confirm, Select, Text};
use std::fmt;
use std::fs;
use std::path::Path;
use std::process::Command;
use tera::{Context as TeraContext, Tera};

#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
struct Args {}

// ★★★ 追加: パッケージマネージャーを表現するenum ★★★
#[derive(Debug, Clone, Copy)]
enum PackageManager {
    Npm,
    Yarn,
    Pnpm,
}

// inquireのSelectで表示するためのDisplayトレイトを実装
impl fmt::Display for PackageManager {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            PackageManager::Npm => write!(f, "npm"),
            PackageManager::Yarn => write!(f, "yarn"),
            PackageManager::Pnpm => write!(f, "pnpm"),
        }
    }
}

// ★★★ 修正: 選択されたパッケージマネージャーに応じてコマンドを実行する関数 ★★★
fn run_install(project_path: &Path, pm: PackageManager) -> Result<()> {
    // enumからコマンド名（文字列）を取得
    let pm_command = pm.to_string();
    println!("\n依存関係をインストールしています ({} install)...", pm_command);

    // 実行するコマンドが存在するかチェック（より親切なエラーメッセージのため）
    let status = Command::new("which").arg(&pm_command).status()?;
    if !status.success() {
        anyhow::bail!(
            "エラー: パッケージマネージャー '{}' が見つかりません。インストールされているか確認してください。",
            pm_command
        );
    }

    let output = Command::new(&pm_command)
        .arg("install")
        .current_dir(project_path) // 実行ディレクトリを指定
        .output()
        .with_context(|| format!("`{} install` の実行に失敗しました", pm_command))?;

    if !output.status.success() {
        // エラー出力を表示
        eprintln!("{}", String::from_utf8_lossy(&output.stderr));
        anyhow::bail!("{} installが失敗しました。", pm_command);
    }

    println!("{}", String::from_utf8_lossy(&output.stdout));
    println!("✅ 依存関係のインストールが完了しました。");

    Ok(())
}

fn main() -> Result<()> {
    Args::parse();

    println!("🚀 TypeScriptプロジェクトジェネレーターへようこそ！");

    // プロジェクト名を質問
    let project_name = Text::new("プロジェクト名を入力してください:")
        .with_default("my-ts-app")
        .prompt()?;

    // ESLintを導入するか確認
    let use_eslint = Confirm::new("ESLintを導入しますか？")
        .with_default(true)
        .prompt()?;

    // ★★★ 追加: パッケージマネージャーを選択させる ★★★
    let pm_options = vec![PackageManager::Npm, PackageManager::Yarn, PackageManager::Pnpm];
    let chosen_pm = Select::new("使用するパッケージマネージャーを選択してください:", pm_options)
        .prompt()?;

    println!("\n--------------------");
    println!("プロジェクト名: {}", project_name);
    println!("ESLintの導入: {}", if use_eslint { "はい" } else { "いいえ" });
    println!("パッケージマネージャー: {}", chosen_pm);
    println!("--------------------\n");

    println!("プロジェクトを生成しています...");

    let project_path = Path::new(&project_name);
    if project_path.exists() {
        anyhow::bail!("エラー: ディレクトリ '{}' は既に存在します。", project_name);
    }
    fs::create_dir_all(project_path).context("プロジェクトディレクトリの作成に失敗しました")?;

    // Teraテンプレートを初期化
    let mut tera = Tera::new("templates/**/*")?;

    let mut context = TeraContext::new();
    context.insert("project_name", &project_name);

    // package.jsonを生成
    let package_json_content = tera.render("package.json.tera", &context)?;
    let package_json_path = project_path.join("package.json");
    fs::write(package_json_path, package_json_content)?;
    
    println!("✅ プロジェクト '{}' の生成が完了しました。", project_name);

    // ★★★ 修正: 選択されたパッケージマネージャーを使ってインストールを実行 ★★★
    run_install(project_path, chosen_pm)?;

    println!("\n🎉 セットアップが完了しました！以下のコマンドで始めましょう:");
    println!("   cd {}", project_name);
    
    Ok(())
}