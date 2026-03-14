# AI Tools Manager (ATM)

[English](./README.md)

跨平台桌面应用 + CLI 工具，统一管理多个 AI 编程工具的 MCP（Model Context Protocol）Server 配置。

## 支持的 AI 工具

| 工具 | 配置路径 | 状态 |
|------|---------|------|
| Claude Code | `~/.claude.json` / `~/.claude/settings.json` | ✅ |
| Cursor | `~/.cursor/mcp.json` | ✅ |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` | ✅ |
| VS Code Copilot | `~/.vscode/mcp.json` | ✅ |

## 安装

### 从 Release 下载

前往 [GitHub Releases](../../releases) 下载对应平台的安装包。

### 从源码构建

**前置条件：** Rust 1.87+、Node.js 20+、pnpm

```bash
# 克隆仓库
git clone https://github.com/user/ai-tools-manager.git
cd ai-tools-manager

# 仅构建 CLI
cargo build -p atm-cli --release

# 构建 GUI（Tauri 桌面应用）
pnpm install
pnpm tauri build
```

## CLI 使用

CLI 二进制文件名为 `atm`。

### 检测已安装的 AI 工具

```bash
atm detect
```

输出：
```
Detected AI Tools:

  Claude Code [installed]
    Config: /Users/you/.claude.json
    MCP Servers: 2
  Cursor [installed]
    Config: /Users/you/.cursor/mcp.json
    MCP Servers: 3
  Windsurf [not found]
  VS Code Copilot [not found]
```

### 列出 MCP Server

```bash
# 列出所有工具的所有 Server
atm list

# 列出指定工具的 Server
atm list --tool claude-code
atm list --tool cursor
```

### 添加 Server

```bash
# 添加命令行类型的 Server
atm add my-server \
  --command npx \
  --args -y @modelcontextprotocol/server-filesystem ~/docs \
  --to claude-code,cursor

# 添加 URL 类型的 Server（SSE/HTTP）
atm add docs-server \
  --url https://docs.example.com/mcp \
  --to claude-code

# 添加时指定环境变量
atm add my-api \
  --command node \
  --args server.js \
  --env API_KEY=sk-xxx DEBUG=true \
  --to claude-code,cursor,windsurf
```

### 删除 Server

```bash
atm remove my-server --from claude-code,cursor
```

### 在工具之间同步 Server

```bash
# 同步指定 Server
atm sync my-server --from claude-code --to cursor,windsurf

# 从一个工具同步全部 Server 到其他工具
atm sync --all --from claude-code --to cursor,windsurf
```

同步输出：
```
Added:
  + my-server → Cursor
  + my-server → Windsurf
Skipped:
  - docs-server → Cursor (already exists)
Conflicts:
  ! api-server → Windsurf (conflict: different config)
```

## GUI 桌面应用

启动桌面应用：

```bash
# 开发模式
pnpm tauri dev

# 或者运行构建后的应用
./target/release/atm-tauri
```

### 功能

- **Tools 视图** — 查看所有检测到的 AI 工具，展开管理各工具的 MCP Server
- **Servers 视图** — 跨工具的统一 MCP Server 列表，显示每个 Server 被哪些工具使用
- **Sync 面板** — 选择源工具和目标工具，一键批量同步所有 Server
- **Settings** — 配置路径参考和 CLI 用法说明

## 项目结构

```
ai-tools-manager/
├── crates/
│   ├── core/          # 共享 Rust 核心库（数据模型、配置读写、同步逻辑）
│   └── cli/           # CLI 命令行工具（clap）
├── src-tauri/         # Tauri 2 后端（封装 core 库调用）
├── src/               # React + Tailwind CSS 前端
└── .github/workflows/ # CI/CD 自动构建发版
```

## 许可证

MIT
