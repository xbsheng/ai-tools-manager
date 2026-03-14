# AI Tools Manager (ATM)

[中文文档](./README_zh.md)

A cross-platform desktop app + CLI tool for managing MCP (Model Context Protocol) server configurations across multiple AI coding tools.

## Supported AI Tools

| Tool | Config Path | Status |
|------|------------|--------|
| Claude Code | `~/.claude.json` / `~/.claude/settings.json` | ✅ |
| Cursor | `~/.cursor/mcp.json` | ✅ |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` | ✅ |
| VS Code Copilot | `~/.vscode/mcp.json` | ✅ |

## Installation

### From Release

Download the latest binary from [GitHub Releases](../../releases).

### Build from Source

**Prerequisites:** Rust 1.87+, Node.js 20+, pnpm

```bash
# Clone
git clone https://github.com/user/ai-tools-manager.git
cd ai-tools-manager

# Build CLI only
cargo build -p atm-cli --release

# Build GUI (Tauri)
pnpm install
pnpm tauri build
```

## CLI Usage

The CLI binary is called `atm`.

### Detect installed tools

```bash
atm detect
```

Output:
```
Detected AI Tools:

  Claude Code [installed]
    Config: /home/user/.claude.json
    MCP Servers: 2
  Cursor [installed]
    Config: /home/user/.cursor/mcp.json
    MCP Servers: 3
  Windsurf [not found]
  VS Code Copilot [not found]
```

### List MCP servers

```bash
# List all servers across all tools
atm list

# List servers for a specific tool
atm list --tool claude-code
atm list --tool cursor
```

### Add a server

```bash
# Add a command-based server
atm add my-server \
  --command npx \
  --args -y @modelcontextprotocol/server-filesystem /home/user/docs \
  --to claude-code,cursor

# Add a URL-based server (SSE/HTTP)
atm add docs-server \
  --url https://docs.example.com/mcp \
  --to claude-code

# Add with environment variables
atm add my-api \
  --command node \
  --args server.js \
  --env API_KEY=sk-xxx DEBUG=true \
  --to claude-code,cursor,windsurf
```

### Remove a server

```bash
atm remove my-server --from claude-code,cursor
```

### Sync servers between tools

```bash
# Sync a specific server
atm sync my-server --from claude-code --to cursor,windsurf

# Sync all servers from one tool to others
atm sync --all --from claude-code --to cursor,windsurf
```

Sync output:
```
Added:
  + my-server → Cursor
  + my-server → Windsurf
Skipped:
  - docs-server → Cursor (already exists)
Conflicts:
  ! api-server → Windsurf (conflict: different config)
```

## GUI

Launch the desktop application:

```bash
# Development mode
pnpm tauri dev

# Or run the built application
./target/release/atm-tauri
```

### Features

- **Tools View** — See all detected AI tools, expand to view/manage their MCP servers
- **Servers View** — Unified view of all MCP servers across tools, with tool badges
- **Sync Panel** — Select source and target tools, batch sync all servers with one click
- **Settings** — Reference for config paths and CLI usage

## Architecture

```
ai-tools-manager/
├── crates/
│   ├── core/          # Shared Rust library (models, config IO, sync logic)
│   └── cli/           # CLI binary (clap)
├── src-tauri/         # Tauri 2 backend (commands wrapping core)
├── src/               # React + Tailwind CSS frontend
└── .github/workflows/ # CI/CD
```

## License

MIT
