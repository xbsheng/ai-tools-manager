import { useState } from "react";
import {
  RefreshCw,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import {
  ToolConfig,
  AiTool,
  TOOL_LABELS,
  syncServers,
  SyncResult,
} from "../hooks/useTauri";

interface SyncPanelProps {
  tools: ToolConfig[];
  onRefresh: () => void;
}

export function SyncPanel({ tools, onRefresh }: SyncPanelProps) {
  const installed = tools.filter((t) => t.installed);
  const [source, setSource] = useState<AiTool | "">(
    installed[0]?.tool || "",
  );
  const [targets, setTargets] = useState<Set<AiTool>>(new Set());
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);

  const toggleTarget = (tool: AiTool) => {
    const next = new Set(targets);
    if (next.has(tool)) next.delete(tool);
    else next.add(tool);
    setTargets(next);
  };

  const handleSync = async () => {
    if (!source || targets.size === 0) return;
    setSyncing(true);
    setResult(null);
    try {
      const res = await syncServers(source, Array.from(targets));
      setResult(res);
      onRefresh();
    } catch (e) {
      console.error("Sync failed:", e);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Sync MCP Servers</h2>

      <div className="bg-bg-card border border-border rounded-xl p-6">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-start">
          {/* Source */}
          <div>
            <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">
              Source
            </h3>
            <div className="space-y-2">
              {installed.map((config) => {
                const active = source === config.tool;
                return (
                  <button
                    key={config.tool}
                    onClick={() => setSource(config.tool)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 ${
                      active
                        ? "border-accent/40 bg-accent/10 text-accent shadow-[0_0_12px_rgba(99,102,241,0.08)]"
                        : "border-border hover:bg-bg-hover hover:border-border"
                    }`}
                  >
                    <div className="font-medium text-sm">
                      {TOOL_LABELS[config.tool]}
                    </div>
                    <div className="text-xs text-text-secondary mt-0.5">
                      {config.servers.length} server{config.servers.length !== 1 ? "s" : ""}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center pt-10">
            <div className="p-2 rounded-lg bg-bg-hover/50">
              <ArrowRight size={18} className="text-text-secondary/60" />
            </div>
          </div>

          {/* Targets */}
          <div>
            <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">
              Targets
            </h3>
            <div className="space-y-2">
              {installed
                .filter((c) => c.tool !== source)
                .map((config) => {
                  const active = targets.has(config.tool);
                  return (
                    <button
                      key={config.tool}
                      onClick={() => toggleTarget(config.tool)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 ${
                        active
                          ? "border-accent/40 bg-accent/10 text-accent shadow-[0_0_12px_rgba(99,102,241,0.08)]"
                          : "border-border hover:bg-bg-hover hover:border-border"
                      }`}
                    >
                      <div className="font-medium text-sm">
                        {TOOL_LABELS[config.tool]}
                      </div>
                      <div className="text-xs text-text-secondary mt-0.5">
                        {config.servers.length} server{config.servers.length !== 1 ? "s" : ""}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleSync}
            disabled={!source || targets.size === 0 || syncing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-white hover:bg-accent-hover active:scale-[0.97] transition-all duration-200 disabled:opacity-40 disabled:active:scale-100 shadow-[0_0_0_1px_rgba(99,102,241,0.5),0_2px_8px_rgba(99,102,241,0.25)]"
          >
            <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing..." : "Sync All Servers"}
          </button>
        </div>
      </div>

      {result && (
        <div className="mt-4 bg-bg-card border border-border rounded-xl p-5 space-y-4 animate-slide-up">
          <h3 className="font-semibold text-sm">Sync Results</h3>

          {result.added.length > 0 && (
            <div className="pl-3 border-l-2 border-success/40">
              <div className="flex items-center gap-1.5 text-success text-xs font-medium mb-1.5">
                <CheckCircle size={13} /> Added
              </div>
              {result.added.map((a, i) => (
                <div key={i} className="text-sm text-text-secondary ml-5">
                  {a}
                </div>
              ))}
            </div>
          )}

          {result.skipped.length > 0 && (
            <div className="pl-3 border-l-2 border-text-secondary/20">
              <div className="flex items-center gap-1.5 text-text-secondary text-xs font-medium mb-1.5">
                <CheckCircle size={13} /> Skipped (already exists)
              </div>
              {result.skipped.map((s, i) => (
                <div key={i} className="text-sm text-text-secondary ml-5">
                  {s}
                </div>
              ))}
            </div>
          )}

          {result.conflicts.length > 0 && (
            <div className="pl-3 border-l-2 border-warning/40">
              <div className="flex items-center gap-1.5 text-warning text-xs font-medium mb-1.5">
                <AlertTriangle size={13} /> Conflicts
              </div>
              {result.conflicts.map((c, i) => (
                <div key={i} className="text-sm text-text-secondary ml-5">
                  {c}
                </div>
              ))}
            </div>
          )}

          {result.added.length === 0 &&
            result.skipped.length === 0 &&
            result.conflicts.length === 0 && (
              <p className="text-sm text-text-secondary/60">Nothing to sync</p>
            )}
        </div>
      )}
    </div>
  );
}
