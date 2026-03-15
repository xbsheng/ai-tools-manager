use atm_core::models::{AiTool, McpServer, SyncResult, ToolConfig, ToolSkillConfig};
use atm_core::{registry, skills, sync, tools};
use serde::Serialize;
use std::collections::HashMap;

#[tauri::command]
fn detect_tools() -> Vec<ToolConfig> {
    tools::detect_all()
}

#[tauri::command]
fn get_servers(tool: AiTool) -> Result<Vec<McpServer>, String> {
    tools::get_servers(tool).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_all_servers() -> HashMap<AiTool, Vec<McpServer>> {
    atm_core::config::read_all_servers()
}

#[tauri::command]
fn add_server(tool: AiTool, server: McpServer) -> Result<(), String> {
    tools::add_server(tool, &server).map_err(|e| e.to_string())
}

#[tauri::command]
fn remove_server(tool: AiTool, name: String) -> Result<(), String> {
    tools::remove_server(tool, &name).map_err(|e| e.to_string())
}

#[tauri::command]
fn sync_servers(
    from: AiTool,
    to: Vec<AiTool>,
    names: Option<Vec<String>>,
) -> Result<SyncResult, String> {
    if let Some(names) = names {
        let mut result = SyncResult {
            added: Vec::new(),
            skipped: Vec::new(),
            conflicts: Vec::new(),
        };
        for name in &names {
            let sub = sync::sync_server(from, &to, name).map_err(|e| e.to_string())?;
            result.added.extend(sub.added);
            result.skipped.extend(sub.skipped);
            result.conflicts.extend(sub.conflicts);
        }
        Ok(result)
    } else {
        sync::sync_all(from, &to).map_err(|e| e.to_string())
    }
}

// --- Registry commands (local favorites) ---

#[tauri::command]
fn registry_list() -> Result<Vec<McpServer>, String> {
    registry::list().map_err(|e| e.to_string())
}

#[tauri::command]
fn registry_add(server: McpServer) -> Result<(), String> {
    registry::add(&server).map_err(|e| e.to_string())
}

#[tauri::command]
fn registry_remove(name: String) -> Result<(), String> {
    registry::remove(&name).map_err(|e| e.to_string())
}

// --- Backup / Restore ---

#[tauri::command]
fn has_backup(tool: AiTool) -> Result<bool, String> {
    tools::has_backup(tool).map_err(|e| e.to_string())
}

#[tauri::command]
fn restore_backup(tool: AiTool) -> Result<(), String> {
    tools::restore_backup(tool).map_err(|e| e.to_string())
}

// --- Reveal path in file manager ---

#[tauri::command]
fn reveal_path(path: String) -> Result<(), String> {
    let p = std::path::Path::new(&path);
    let dir = if p.is_dir() {
        p.to_path_buf()
    } else {
        p.parent()
            .ok_or_else(|| format!("Cannot resolve parent of: {}", path))?
            .to_path_buf()
    };
    if !dir.exists() {
        return Err(format!("Path not found: {}", dir.display()));
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&dir)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(&dir)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&dir)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

// --- Open file with default application ---

#[tauri::command]
fn open_file(path: String) -> Result<(), String> {
    let p = std::path::Path::new(&path);
    if !p.exists() {
        return Err(format!("File not found: {}", path));
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(["/C", "start", "", &path])
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

// --- System Info ---

#[derive(Serialize)]
struct SystemInfo {
    os: String,
    os_version: String,
    arch: String,
    tools: Vec<ToolInfo>,
}

#[derive(Serialize)]
struct ToolInfo {
    name: String,
    installed: bool,
    config_path: String,
    server_count: usize,
}

#[tauri::command]
fn get_system_info() -> SystemInfo {
    let os = std::env::consts::OS.to_string();
    let arch = std::env::consts::ARCH.to_string();

    let os_version = get_os_version();

    let detected = tools::detect_all();
    let tool_infos: Vec<ToolInfo> = detected
        .iter()
        .map(|t| ToolInfo {
            name: t.tool.to_string(),
            installed: t.installed,
            config_path: t.config_path.display().to_string(),
            server_count: t.servers.len(),
        })
        .collect();

    SystemInfo {
        os,
        os_version,
        arch,
        tools: tool_infos,
    }
}

fn get_os_version() -> String {
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("sw_vers")
            .arg("-productVersion")
            .output()
            .ok()
            .and_then(|o| String::from_utf8(o.stdout).ok())
            .map(|s| format!("macOS {}", s.trim()))
            .unwrap_or_else(|| "macOS (unknown version)".to_string())
    }
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(["/C", "ver"])
            .output()
            .ok()
            .and_then(|o| String::from_utf8(o.stdout).ok())
            .map(|s| s.trim().to_string())
            .unwrap_or_else(|| "Windows (unknown version)".to_string())
    }
    #[cfg(target_os = "linux")]
    {
        std::fs::read_to_string("/etc/os-release")
            .ok()
            .and_then(|content| {
                content
                    .lines()
                    .find(|l| l.starts_with("PRETTY_NAME="))
                    .map(|l| l.trim_start_matches("PRETTY_NAME=").trim_matches('"').to_string())
            })
            .unwrap_or_else(|| "Linux (unknown distro)".to_string())
    }
}

// --- Skill commands ---

#[tauri::command]
fn list_all_skills() -> Vec<ToolSkillConfig> {
    skills::list_all_skills()
}

#[tauri::command]
fn remove_skill(tool: AiTool, name: String) -> Result<(), String> {
    skills::remove_skill(tool, &name).map_err(|e| e.to_string())
}

#[tauri::command]
fn copy_skill(from: AiTool, to: AiTool, name: String) -> Result<(), String> {
    skills::copy_skill(from, to, &name).map_err(|e| e.to_string())
}

#[tauri::command]
fn reveal_skill_path(tool: AiTool, name: String) -> Result<(), String> {
    let dir = skills::skills_dir(tool).map_err(|e| e.to_string())?;
    let path = dir.join(&name);
    reveal_path(path.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            detect_tools,
            get_servers,
            get_all_servers,
            add_server,
            remove_server,
            sync_servers,
            registry_list,
            registry_add,
            registry_remove,
            list_all_skills,
            remove_skill,
            copy_skill,
            reveal_skill_path,
            has_backup,
            restore_backup,
            reveal_path,
            open_file,
            get_system_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
