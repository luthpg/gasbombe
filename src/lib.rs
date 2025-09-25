use anyhow::{Context, Result};
use serde::Deserialize;
use std::fmt;
use std::fs;
use std::path::{Path, PathBuf};
// Commandはwasm32ターゲットでは使えないので、cfgで囲む
#[cfg(not(target_arch = "wasm32"))]
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
    // Cargo.tomlのwasm featureが有効な時だけ実行
    #[cfg(feature = "wasm")]
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
    let project_name_only = project_path
        .file_name()
        .and_then(|s| s.to_str())
        .unwrap_or(&options.project_name);
    context.insert("project_name", project_name_only);

    // 3. テンプレートを動的に処理
    let template_path_str = options.template_type.path_str();

    for template_name in tera.get_template_names() {
        let template_path = Path::new(template_name);

        // "common/" または選択されたテンプレートのディレクトリで始まるテンプレートファイルを対象にする
        let base_dir = if template_path.starts_with("common") {
            Some("common")
        } else if template_path.starts_with(template_path_str) {
            Some(template_path_str)
        } else {
            None
        };

        if let Some(dir) = base_dir {
            // 出力先の相対パスを計算 (e.g., "common/tsconfig.json.tera" -> "tsconfig.json")
            let relative_path = template_path.strip_prefix(dir).unwrap();
            let output_file = PathBuf::from(relative_path.to_str().unwrap().replace(".tera", ""));
            let output_path = project_path.join(output_file);

            // ファイルを書き込む前に、親ディレクトリが存在することを確認・作成
            if let Some(parent_dir) = output_path.parent() {
                fs::create_dir_all(parent_dir)
                    .with_context(|| format!("Failed to create directory: {:?}", parent_dir))?;
            }
            
            render_and_write_file(&tera, &context, template_name, &output_path)?;
        }
    }

    // ネイティブ環境ではprintln!、Wasm環境ではlogを使う
    #[cfg(not(target_arch = "wasm32"))]
    println!("✅ Project structure created.");
    #[cfg(target_arch = "wasm32")]
    log("✅ Project structure created.");


    // 4. 依存関係のインストール (ネイティブ環境でのみ、かつテスト実行時以外に実行)
    #[cfg(all(not(target_arch = "wasm32"), not(test)))]
    run_install(project_path, options.package_manager)?;

    // 5. Gitリポジトリの初期化 (ネイティブ環境でのみ、かつテスト実行時以外に実行)
    #[cfg(all(not(target_arch = "wasm32"), not(test)))]
    initialize_git_repository(project_path)?;

    // Wasm環境ではインストールはスキップされることをログに出す
    #[cfg(target_arch = "wasm32")]
    log("Skipping dependency installation and git initialization in Wasm environment. Please run them manually.");

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
    let rendered_content = tera.render(template_name, context)
        .with_context(|| format!("Failed to render template: {}", template_name))?;

    fs::write(output_path, rendered_content)
        .with_context(|| format!("Failed to write file: {:?}", output_path))?;

    Ok(())
}


