use crate::models::McpServer;
use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::fs;
use std::path::PathBuf;

/// Local server registry — a "favorites" list independent of tool configs.
/// Stored at ~/.config/atm/servers.json
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ServerRegistry {
    pub servers: BTreeMap<String, McpServer>,
}

fn registry_path() -> Result<PathBuf> {
    let home = dirs::home_dir().ok_or_else(|| anyhow::anyhow!("Cannot determine home directory"))?;
    Ok(home.join(".config").join("atm").join("servers.json"))
}

pub fn load() -> Result<ServerRegistry> {
    let path = registry_path()?;
    if !path.exists() {
        return Ok(ServerRegistry::default());
    }
    let content = fs::read_to_string(&path)
        .with_context(|| format!("Failed to read registry: {}", path.display()))?;
    serde_json::from_str(&content)
        .with_context(|| format!("Failed to parse registry: {}", path.display()))
}

fn save(registry: &ServerRegistry) -> Result<()> {
    let path = registry_path()?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    let content = serde_json::to_string_pretty(registry)?;
    fs::write(&path, content).with_context(|| format!("Failed to write registry: {}", path.display()))
}

pub fn add(server: &McpServer) -> Result<()> {
    let mut reg = load()?;
    reg.servers.insert(server.name.clone(), server.clone());
    save(&reg)
}

pub fn remove(name: &str) -> Result<()> {
    let mut reg = load()?;
    reg.servers.remove(name);
    save(&reg)
}

pub fn list() -> Result<Vec<McpServer>> {
    let reg = load()?;
    Ok(reg.servers.into_values().collect())
}
