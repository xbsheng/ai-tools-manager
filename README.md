# AI Tools Manager (ATM)

[中文文档](./README_zh.md)

A cross-platform desktop app and CLI for managing MCP (Model Context Protocol) server configurations across multiple AI coding tools — detect, add, remove, and sync servers in one place.

## Supported Tools

| Tool | Config Path | Status |
|------|------------|--------|
| Claude Code | `~/.claude.json` / `~/.claude/settings.json` | ✅ |
| Cursor | `~/.cursor/mcp.json` | ✅ |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` | ✅ |
| VS Code Copilot | `~/.vscode/mcp.json` | ✅ |

## Installation

### Download

Download the latest release from [GitHub Releases](https://github.com/xbsheng/ai-tools-manager/releases):

| Platform | Desktop App | CLI |
|----------|------------|-----|
| macOS (Apple Silicon) | `.dmg` | `atm-macos-aarch64` |
| macOS (Intel) | `.dmg` | `atm-macos-x86_64` |
| Windows | `.msi` / `.exe` | `atm-windows-x86_64.exe` |
| Linux | `.deb` / `.AppImage` | `atm-linux-x86_64` / `atm-linux-aarch64` |

### Build from Source

**Prerequisites:** Rust 1.87+, Node.js 20+, pnpm

```bash
git clone https://github.com/xbsheng/ai-tools-manager.git
cd ai-tools-manager

# CLI only
cargo build -p atm-cli --release
# binary at ./target/release/atm

# Desktop app (Tauri)
pnpm install
pnpm tauri build
```

## Desktop App

The GUI provides a visual interface for all MCP server management tasks.

```bash
# Development
pnpm tauri dev

# Or run the built binary
./target/release/atm-tauri
```

### Features

- **Tools** — View all detected AI tools with their MCP server counts; expand to manage individual servers
- **MCP** — Unified list of all MCP servers across every tool, with badges showing which tools use each server
- **Skills** — Browse and manage custom skills for Claude Code and Cursor; copy skills between tools
- **Sync** — Select a source tool and target tools, then batch-sync all servers with one click
- **Settings** — Language (EN/中文), theme (dark/light), keyboard shortcuts reference, system info with one-click copy for bug reports
- **Auto-update check** — Notifies when a new version is available on GitHub Releases

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘ R` | Refresh data |
| `⌘ N` | Add new server |
| `⌘ ,` | Open settings |
| `⌘ /` | Focus search |
| `⌘ 1-4` | Navigate between views |

## CLI

The CLI binary is `atm`. It works independently of the desktop app.

### Detect installed tools

```bash
atm detect
```

```
Detected AI Tools:

  Claude Code [installed]
    Config: /Users/you/.claude.json
    MCP Servers: 3
  Cursor [installed]
    Config: /Users/you/.cursor/mcp.json
    MCP Servers: 2
  Windsurf [not found]
  VS Code Copilot [not found]
```

### List MCP servers

```bash
# All tools
atm list

# Specific tool
atm list --tool claude-code
atm list --tool cursor
```

### Add a server

```bash
# Command-based server
atm add my-server \
  --command npx \
  --args -y @modelcontextprotocol/server-filesystem /home/user/docs \
  --to claude-code,cursor

# URL-based server (SSE/HTTP)
atm add docs-server \
  --url https://docs.example.com/mcp \
  --to claude-code

# With environment variables
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

# Sync all servers
atm sync --all --from claude-code --to cursor,windsurf
```

```
Added:
  + my-server → Cursor
  + my-server → Windsurf
Skipped:
  - docs-server → Cursor (already exists)
Conflicts:
  ! api-server → Windsurf (conflict: different config)
```

## Architecture

```
ai-tools-manager/
├── crates/
│   ├── core/           # Shared library — models, config I/O, sync logic
│   └── cli/            # CLI binary (clap)
├── src-tauri/          # Tauri 2 backend — wraps core as IPC commands
├── src/                # React 18 + TypeScript + Tailwind CSS 4 frontend
│   ├── components/     # UI components (ToolList, ServerList, SkillList, etc.)
│   ├── hooks/          # Tauri command wrappers, settings context
│   └── i18n/           # Internationalization (EN / 中文)
└── .github/workflows/  # CI — builds CLI + Tauri for all platforms on tag push
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Core | Rust (workspace with `core` + `cli` crates) |
| Desktop | Tauri 2 |
| Frontend | React 18, TypeScript, Tailwind CSS 4, Vite |
| Icons | Lucide React |
| Package Manager | pnpm |

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes
4. Push and open a pull request

## License

MIT
