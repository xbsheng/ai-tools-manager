use crate::config;
use crate::models::{AiTool, McpServer, ToolConfig};
use anyhow::Result;
use std::path::PathBuf;

fn home_dir() -> Result<PathBuf> {
    dirs::home_dir().ok_or_else(|| anyhow::anyhow!("Cannot determine home directory"))
}

/// Returns all config paths for a tool (some tools have multiple config locations)
pub fn config_paths(tool: AiTool) -> Result<Vec<PathBuf>> {
    let home = home_dir()?;
    let paths = match tool {
        AiTool::ClaudeCode => vec![
            home.join(".claude.json"),              // global MCP config (primary)
            home.join(".claude").join("settings.json"), // user settings
        ],
        AiTool::Cursor => vec![home.join(".cursor").join("mcp.json")],
        AiTool::Windsurf => vec![home
            .join(".codeium")
            .join("windsurf")
            .join("mcp_config.json")],
        AiTool::VsCodeCopilot => vec![home.join(".vscode").join("mcp.json")],
    };
    Ok(paths)
}

/// Returns the primary config path (used for writes)
pub fn config_path(tool: AiTool) -> Result<PathBuf> {
    let paths = config_paths(tool)?;
    Ok(paths.into_iter().next().unwrap())
}

pub fn detect_tool(tool: AiTool) -> Result<ToolConfig> {
    let paths = config_paths(tool)?;
    let installed = paths.iter().any(|p| p.exists());

    // Merge servers from all config files, dedup by name
    let mut servers = Vec::new();
    let mut seen = std::collections::HashSet::new();
    for path in &paths {
        if path.exists() {
            if let Ok(file_servers) = config::read_servers(path, tool) {
                for s in file_servers {
                    if seen.insert(s.name.clone()) {
                        servers.push(s);
                    }
                }
            }
        }
    }

    let primary_path = paths.into_iter().next().unwrap();
    Ok(ToolConfig {
        tool,
        config_path: primary_path,
        servers,
        installed,
    })
}

pub fn detect_all() -> Vec<ToolConfig> {
    AiTool::all()
        .iter()
        .filter_map(|&tool| detect_tool(tool).ok())
        .collect()
}

pub fn get_servers(tool: AiTool) -> Result<Vec<McpServer>> {
    let paths = config_paths(tool)?;
    let mut servers = Vec::new();
    let mut seen = std::collections::HashSet::new();
    for path in &paths {
        if path.exists() {
            if let Ok(file_servers) = config::read_servers(path, tool) {
                for s in file_servers {
                    if seen.insert(s.name.clone()) {
                        servers.push(s);
                    }
                }
            }
        }
    }
    Ok(servers)
}

pub fn add_server(tool: AiTool, server: &McpServer) -> Result<()> {
    let path = config_path(tool)?;
    config::add_server(&path, tool, server)
}

pub fn remove_server(tool: AiTool, name: &str) -> Result<()> {
    // Try removing from all config files
    let paths = config_paths(tool)?;
    let mut removed = false;
    for path in &paths {
        if path.exists() {
            if config::remove_server(path, tool, name).is_ok() {
                removed = true;
            }
        }
    }
    if removed {
        Ok(())
    } else {
        anyhow::bail!("Server '{}' not found in any {} config", name, tool)
    }
}

pub fn has_backup(tool: AiTool) -> Result<bool> {
    let path = config_path(tool)?;
    Ok(config::has_backup(&path))
}

pub fn restore_backup(tool: AiTool) -> Result<()> {
    let path = config_path(tool)?;
    config::restore_backup(&path)
}