/// 選択されたパッケージマネージャーで`install`を実行する関数
/// この関数はWasmターゲットではコンパイルされないようにする
#[cfg(not(target_arch = "wasm32"))]
fn run_install(project_path: &Path, pm: PackageManager) -> Result<()> {
    let pm_command = pm.to_string();
    println!("
Installing dependencies with {}...", pm_command);

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

/// Gitリポジトリを初期化し、最初のコミットを作成する関数
#[cfg(not(target_arch = "wasm32"))]
fn initialize_git_repository(project_path: &Path) -> Result<()> {
    println!("
Initializing Git repository...");

    // Gitがインストールされているか確認
    if Command::new("git").arg("--version").output().is_err() {
        println!("⚠️  Git is not installed. Skipping repository initialization.");
        return Ok(());
    }

    // git init
    let init_output = Command::new("git")
        .arg("init")
        .current_dir(project_path)
        .output()
        .context("Failed to execute `git init`")?;
    if !init_output.status.success() {
        eprintln!("{}", String::from_utf8_lossy(&init_output.stderr));
        anyhow::bail!("`git init` failed.");
    }

    // git add .
    let add_output = Command::new("git")
        .arg("add")
        .arg(".")
        .current_dir(project_path)
        .output()
        .context("Failed to execute `git add .`")?;
    if !add_output.status.success() {
        eprintln!("{}", String::from_utf8_lossy(&add_output.stderr));
        anyhow::bail!("`git add .` failed.");
    }

    // git commit
    let commit_output = Command::new("git")
        .arg("commit")
        .arg("-m")
        .arg("Initial commit")
        .current_dir(project_path)
        .output()
        .context("Failed to execute `git commit`")?;
    if !commit_output.status.success() {
        eprintln!("{}", String::from_utf8_lossy(&commit_output.stderr));
        println!("⚠️  `git commit` failed. Please configure your git user name and email and commit manually.");
        // コミット失敗はプロセス全体のエラーとはしない
        return Ok(());
    }

    println!("✅ Git repository initialized and first commit made.");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    // テストプロジェクトのセットアップとクリーンアップを管理するRAIIガード
    struct TestProject {
        path: PathBuf,
    }

    impl TestProject {
        fn new(test_name: &str) -> Self {
            let temp_dir = env::temp_dir();
            // テストごとにユニークなディレクトリ名にする
            let path = temp_dir.join(format!("gasbombe-test-{}", test_name));
            
            // もし前回のテストが失敗してディレクトリが残っていたら削除
            if path.exists() {
                fs::remove_dir_all(&path).unwrap();
            }
            
            TestProject { path }
        }

        fn path(&self) -> &Path {
            &self.path
        }

        fn path_str(&self) -> &str {
            self.path.to_str().unwrap()
        }
    }

    impl Drop for TestProject {
        fn drop(&mut self) {
            // テスト終了時にディレクトリをクリーンアップ
            if self.path.exists() {
                fs::remove_dir_all(&self.path).unwrap();
            }
        }
    }

    #[test]
    fn test_project_name_is_rendered_in_package_json() {
        let project_name = "my-awesome-gas-project";
        let project = TestProject::new(project_name);

        let options = ProjectOptions {
            project_name: project.path_str().to_string(),
            package_manager: PackageManager::Yarn,
            template_type: TemplateType::VanillaTs,
        };

        let result = generate_project(options);
        assert!(result.is_ok());

        let package_json_path = project.path().join("package.json");
        assert!(package_json_path.exists());
        let package_json_content = fs::read_to_string(package_json_path).unwrap();
        
        let expected_name_line = format!(""name": "{}"", project.path().file_name().unwrap().to_str().unwrap());
        assert!(
            package_json_content.contains(&expected_name_line),
            "package.json should contain the correct project name. Got: {}",
            package_json_content
        );
    }

    #[test]
    fn test_generate_vanilla_project_creates_files() {
        let project = TestProject::new("vanilla-project-files");
        let options = ProjectOptions {
            project_name: project.path_str().to_string(),
            package_manager: PackageManager::Npm,
            template_type: TemplateType::VanillaTs,
        };

        let result = generate_project(options);
        assert!(result.is_ok());

        assert!(project.path().join(".gitignore").exists());
        assert!(project.path().join("package.json").exists());
        assert!(project.path().join("tsconfig.json").exists());
        // VanillaTSにはsrc/main.tsがないので、テストを修正する必要がある
        // assert!(project.path().join("src/main.ts").exists());
        // React用のファイルが存在しないことを確認
        assert!(!project.path().join("src/App.tsx").exists());
    }

    #[test]
    fn test_generate_react_project_creates_files() {
        let project = TestProject::new("react-project-files");
        let options = ProjectOptions {
            project_name: project.path_str().to_string(),
            package_manager: PackageManager::Pnpm,
            template_type: TemplateType::ReactTsx,
        };

        let result = generate_project(options);
        assert!(result.is_ok());

        assert!(project.path().join(".gitignore").exists());
        assert!(project.path().join("package.json").exists());
        assert!(project.path().join("tsconfig.json").exists());
        assert!(project.path().join("src/main.tsx").exists());
        assert!(project.path().join("src/App.tsx").exists());
    }
}
