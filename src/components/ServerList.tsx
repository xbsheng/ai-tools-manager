import { useMemo, useState, useEffect, useCallback } from "react";
import { Server, Trash2, Plus, Check, Edit2, Copy, CheckCheck, Search } from "lucide-react";
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
import { ServerForm, EditingServer } from "./ServerForm";
import { ConfirmDialog } from "./ConfirmDialog";
import { ToastData } from "./Toast";
import { useI18n } from "../i18n";

interface ServerListProps {
  tools: ToolConfig[];
  onRefresh: () => void;
  showToast: (type: ToastData["type"], message: string) => void;
}

interface UnifiedServer {
  name: string;
  command?: string;
  url?: string;
  args: string[];
  env: Record<string, string>;
  tools: AiTool[];
}

export function ServerList({ tools, onRefresh, showToast }: ServerListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingServer, setEditingServer] = useState<EditingServer | null>(null);
  const [registryServers, setRegistryServers] = useState<McpServer[]>([]);
  const [copiedServer, setCopiedServer] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UnifiedServer | null>(null);
  const [search, setSearch] = useState("");
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

  const filtered = useMemo(() => {
    if (!search.trim()) return unified;
    const q = search.toLowerCase();
    return unified.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.command?.toLowerCase().includes(q) ||
        s.url?.toLowerCase().includes(q) ||
        s.args.some((a) => a.toLowerCase().includes(q)),
    );
  }, [unified, search]);

  const handleDelete = async (server: UnifiedServer) => {
    try {
      for (const tool of server.tools) {
        await removeServer(tool, server.name);
      }
      await registryRemove(server.name);
      loadRegistry();
      onRefresh();
      showToast("success", t("deletedServer", { name: server.name }));
    } catch (e) {
      showToast("error", t("operationFailed", { error: String(e) }));
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
      showToast("error", t("operationFailed", { error: String(e) }));
    }
  };

  const handleEdit = (server: UnifiedServer) => {
    setEditingServer({
      name: server.name,
      server: {
        name: server.name,
        command: server.command,
        url: server.url,
        args: server.args,
        env: server.env,
      },
      tools: server.tools,
    });
    setShowForm(true);
  };

  const handleCopy = async (server: UnifiedServer) => {
    const config: Record<string, unknown> = {};
    if (server.command) {
      config.command = server.command;
      if (server.args.length > 0) config.args = server.args;
    } else if (server.url) {
      config.url = server.url;
    }
    if (Object.keys(server.env).length > 0) config.env = server.env;

    const json = JSON.stringify({ [server.name]: config }, null, 2);
    await navigator.clipboard.writeText(json);
    setCopiedServer(server.name);
    setTimeout(() => setCopiedServer(null), 2000);
  };

  const handleServerAdded = async () => {
    setShowForm(false);
    setEditingServer(null);
    await loadRegistry();
    onRefresh();
  };

  const serverCountText =
    unified.length !== 1
      ? t("serverCountPlural", { count: unified.length })
      : t("serverCount", { count: unified.length });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{t("allServers")}</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-secondary">
            {serverCountText}
          </span>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-accent text-white hover:bg-accent-hover active:scale-[0.97] transition-all duration-200 shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_2px_8px_rgba(94,106,210,0.25)]"
          >
            <Plus size={15} />
            {t("addServer")}
          </button>
        </div>
      </div>

      {unified.length > 0 && (
        <div className="relative mb-4">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/60 focus:shadow-[0_0_0_3px_rgba(94,106,210,0.1)] transition-all duration-200"
            placeholder={t("searchServers")}
            aria-label={t("searchServers")}
          />
        </div>
      )}

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
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-text-secondary">
          <p className="text-sm">{t("noSearchResults", { query: search })}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((server) => (
            <div
              key={server.name}
              className="group bg-bg-card border border-border rounded-xl p-4 transition-all duration-200 hover:border-border hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_4px_24px_rgba(0,0,0,0.4),0_0_40px_rgba(94,106,210,0.04)]"
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
                          aria-label={
                            active
                              ? t("removeFrom", { tool: TOOL_LABELS[config.tool] })
                              : t("addTo", { tool: TOOL_LABELS[config.tool] })
                          }
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

                <div className="flex items-center gap-1 ml-3 shrink-0">
                  <button
                    onClick={() => handleCopy(server)}
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      copiedServer === server.name
                        ? "opacity-100 text-green-400"
                        : "opacity-0 group-hover:opacity-100 hover:bg-accent/15 text-text-secondary hover:text-accent"
                    }`}
                    aria-label={t("copyAsJson")}
                    title={copiedServer === server.name ? t("copied") : t("copyAsJson")}
                  >
                    {copiedServer === server.name ? <CheckCheck size={15} /> : <Copy size={15} />}
                  </button>
                  <button
                    onClick={() => handleEdit(server)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-accent/15 text-text-secondary hover:text-accent transition-all duration-200"
                    aria-label={t("editMcpServer")}
                    title={t("editMcpServer")}
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(server)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-danger/15 text-text-secondary hover:text-danger transition-all duration-200"
                    aria-label={t("deleteServer")}
                    title={t("deleteServer")}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ServerForm
          installedTools={tools}
          editingServer={editingServer ?? undefined}
          onClose={() => {
            setShowForm(false);
            setEditingServer(null);
          }}
          onSaved={handleServerAdded}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={t("confirmDeleteServer", { name: confirmDelete.name })}
          onConfirm={() => {
            handleDelete(confirmDelete);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
