use atm_core::models::{AiTool, McpServer, SyncResult, ToolConfig};
use atm_core::{sync, tools};
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
