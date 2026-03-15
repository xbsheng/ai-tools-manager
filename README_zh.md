# AI Tools Manager (ATM)

[English](./README.md)

跨平台桌面应用 + CLI 工具，统一管理多个 AI 编程工具的 MCP（Model Context Protocol）Server 配置 —— 一站式检测、添加、删除、同步 MCP Server。

## 支持的工具

| 工具 | 配置路径 | 状态 |
|------|---------|------|
| Claude Code | `~/.claude.json` / `~/.claude/settings.json` | ✅ |
| Cursor | `~/.cursor/mcp.json` | ✅ |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` | ✅ |
| VS Code Copilot | `~/.vscode/mcp.json` | ✅ |

## 安装

### 下载安装

前往 [GitHub Releases](https://github.com/xbsheng/ai-tools-manager/releases) 下载对应平台的安装包：

| 平台 | 桌面应用 | CLI |
|------|---------|-----|
| macOS (Apple Silicon) | `.dmg` | `atm-macos-aarch64` |
| macOS (Intel) | `.dmg` | `atm-macos-x86_64` |
| Windows | `.msi` / `.exe` | `atm-windows-x86_64.exe` |
| Linux | `.deb` / `.AppImage` | `atm-linux-x86_64` / `atm-linux-aarch64` |

### 从源码构建

**前置条件：** Rust 1.87+、Node.js 20+、pnpm

```bash
git clone https://github.com/xbsheng/ai-tools-manager.git
cd ai-tools-manager

# 仅构建 CLI
cargo build -p atm-cli --release
# 二进制文件位于 ./target/release/atm

# 构建桌面应用（Tauri）
pnpm install
pnpm tauri build
```

## 桌面应用

GUI 提供可视化界面，方便管理所有 MCP Server。

```bash
# 开发模式
pnpm tauri dev

# 或运行构建后的应用
./target/release/atm-tauri
```

### 功能

- **工具** — 查看所有检测到的 AI 工具及其 MCP Server 数量，展开可管理各 Server
- **MCP** — 跨工具的统一 MCP Server 列表，徽标标识各 Server 被哪些工具使用
- **技能** — 浏览和管理 Claude Code、Cursor 的自定义技能，支持跨工具复制技能
- **同步** — 选择源工具和目标工具，一键批量同步所有 Server
- **设置** — 语言切换（中文/EN）、主题切换（深色/浅色）、快捷键参考、系统信息一键复制方便反馈问题
- **自动检查更新** — 有新版本时自动提示，跳转 GitHub Releases 下载

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `⌘ R` | 刷新数据 |
| `⌘ N` | 添加新 Server |
| `⌘ ,` | 打开设置 |
| `⌘ /` | 聚焦搜索 |
| `⌘ 1-4` | 切换视图 |

## CLI 命令行

CLI 二进制文件名为 `atm`，可独立于桌面应用使用。

### 检测已安装的工具

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

### 列出 MCP Server

```bash
# 列出所有工具的全部 Server
atm list

# 列出指定工具的 Server
atm list --tool claude-code
atm list --tool cursor
```

### 添加 Server

```bash
# 命令行类型 Server
atm add my-server \
  --command npx \
  --args -y @modelcontextprotocol/server-filesystem ~/docs \
  --to claude-code,cursor

# URL 类型 Server（SSE/HTTP）
atm add docs-server \
  --url https://docs.example.com/mcp \
  --to claude-code

# 带环境变量
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

### 同步 Server

```bash
# 同步指定 Server
atm sync my-server --from claude-code --to cursor,windsurf

# 同步全部 Server
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

## 项目结构

```
ai-tools-manager/
├── crates/
│   ├── core/           # 共享核心库 — 数据模型、配置读写、同步逻辑
│   └── cli/            # CLI 命令行工具（clap）
├── src-tauri/          # Tauri 2 后端 — 将 core 封装为 IPC 命令
├── src/                # React 18 + TypeScript + Tailwind CSS 4 前端
│   ├── components/     # UI 组件（ToolList、ServerList、SkillList 等）
│   ├── hooks/          # Tauri 命令封装、设置上下文
│   └── i18n/           # 国际化（中文 / EN）
└── .github/workflows/  # CI — tag 推送时自动构建全平台 CLI + Tauri 应用
```

### 技术栈

| 层级 | 技术 |
|------|------|
| 核心 | Rust（workspace：`core` + `cli` crate） |
| 桌面 | Tauri 2 |
| 前端 | React 18、TypeScript、Tailwind CSS 4、Vite |
| 图标 | Lucide React |
| 包管理 | pnpm |

## 参与贡献

1. Fork 本仓库
2. 创建功能分支（`git checkout -b feat/my-feature`）
3. 提交你的更改
4. 推送并创建 Pull Request

## 许可证

MIT
