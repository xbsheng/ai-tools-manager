import { useMemo, useState, useEffect, useCallback } from "react";
import { Server, Trash2, Plus, Check } from "lucide-react";
import {
  ToolConfig,
  TOOL_LABELS,
  AiTool,
  McpServer,
  removeServer,
  addServer,
  registryList,
  registryRemove,
} from "../hooks/useTauri";
import { ServerForm } from "./ServerForm";
import { useI18n } from "../i18n";

interface ServerListProps {
  tools: ToolConfig[];
  onRefresh: () => void;
}

interface UnifiedServer {
  name: string;
  command?: string;
  url?: string;
  args: string[];
  env: Record<string, string>;
  tools: AiTool[];
}

export function ServerList({ tools, onRefresh }: ServerListProps) {
  const [showForm, setShowForm] = useState(false);
  const [registryServers, setRegistryServers] = useState<McpServer[]>([]);
  const t = useI18n();

  const loadRegistry = useCallback(async () => {
    try {
      const list = await registryList();
      setRegistryServers(list);
    } catch {
      setRegistryServers([]);
    }
  }, []);

  useEffect(() => {
    loadRegistry();
  }, [loadRegistry]);

  const installedTools = useMemo(
    () => tools.filter((t) => t.installed),
    [tools],
  );

  const unified = useMemo(() => {
    const map = new Map<string, UnifiedServer>();

    for (const server of registryServers) {
      map.set(server.name, {
        name: server.name,
        command: server.command,
        url: server.url,
        args: server.args,
        env: server.env,
        tools: [],
      });
    }

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
            env: server.env,
            tools: [config.tool],
          });
        }
      }
    }

    return Array.from(map.values());
  }, [tools, registryServers]);

  const handleDelete = async (server: UnifiedServer) => {
    try {
      for (const tool of server.tools) {
        await removeServer(tool, server.name);
      }
      await registryRemove(server.name);
      loadRegistry();
      onRefresh();
    } catch (e) {
      console.error("Failed to delete:", e);
    }
  };

  const handleToggleTool = async (server: UnifiedServer, tool: AiTool) => {
    try {
      if (server.tools.includes(tool)) {
        await removeServer(tool, server.name);
      } else {
        const mcpServer: McpServer = {
          name: server.name,
          command: server.command,
          url: server.url,
          args: server.args,
          env: server.env,
        };
        await addServer(tool, mcpServer);
      }
      onRefresh();
    } catch (e) {
      console.error("Failed to toggle tool:", e);
    }
  };

  const handleServerAdded = async () => {
    setShowForm(false);
    await loadRegistry();
    onRefresh();
  };

  const serverCountText =
    unified.length !== 1
      ? t("serverCountPlural", { count: unified.length })
      : t("serverCount", { count: unified.length });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{t("allServers")}</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-secondary">
            {serverCountText}
          </span>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-accent text-white hover:bg-accent-hover active:scale-[0.97] transition-all duration-200 shadow-[0_0_0_1px_rgba(99,102,241,0.5),0_2px_8px_rgba(99,102,241,0.25)]"
          >
            <Plus size={15} />
            {t("addServer")}
          </button>
        </div>
      </div>

      {unified.length === 0 ? (
        <div className="text-center py-20 text-text-secondary">
          <div className="inline-flex p-4 rounded-2xl bg-bg-card/50 mb-4">
            <Server size={40} className="opacity-40" />
          </div>
          <p className="font-medium text-text-primary/70">
            {t("noServersFound")}
          </p>
          <p className="text-sm mt-1">
            {t("noServersHint")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {unified.map((server) => (
            <div
              key={server.name}
              className="group bg-bg-card border border-border rounded-xl p-4 transition-all duration-200 hover:border-border hover:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_4px_24px_rgba(0,0,0,0.3)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{server.name}</h3>
                  <p className="text-sm text-text-secondary mt-1 truncate font-mono">
                    {server.command
                      ? `${server.command} ${server.args.join(" ")}`
                      : server.url || ""}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {installedTools.map((config) => {
                      const active = server.tools.includes(config.tool);
                      return (
                        <button
                          key={config.tool}
                          onClick={() => handleToggleTool(server, config.tool)}
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all duration-200 ${
                            active
                              ? "border-accent/40 bg-accent/15 text-accent"
                              : "border-border text-text-secondary hover:border-accent/30 hover:text-text-primary"
                          }`}
                          title={
                            active
                              ? t("removeFrom", { tool: TOOL_LABELS[config.tool] })
                              : t("addTo", { tool: TOOL_LABELS[config.tool] })
                          }
                        >
                          {active && <Check size={11} strokeWidth={3} />}
                          {TOOL_LABELS[config.tool]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(server)}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-danger/15 text-text-secondary hover:text-danger transition-all duration-200 ml-3 shrink-0"
                  title={t("deleteServer")}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ServerForm
          installedTools={tools}
          onClose={() => setShowForm(false)}
          onSaved={handleServerAdded}
        />
      )}
    </div>
  );
}
