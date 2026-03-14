import { useMemo } from "react";
import { Server, Trash2 } from "lucide-react";
import {
  ToolConfig,
  TOOL_LABELS,
  AiTool,
  removeServer,
} from "../hooks/useTauri";

interface ServerListProps {
  tools: ToolConfig[];
  onRefresh: () => void;
}

interface UnifiedServer {
  name: string;
  command?: string;
  url?: string;
  args: string[];
  tools: AiTool[];
}

export function ServerList({ tools, onRefresh }: ServerListProps) {
  const unified = useMemo(() => {
    const map = new Map<string, UnifiedServer>();
    for (const config of tools) {
      for (const server of config.servers) {
        const existing = map.get(server.name);
        if (existing) {
          existing.tools.push(config.tool);
        } else {
          map.set(server.name, {
            name: server.name,
            command: server.command,
            url: server.url,
            args: server.args,
            tools: [config.tool],
          });
        }
      }
    }
    return Array.from(map.values());
  }, [tools]);

  const handleRemoveFromAll = async (server: UnifiedServer) => {
    try {
      for (const tool of server.tools) {
        await removeServer(tool, server.name);
      }
      onRefresh();
    } catch (e) {
      console.error("Failed to remove:", e);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">All MCP Servers</h2>
        <span className="text-sm text-text-secondary">
          {unified.length} unique servers
        </span>
      </div>

      {unified.length === 0 ? (
        <div className="text-center py-16 text-text-secondary">
          <Server size={48} className="mx-auto mb-4 opacity-50" />
          <p>No MCP servers found</p>
          <p className="text-sm mt-1">
            Add servers from the Tools view or via CLI
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {unified.map((server) => (
            <div
              key={server.name}
              className="bg-bg-card border border-border rounded-xl p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{server.name}</h3>
                  <p className="text-sm text-text-secondary mt-1">
                    {server.command
                      ? `${server.command} ${server.args.join(" ")}`
                      : server.url || ""}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {server.tools.map((tool) => (
                      <span
                        key={tool}
                        className="text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full"
                      >
                        {TOOL_LABELS[tool]}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFromAll(server)}
                  className="p-1.5 rounded hover:bg-danger/20 text-text-secondary hover:text-danger transition-colors"
                  title="Remove from all tools"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
