use crate::models::{AiTool, McpServer, SyncResult};
use crate::tools;
use anyhow::Result;

pub fn sync_server(from: AiTool, to: &[AiTool], server_name: &str) -> Result<SyncResult> {
    let source_servers = tools::get_servers(from)?;
    let server = source_servers
        .iter()
        .find(|s| s.name == server_name)
        .ok_or_else(|| anyhow::anyhow!("Server '{}' not found in {}", server_name, from))?;

    sync_server_to_tools(server, to)
}

pub fn sync_all(from: AiTool, to: &[AiTool]) -> Result<SyncResult> {
    let source_servers = tools::get_servers(from)?;
    let mut result = SyncResult {
        added: Vec::new(),
        skipped: Vec::new(),
        conflicts: Vec::new(),
    };

    for server in &source_servers {
        let sub = sync_server_to_tools(server, to)?;
        result.added.extend(sub.added);
        result.skipped.extend(sub.skipped);
        result.conflicts.extend(sub.conflicts);
    }

    Ok(result)
}

fn sync_server_to_tools(server: &McpServer, to: &[AiTool]) -> Result<SyncResult> {
    let mut result = SyncResult {
        added: Vec::new(),
        skipped: Vec::new(),
        conflicts: Vec::new(),
    };

    for &target_tool in to {
        let existing = tools::get_servers(target_tool).unwrap_or_default();
        if let Some(existing_server) = existing.iter().find(|s| s.name == server.name) {
            if servers_equal(existing_server, server) {
                result
                    .skipped
                    .push(format!("{} → {} (already exists)", server.name, target_tool));
            } else {
                result.conflicts.push(format!(
                    "{} → {} (conflict: different config)",
                    server.name, target_tool
                ));
            }
        } else {
            tools::add_server(target_tool, server)?;
            result
                .added
                .push(format!("{} → {}", server.name, target_tool));
        }
    }

    Ok(result)
}

fn servers_equal(a: &McpServer, b: &McpServer) -> bool {
    a.url == b.url && a.command == b.command && a.args == b.args && a.env == b.env
}
