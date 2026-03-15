import { Info, Terminal } from "lucide-react";

const CONFIG_PATHS = [
  { tool: "Claude Code", path: "~/.claude/settings.json" },
  { tool: "Cursor", path: "~/.cursor/mcp.json" },
  { tool: "Windsurf", path: "~/.codeium/windsurf/mcp_config.json" },
  { tool: "VS Code Copilot", path: "~/.vscode/mcp.json" },
];

const CLI_COMMANDS = [
  "atm detect",
  "atm list",
  "atm add my-server --command npx --args -y @mcp/server --to claude-code,cursor",
  "atm sync --all --from claude-code --to cursor,windsurf",
];

export function SettingsPanel() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Settings</h2>

      <div className="space-y-4">
        {/* About */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-accent/10 mt-0.5 shrink-0">
              <Info size={14} className="text-accent" />
            </div>
            <div className="text-sm text-text-secondary leading-relaxed">
              <p>
                AI Tools Manager (ATM) helps you manage MCP server
                configurations across multiple AI coding tools.
              </p>
              <p className="mt-2 text-text-secondary/70">
                Supported: Claude Code, Cursor, Windsurf, VS Code Copilot
              </p>
            </div>
          </div>
        </div>

        {/* Config Paths */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">
            Config Paths
          </h3>
          <div className="space-y-1.5">
            {CONFIG_PATHS.map((item) => (
              <div
                key={item.tool}
                className="flex items-center justify-between bg-bg-primary/80 rounded-lg px-3 py-2.5"
              >
                <span className="text-sm">{item.tool}</span>
                <code className="text-xs text-text-secondary/70 font-mono">
                  {item.path}
                </code>
              </div>
            ))}
          </div>
        </div>

        {/* CLI Usage */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Terminal size={13} className="text-text-secondary" />
            <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              CLI Usage
            </h3>
          </div>
          <div className="bg-bg-primary/80 rounded-lg p-4 space-y-1.5 border border-border/50">
            {CLI_COMMANDS.map((cmd, i) => (
              <div key={i} className="text-xs font-mono text-text-secondary leading-relaxed">
                <span className="text-accent/60 select-none">$ </span>
                <span className="text-text-primary/80">{cmd}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
