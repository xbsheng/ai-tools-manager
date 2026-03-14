import { Info } from "lucide-react";

export function SettingsPanel() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Settings</h2>

      <div className="bg-bg-card border border-border rounded-xl p-6 space-y-6">
        <div>
          <h3 className="font-medium mb-2">About</h3>
          <div className="flex items-start gap-3 text-sm text-text-secondary">
            <Info size={16} className="mt-0.5 shrink-0" />
            <div>
              <p>
                AI Tools Manager (ATM) helps you manage MCP server configurations
                across multiple AI coding tools.
              </p>
              <p className="mt-2">
                Supported tools: Claude Code, Cursor, Windsurf, VS Code Copilot
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="font-medium mb-2">Config Paths</h3>
          <div className="space-y-2 text-sm">
            {[
              { tool: "Claude Code", path: "~/.claude/settings.json" },
              { tool: "Cursor", path: "~/.cursor/mcp.json" },
              {
                tool: "Windsurf",
                path: "~/.codeium/windsurf/mcp_config.json",
              },
              { tool: "VS Code Copilot", path: "~/.vscode/mcp.json" },
            ].map((item) => (
              <div
                key={item.tool}
                className="flex items-center justify-between bg-bg-primary rounded-lg px-3 py-2"
              >
                <span className="text-text-primary">{item.tool}</span>
                <code className="text-text-secondary text-xs">
                  {item.path}
                </code>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="font-medium mb-2">CLI Usage</h3>
          <div className="bg-bg-primary rounded-lg p-4 text-sm font-mono text-text-secondary space-y-1">
            <div>$ atm detect</div>
            <div>$ atm list</div>
            <div>$ atm add my-server --command npx --args -y @mcp/server --to claude-code,cursor</div>
            <div>$ atm sync --all --from claude-code --to cursor,windsurf</div>
          </div>
        </div>
      </div>
    </div>
  );
}
