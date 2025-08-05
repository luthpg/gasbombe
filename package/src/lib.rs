// src/lib.rs

use anyhow::{Context, Result};
use serde::Deserialize;
use std::fmt;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use tera::{Context as TeraContext, Tera};
use wasm_bindgen::prelude::*;

// JSの `console.log` をRustから呼ぶための設定
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// パニック時に詳細なエラーをコンソールに出力するための設定
#[wasm_bindgen(start)]
pub fn set_panic_hook() {
    console_error_panic_hook::set_once();
}

// --- データ構造定義 ---

/// パッケージマネージャーの種類
#[derive(Debug, Clone, Copy, Deserialize)]
#[serde(rename_all = "lowercase")] // JSからの入力(npm, yarn, pnpm)に合わせる
pub enum PackageManager {
    Npm,
    Yarn,
    Pnpm,
}

impl fmt::Display for PackageManager {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            PackageManager::Npm => write!(f, "npm"),
            PackageManager::Yarn => write!(f, "yarn"),
            PackageManager::Pnpm => write!(f, "pnpm"),
        }
    }
}

/// テンプレートの種類
#[derive(Debug, Clone, Copy, Deserialize)]
#[serde(rename_all = "kebab-case")] // JSからの入力(vanilla-ts, react-tsx)に合わせる
pub enum TemplateType {
    VanillaTs,
    ReactTsx,
}

impl TemplateType {
    fn path_str(&self) -> &str {
        match self {
            TemplateType::VanillaTs => "vanilla-ts",
            TemplateType::ReactTsx => "react-tsx",
        }
    }
}

impl fmt::Display for TemplateType {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            TemplateType::VanillaTs => write!(f, "Vanilla (プレーンなTypeScript)"),
            TemplateType::ReactTsx => write!(f, "React (TSX)"),
        }
    }
}

/// プロジェクト生成の全オプション
/// JSから受け取ることを想定し、`Deserialize`をderive
#[derive(Debug, Deserialize)]
pub struct ProjectOptions {
    pub project_name: String,
    pub package_manager: PackageManager,
    pub template_type: TemplateType,
}

// --- Wasm エントリーポイント ---

/// Wasmから呼び出されるメイン関数。
/// JSオブジェクトを引数で受け取る。
#[wasm_bindgen]
pub async fn run_generator(options: JsValue) -> Result<(), JsValue> {
    // JsValue(JSのオブジェクト)をRustの構造体に変換
    let options: ProjectOptions = serde_wasm_bindgen::from_value(options)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    
    log(&format!("Generating project: {}", options.project_name));
    
    // コアロジックを実行
    generate_project(options)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
        
    log("✅ Project generation complete!");
    Ok(())
}

// --- コアロジック ---

/// プロジェクト生成のコアロジック (ネイティブCLIからも利用可能)
pub fn generate_project(options: ProjectOptions) -> Result<()> {
    let project_path = Path::new(&options.project_name);
    let template_path_str = options.template_type.path_str();

    // 1. ディレクトリ作成
    if project_path.exists() {
        anyhow::bail!("Directory '{}' already exists.", options.project_name);
    }
    fs::create_dir_all(project_path.join("src"))
        .context("Failed to create project directories")?;

    // 2. テンプレートエンジン初期化
    // `templates`ディレクトリ内の全ファイルを読み込む
    let tera = Tera::new("templates/**/*")
        .context("Failed to initialize Tera template engine")?;

    // テンプレートに渡す変数を設定
    let mut context = TeraContext::new();
    context.insert("project_name", &options.project_name);

    // 3. ファイルリストを定義して生成
    // (テンプレート種別ごとにファイルリストを分ける)
    let common_files = vec!["tsconfig.json"];
    let template_files = match options.template_type {
        TemplateType::VanillaTs => vec![
            "index.html",
            "package.json",
            "src/main.ts"
        ],
        TemplateType::ReactTsx => vec![
            "index.html",
            "package.json",
            "src/App.tsx",
            "src/main.tsx"
        ],
    };
    
    // 共通ファイルを生成
    for file_name in common_files {
        let template_name = format!("common/{}", file_name);
        render_and_write_file(&tera, &context, &template_name, &project_path.join(file_name))?;
    }
    
    // テンプレート固有のファイルを生成
    for file_name in template_files {
        let template_name = format!("{}/{}", template_path_str, file_name);
        render_and_write_file(&tera, &context, &template_name, &project_path.join(file_name))?;
    }

    println!("✅ Project structure created.");

    // 4. 依存関係のインストール
    run_install(project_path, options.package_manager)?;

    Ok(())
}

// --- ヘルパー関数 ---

/// テンプレートをレンダリングしてファイルに書き込むヘルパー関数
fn render_and_write_file(
    tera: &Tera,
    context: &TeraContext,
    template_name: &str,
    output_path: &PathBuf,
) -> Result<()> {
    let rendered_content = tera.render(&format!("{}.tera", template_name), context)
        .with_context(|| format!("Failed to render template: {}", template_name))?;
    
    fs::write(output_path, rendered_content)
        .with_context(|| format!("Failed to write file: {:?}", output_path))?;
        
    Ok(())
}


/// 選択されたパッケージマネージャーで`install`を実行する関数
fn run_install(project_path: &Path, pm: PackageManager) -> Result<()> {
    let pm_command = pm.to_string();
    println!("\nInstalling dependencies with {}...", pm_command);

    let output = Command::new(&pm_command)
        .arg("install")
        .current_dir(project_path)
        .output()
        .with_context(|| format!("Failed to execute `{} install`", pm_command))?;

    if !output.status.success() {
        eprintln!("{}", String::from_utf8_lossy(&output.stderr));
        anyhow::bail!("`{} install` failed.", pm_command);
    }

    println!("{}", String::from_utf8_lossy(&output.stdout));
    println!("✅ Dependencies installed.");

    Ok(())
}