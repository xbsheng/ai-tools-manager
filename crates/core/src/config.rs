use crate::models::{AiTool, McpServer};
use anyhow::{Context, Result};
use serde_json::Value;
use std::collections::HashMap;
use std::fs;
use std::path::Path;

fn mcp_servers_key(tool: AiTool) -> &'static str {
    match tool {
        AiTool::ClaudeCode => "mcpServers",
        AiTool::Cursor => "mcpServers",
        AiTool::Windsurf => "mcpServers",
        AiTool::VsCodeCopilot => "mcpServers",
    }
}

fn read_json(path: &Path) -> Result<Value> {
    let content = fs::read_to_string(path)
        .with_context(|| format!("Failed to read config: {}", path.display()))?;
    serde_json::from_str(&content)
        .with_context(|| format!("Failed to parse JSON: {}", path.display()))
}

fn write_json(path: &Path, value: &Value) -> Result<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    let content = serde_json::to_string_pretty(value)?;
    fs::write(path, content).with_context(|| format!("Failed to write: {}", path.display()))
}

fn parse_server(name: &str, value: &Value) -> McpServer {
    let url = value.get("url").and_then(|v| v.as_str()).map(String::from);
    let command = value
        .get("command")
        .and_then(|v| v.as_str())
        .map(String::from);
    let args = value
        .get("args")
        .and_then(|v| v.as_array())
        .map(|arr| {
            arr.iter()
                .filter_map(|v| v.as_str().map(String::from))
                .collect()
        })
        .unwrap_or_default();
    let env = value
        .get("env")
        .and_then(|v| v.as_object())
        .map(|obj| {
            obj.iter()
                .filter_map(|(k, v)| v.as_str().map(|s| (k.clone(), s.to_string())))
                .collect()
        })
        .unwrap_or_default();

    McpServer {
        name: name.to_string(),
        url,
        command,
        args,
        env,
    }
}

fn server_to_value(server: &McpServer) -> Value {
    let mut map = serde_json::Map::new();
    if let Some(ref url) = server.url {
        map.insert("url".to_string(), Value::String(url.clone()));
    }
    if let Some(ref command) = server.command {
        map.insert("command".to_string(), Value::String(command.clone()));
    }
    if !server.args.is_empty() {
        map.insert(
            "args".to_string(),
            Value::Array(server.args.iter().map(|a| Value::String(a.clone())).collect()),
        );
    }
    if !server.env.is_empty() {
        let env_map: serde_json::Map<String, Value> = server
            .env
            .iter()
            .map(|(k, v)| (k.clone(), Value::String(v.clone())))
            .collect();
        map.insert("env".to_string(), Value::Object(env_map));
    }
    Value::Object(map)
}

pub fn read_servers(path: &Path, tool: AiTool) -> Result<Vec<McpServer>> {
    let root = read_json(path)?;
    let key = mcp_servers_key(tool);
    let servers_obj = match root.get(key).and_then(|v| v.as_object()) {
        Some(obj) => obj,
        None => return Ok(Vec::new()),
    };

    let servers = servers_obj
        .iter()
        .map(|(name, value)| parse_server(name, value))
        .collect();
    Ok(servers)
}

pub fn add_server(path: &Path, tool: AiTool, server: &McpServer) -> Result<()> {
    let mut root = if path.exists() {
        read_json(path)?
    } else {
        Value::Object(serde_json::Map::new())
    };

    let key = mcp_servers_key(tool);
    let servers = root
        .as_object_mut()
        .ok_or_else(|| anyhow::anyhow!("Config root is not an object"))?
        .entry(key)
        .or_insert_with(|| Value::Object(serde_json::Map::new()));

    let servers_map = servers
        .as_object_mut()
        .ok_or_else(|| anyhow::anyhow!("{} is not an object", key))?;

    servers_map.insert(server.name.clone(), server_to_value(server));
    write_json(path, &root)
}

pub fn remove_server(path: &Path, tool: AiTool, name: &str) -> Result<()> {
    if !path.exists() {
        anyhow::bail!("Config file does not exist: {}", path.display());
    }

    let mut root = read_json(path)?;
    let key = mcp_servers_key(tool);

    let removed = root
        .as_object_mut()
        .and_then(|obj| obj.get_mut(key))
        .and_then(|servers| servers.as_object_mut())
        .map(|servers_map| servers_map.remove(name).is_some())
        .unwrap_or(false);

    if !removed {
        anyhow::bail!("Server '{}' not found in {}", name, tool);
    }

    write_json(path, &root)
}

pub fn read_all_servers() -> HashMap<AiTool, Vec<McpServer>> {
    let mut result = HashMap::new();
    for &tool in AiTool::all() {
        if let Ok(path) = crate::tools::config_path(tool) {
            if path.exists() {
                if let Ok(servers) = read_servers(&path, tool) {
                    result.insert(tool, servers);
                }
            }
        }
    }
    result
}
