use anyhow::Result;
use atm_core::models::{AiTool, McpServer};
use atm_core::{sync, tools};
use clap::{Parser, Subcommand};
use std::collections::HashMap;

#[derive(Parser)]
#[command(name = "atm", about = "AI Tools Manager - Manage MCP servers across AI coding tools")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Detect installed AI tools
    Detect,
    /// List MCP servers
    List {
        /// Filter by tool (e.g. claude-code, cursor, windsurf, vscode-copilot)
        #[arg(long)]
        tool: Option<String>,
    },
    /// Add an MCP server to one or more tools
    Add {
        /// Server name
        name: String,
        /// Command to run
        #[arg(long)]
        command: Option<String>,
        /// URL for SSE/HTTP transport
        #[arg(long)]
        url: Option<String>,
        /// Command arguments
        #[arg(long, num_args = 1..)]
        args: Vec<String>,
        /// Environment variables (KEY=VALUE)
        #[arg(long, num_args = 1..)]
        env: Vec<String>,
        /// Target tools (comma-separated)
        #[arg(long, value_delimiter = ',')]
        to: Vec<String>,
    },
    /// Remove an MCP server from one or more tools
    Remove {
        /// Server name
        name: String,
        /// Target tools (comma-separated)
        #[arg(long, value_delimiter = ',')]
        from: Vec<String>,
    },
    /// Sync MCP servers between tools
    Sync {
        /// Server name to sync (omit for --all)
        name: Option<String>,
        /// Sync all servers
        #[arg(long)]
        all: bool,
        /// Source tool
        #[arg(long)]
        from: String,
        /// Target tools (comma-separated)
        #[arg(long, value_delimiter = ',')]
        to: Vec<String>,
    },
}

fn parse_tool(s: &str) -> Result<AiTool> {
    s.parse::<AiTool>()
}

fn parse_env_vars(env_args: &[String]) -> Result<HashMap<String, String>> {
    let mut map = HashMap::new();
    for e in env_args {
        let (key, value) = e
            .split_once('=')
            .ok_or_else(|| anyhow::anyhow!("Invalid env var '{}': expected KEY=VALUE format", e))?;
        if key.is_empty() {
            anyhow::bail!("Invalid env var '{}': key cannot be empty", e);
        }
        map.insert(key.to_string(), value.to_string());
    }
    Ok(map)
}

fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::Detect => {
            let configs = tools::detect_all();
            println!("Detected AI Tools:\n");
            for config in &configs {
                let status = if config.installed {
                    "installed"
                } else {
                    "not found"
                };
                println!(
                    "  {} [{}]",
                    config.tool, status
                );
                if config.installed {
                    println!("    Config: {}", config.config_path.display());
                    println!("    MCP Servers: {}", config.servers.len());
                }
            }
        }
        Commands::List { tool } => {
            if let Some(tool_name) = tool {
                let tool = parse_tool(&tool_name)?;
                let servers = tools::get_servers(tool)?;
                println!("{} - MCP Servers:\n", tool);
                print_servers(&servers);
            } else {
                let all = atm_core::config::read_all_servers();
                for (tool, servers) in &all {
                    println!("{} ({} servers):", tool, servers.len());
                    print_servers(servers);
                    println!();
                }
            }
        }
        Commands::Add {
            name,
            command,
            url,
            args,
            env,
            to,
        } => {
            if to.is_empty() {
                anyhow::bail!("Specify target tools with --to");
            }
            if command.is_none() && url.is_none() {
                anyhow::bail!("Provide either --command or --url for the server");
            }
            let server = McpServer {
                name: name.clone(),
                url,
                command,
                args,
                env: parse_env_vars(&env)?,
            };
            for tool_name in &to {
                let tool = parse_tool(tool_name)?;
                tools::add_server(tool, &server)?;
                println!("Added '{}' to {}", name, tool);
            }
        }
        Commands::Remove { name, from } => {
            if from.is_empty() {
                anyhow::bail!("Specify tools with --from");
            }
            for tool_name in &from {
                let tool = parse_tool(tool_name)?;
                tools::remove_server(tool, &name)?;
                println!("Removed '{}' from {}", name, tool);
            }
        }
        Commands::Sync {
            name,
            all,
            from,
            to,
        } => {
            if to.is_empty() {
                anyhow::bail!("Specify target tools with --to");
            }
            let from_tool = parse_tool(&from)?;
            let to_tools: Vec<AiTool> = to
                .iter()
                .map(|t| parse_tool(t))
                .collect::<Result<_>>()?;

            let result = if all {
                sync::sync_all(from_tool, &to_tools)?
            } else {
                let server_name =
                    name.ok_or_else(|| anyhow::anyhow!("Specify server name or --all"))?;
                sync::sync_server(from_tool, &to_tools, &server_name)?
            };

            if result.added.is_empty() && result.skipped.is_empty() && result.conflicts.is_empty() {
                println!("Nothing to sync.");
            } else {
                if !result.added.is_empty() {
                    println!("Added:");
                    for a in &result.added {
                        println!("  + {}", a);
                    }
                }
                if !result.skipped.is_empty() {
                    println!("Skipped:");
                    for s in &result.skipped {
                        println!("  - {}", s);
                    }
                }
                if !result.conflicts.is_empty() {
                    println!("Conflicts:");
                    for c in &result.conflicts {
                        println!("  ! {}", c);
                    }
                }
            }
        }
    }

    Ok(())
}

fn print_servers(servers: &[McpServer]) {
    if servers.is_empty() {
        println!("  (none)");
        return;
    }
    for server in servers {
        println!("  {} ", server.name);
        if let Some(ref cmd) = server.command {
            println!("    command: {}", cmd);
        }
        if let Some(ref url) = server.url {
            println!("    url: {}", url);
        }
        if !server.args.is_empty() {
            println!("    args: {}", server.args.join(" "));
        }
        if !server.env.is_empty() {
            for (k, v) in &server.env {
                println!("    env: {}={}", k, v);
            }
        }
    }
}
