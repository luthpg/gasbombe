// src/main.rs

use gasbombe::{generate_project, PackageManager, ProjectOptions, TemplateType}; // lib.rsからインポート
use inquire::{Select, Text};
use anyhow::Result;

fn main() -> Result<()> {
    println!("🛢 'Gasbombe' the TypeScript Project Generator for GoogleAppsScript");

    // 対話的にオプションを収集
    let project_name = Text::new("Project name:").prompt()?;
    
    let pm_options = vec![PackageManager::Npm, PackageManager::Yarn, PackageManager::Pnpm];
    let package_manager = Select::new("Select a package manager:", pm_options).prompt()?;

    // TemplateTypeにもDisplayを実装すると、Selectで綺麗に表示できる
    let template_options = vec![TemplateType::VanillaTs, TemplateType::ReactTsx];
    let template_type = Select::new("Select a template:", template_options).prompt()?;
    
    // 収集したオプションを構造体にまとめる
    let options = ProjectOptions {
        project_name,
        package_manager,
        template_type,
    };
    
    // コアロジックを呼び出し
    generate_project(options)?;
    
    println!("\n🎉 All done! Your project is ready.");
    Ok(())
}