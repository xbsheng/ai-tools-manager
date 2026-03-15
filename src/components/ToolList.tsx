import { useState } from "react";
import {
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
import { useI18n } from "../i18n";

interface ToolListProps {
  tools: ToolConfig[];
  onRefresh: () => void;
}

export function ToolList({ tools, onRefresh }: ToolListProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [addingTo, setAddingTo] = useState<AiTool | null>(null);
  const t = useI18n();

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

  const serverCountText = (count: number) =>
    count !== 1
      ? t("serverCountPlural", { count })
      : t("serverCount", { count });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{t("aiTools")}</h2>
      </div>

      <div className="space-y-3">
        {tools.filter((config) => TOOL_LABELS[config.tool]).map((config) => {
          const isExpanded = expanded.has(config.tool);
          return (
            <div
              key={config.tool}
              className="bg-bg-card border border-border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_4px_24px_rgba(0,0,0,0.3)]"
            >
              <button
                onClick={() => toggle(config.tool)}
                className="w-full flex items-center justify-between p-4 hover:bg-bg-hover/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="transition-transform duration-200" style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}>
                    <ChevronRight size={16} className="text-text-secondary" />
                  </div>
                  <span className="font-medium">
                    {TOOL_LABELS[config.tool]}
                  </span>
                  {config.installed ? (
                    <CheckCircle size={15} className="text-success" />
                  ) : (
                    <XCircle size={15} className="text-text-secondary/40" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-text-secondary text-xs">
                  <Server size={13} />
                  {serverCountText(config.servers.length)}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border px-4 py-3 bg-bg-primary/40 animate-slide-up">
                  <div className="text-[11px] text-text-secondary/60 font-mono mb-3 truncate">
                    {config.config_path}
                  </div>

                  {config.servers.length === 0 ? (
                    <p className="text-sm text-text-secondary/60 py-2">
                      {t("noServersConfigured")}
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {config.servers.map((server) => (
                        <div
                          key={server.name}
                          className="group flex items-center justify-between bg-bg-secondary/80 rounded-lg p-3 border border-transparent hover:border-border/50 transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="font-medium text-sm">
                              {server.name}
                            </div>
                            <div className="text-xs text-text-secondary mt-0.5 truncate font-mono">
                              {server.command
                                ? `${server.command} ${server.args.join(" ")}`
                                : server.url || ""}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleRemove(config.tool, server.name)
                            }
                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-danger/15 text-text-secondary hover:text-danger transition-all duration-200 shrink-0 ml-2"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {config.installed && (
                    <button
                      onClick={() => setAddingTo(config.tool)}
                      className="mt-3 flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover transition-colors"
                    >
                      <Plus size={13} />
                      {t("addServer")}
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
