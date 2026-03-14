import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  Server,
  Plus,
  Trash2,
} from "lucide-react";
import {
  ToolConfig,
  TOOL_LABELS,
  removeServer,
  AiTool,
} from "../hooks/useTauri";
import { ServerForm } from "./ServerForm";

interface ToolListProps {
  tools: ToolConfig[];
  onRefresh: () => void;
}

export function ToolList({ tools, onRefresh }: ToolListProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [addingTo, setAddingTo] = useState<AiTool | null>(null);

  const toggle = (tool: string) => {
    const next = new Set(expanded);
    if (next.has(tool)) next.delete(tool);
    else next.add(tool);
    setExpanded(next);
  };

  const handleRemove = async (tool: AiTool, name: string) => {
    try {
      await removeServer(tool, name);
      onRefresh();
    } catch (e) {
      console.error("Failed to remove server:", e);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">AI Tools</h2>
      </div>

      <div className="space-y-3">
        {tools.map((config) => {
          const isExpanded = expanded.has(config.tool);
          return (
            <div
              key={config.tool}
              className="bg-bg-card border border-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggle(config.tool)}
                className="w-full flex items-center justify-between p-4 hover:bg-bg-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                  <span className="font-medium">
                    {TOOL_LABELS[config.tool]}
                  </span>
                  {config.installed ? (
                    <CheckCircle size={16} className="text-success" />
                  ) : (
                    <XCircle size={16} className="text-text-secondary" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <Server size={14} />
                  {config.servers.length} servers
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border p-4 bg-bg-primary/50">
                  <div className="text-xs text-text-secondary mb-3">
                    Config: {config.config_path}
                  </div>

                  {config.servers.length === 0 ? (
                    <p className="text-sm text-text-secondary">
                      No MCP servers configured
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {config.servers.map((server) => (
                        <div
                          key={server.name}
                          className="flex items-center justify-between bg-bg-secondary rounded-lg p-3"
                        >
                          <div>
                            <div className="font-medium text-sm">
                              {server.name}
                            </div>
                            <div className="text-xs text-text-secondary mt-0.5">
                              {server.command
                                ? `${server.command} ${server.args.join(" ")}`
                                : server.url || ""}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleRemove(config.tool, server.name)
                            }
                            className="p-1.5 rounded hover:bg-danger/20 text-text-secondary hover:text-danger transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {config.installed && (
                    <button
                      onClick={() => setAddingTo(config.tool)}
                      className="mt-3 flex items-center gap-2 text-sm text-accent hover:text-accent-hover transition-colors"
                    >
                      <Plus size={14} />
                      Add Server
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {addingTo && (
        <ServerForm
          tool={addingTo}
          onClose={() => setAddingTo(null)}
          onSaved={() => {
            setAddingTo(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
