import { useState, useEffect, useRef } from "react";
import { X, Terminal, Globe, FileJson, Plus, Trash2 } from "lucide-react";
import {
  AiTool,
  TOOL_LABELS,
  McpServer,
  ToolConfig,
  addServer,
  removeServer,
  registryAdd,
  registryRemove,
} from "../hooks/useTauri";
import { JsonEditor } from "./JsonEditor";
import { useI18n } from "../i18n";

type InputMode = "command" | "url" | "json";

export interface EditingServer {
  name: string;
  server: McpServer;
  tools: AiTool[];
}

interface ServerFormProps {
  tool?: AiTool;
  installedTools?: ToolConfig[];
  editingServer?: EditingServer;
  onClose: () => void;
  onSaved: () => void;
}

function parseJsonConfig(
  raw: string,
): { server: McpServer; nameFromKey?: string } | string {
  try {
    const parsed = JSON.parse(raw.trim());

    const topKeys = Object.keys(parsed);
    if (
      topKeys.length === 1 &&
      typeof parsed[topKeys[0]] === "object" &&
      !Array.isArray(parsed[topKeys[0]]) &&
      (parsed[topKeys[0]].command || parsed[topKeys[0]].url)
    ) {
      const nameFromKey = topKeys[0];
      const obj = parsed[nameFromKey];
      return {
        nameFromKey,
        server: {
          name: nameFromKey,
          command: obj.command || undefined,
          url: obj.url || undefined,
          args: Array.isArray(obj.args) ? obj.args.map(String) : [],
          env:
            obj.env && typeof obj.env === "object"
              ? Object.fromEntries(
                  Object.entries(obj.env).map(([k, v]) => [k, String(v)]),
                )
              : {},
        },
      };
    }

    if (parsed.command || parsed.url) {
      return {
        server: {
          name: "",
          command: parsed.command || undefined,
          url: parsed.url || undefined,
          args: Array.isArray(parsed.args) ? parsed.args.map(String) : [],
          env:
            parsed.env && typeof parsed.env === "object"
              ? Object.fromEntries(
                  Object.entries(parsed.env).map(([k, v]) => [k, String(v)]),
                )
              : {},
        },
      };
    }

    return "errorJsonCommandOrUrl";
  } catch {
    return "errorInvalidJson";
  }
}

export function ServerForm({
  tool,
  installedTools,
  editingServer,
  onClose,
  onSaved,
}: ServerFormProps) {
  const isEdit = !!editingServer;

  const [mode, setMode] = useState<InputMode>(() => {
    if (editingServer) {
      return editingServer.server.url ? "url" : "command";
    }
    return "command";
  });
  const [name, setName] = useState(() => editingServer?.server.name ?? "");
  const [command, setCommand] = useState(() => editingServer?.server.command ?? "");
  const [url, setUrl] = useState(() => editingServer?.server.url ?? "");
  const [args, setArgs] = useState(() => editingServer?.server.args.join(" ") ?? "");
  const [envPairs, setEnvPairs] = useState<{ key: string; value: string }[]>(() => {
    if (editingServer) {
      const entries = Object.entries(editingServer.server.env);
      return entries.length > 0 ? entries.map(([k, v]) => ({ key: k, value: v })) : [];
    }
    return [];
  });
  const [jsonText, setJsonText] = useState("");
  const [selectedTools, setSelectedTools] = useState<Set<AiTool>>(() => {
    if (editingServer) return new Set(editingServer.tools);
    if (tool) return new Set([tool]);
    return new Set();
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const backdropRef = useRef<HTMLDivElement>(null);
  const t = useI18n();

  const multiMode = !tool && installedTools;

  // Escape key to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggleTool = (t: AiTool) => {
    const next = new Set(selectedTools);
    if (next.has(t)) next.delete(t);
    else next.add(t);
    setSelectedTools(next);
  };

  const buildServerFromForm = (): McpServer | null => {
    if (!name.trim()) {
      setError(t("errorNameRequired"));
      return null;
    }
    if (mode === "command" && !command.trim()) {
      setError(t("errorCommandRequired"));
      return null;
    }
    if (mode === "url" && !url.trim()) {
      setError(t("errorUrlRequired"));
      return null;
    }

    const envMap: Record<string, string> = {};
    for (const pair of envPairs) {
      if (pair.key.trim()) {
        envMap[pair.key.trim()] = pair.value;
      }
    }

    return {
      name: name.trim(),
      command: mode === "command" ? command.trim() || undefined : undefined,
      url: mode === "url" ? url.trim() || undefined : undefined,
      args:
        mode === "command"
          ? args
              .trim()
              .split(/\s+/)
              .filter((a) => a)
          : [],
      env: envMap,
    };
  };

  const buildServerFromJson = (): McpServer | null => {
    if (!jsonText.trim()) {
      setError(t("errorPasteJson"));
      return null;
    }

    const result = parseJsonConfig(jsonText);
    if (typeof result === "string") {
      setError(t(result as any));
      return null;
    }

    const server = result.server;
    if (name.trim()) {
      server.name = name.trim();
    }
    if (!server.name) {
      setError(t("errorNameRequiredJson"));
      return null;
    }
    return server;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const server =
      mode === "json" ? buildServerFromJson() : buildServerFromForm();
    if (!server) return;

    if (!multiMode && selectedTools.size === 0) {
      setError(t("errorSelectTool"));
      return;
    }

    setSaving(true);
    try {
      if (isEdit && editingServer) {
        // Remove old server from all tools that had it
        for (const oldTool of editingServer.tools) {
          await removeServer(oldTool, editingServer.name);
        }
        // Remove old from registry, add updated
        await registryRemove(editingServer.name);
        await registryAdd(server);
        // Add updated server to all selected tools
        for (const tl of selectedTools) {
          await addServer(tl, server);
        }
      } else {
        if (multiMode) {
          await registryAdd(server);
        }
        for (const tl of selectedTools) {
          await addServer(tl, server);
        }
      }
      onSaved();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const title = isEdit
    ? t("editMcpServer")
    : tool
      ? t("addServerTo", { tool: TOOL_LABELS[tool] })
      : t("addMcpServer");

  const modes: { key: InputMode; labelKey: "command" | "url" | "json"; icon: typeof Terminal }[] = [
    { key: "command", labelKey: "command", icon: Terminal },
    { key: "url", labelKey: "url", icon: Globe },
    { key: "json", labelKey: "json", icon: FileJson },
  ];

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-50 animate-fade-in"
    >
      <div className="bg-bg-secondary border border-white/[0.08] rounded-xl w-full max-w-md mx-4 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] animate-modal-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-[15px]">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto"
        >
          {error && (
            <div className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Mode selector */}
          <div className="flex gap-1 p-1 bg-bg-primary/80 rounded-lg border border-border/50">
            {modes.map(({ key, labelKey, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setMode(key);
                  setError("");
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all duration-200 ${
                  mode === key
                    ? "bg-accent/15 text-accent border border-accent/30 shadow-[0_0_8px_rgba(94,106,210,0.1)]"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-hover border border-transparent"
                }`}
              >
                <Icon size={13} />
                {t(labelKey)}
              </button>
            ))}
          </div>

          {/* Name field */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              {t("name")}
              {mode === "json" && (
                <span className="text-text-secondary/50 font-normal ml-1">
                  {t("nameAutoDetected")}
                </span>
              )}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/60 focus:shadow-[0_0_0_3px_rgba(94,106,210,0.1)] transition-all duration-200"
              placeholder={
                mode === "json" ? t("nameJsonPlaceholder") : t("namePlaceholder")
              }
            />
          </div>

          {/* Command mode */}
          {mode === "command" && (
            <>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  {t("command")}
                </label>
                <input
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/60 focus:shadow-[0_0_0_3px_rgba(94,106,210,0.1)] transition-all duration-200"
                  placeholder="npx"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  {t("arguments")}
                  <span className="text-text-secondary/50 font-normal ml-1">
                    {t("argumentsHint")}
                  </span>
                </label>
                <input
                  value={args}
                  onChange={(e) => setArgs(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm font-mono placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/60 focus:shadow-[0_0_0_3px_rgba(94,106,210,0.1)] transition-all duration-200"
                  placeholder="-y @modelcontextprotocol/server-filesystem"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  {t("environment")}
                </label>
                <div className="space-y-2">
                  {envPairs.map((pair, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        value={pair.key}
                        onChange={(e) => {
                          const next = [...envPairs];
                          next[i] = { ...pair, key: e.target.value };
                          setEnvPairs(next);
                        }}
                        className="w-[38%] bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm font-mono placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/60 focus:shadow-[0_0_0_3px_rgba(94,106,210,0.1)] transition-all duration-200"
                        placeholder={t("envKey")}
                      />
                      <span className="text-text-secondary/30 text-xs">=</span>
                      <input
                        value={pair.value}
                        onChange={(e) => {
                          const next = [...envPairs];
                          next[i] = { ...pair, value: e.target.value };
                          setEnvPairs(next);
                        }}
                        className="flex-1 bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm font-mono placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/60 focus:shadow-[0_0_0_3px_rgba(94,106,210,0.1)] transition-all duration-200"
                        placeholder={t("envValue")}
                      />
                      <button
                        type="button"
                        onClick={() => setEnvPairs(envPairs.filter((_, j) => j !== i))}
                        className="p-1.5 rounded-lg hover:bg-danger/15 text-text-secondary/40 hover:text-danger transition-all duration-200 shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setEnvPairs([...envPairs, { key: "", value: "" }])}
                    className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent transition-colors duration-200 py-1"
                  >
                    <Plus size={13} />
                    {t("addEnvVar")}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* URL mode */}
          {mode === "url" && (
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                {t("url")}
              </label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm font-mono placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/60 focus:shadow-[0_0_0_3px_rgba(94,106,210,0.1)] transition-all duration-200"
                placeholder="http://localhost:3000/sse"
              />
            </div>
          )}

          {/* JSON mode */}
          {mode === "json" && (
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                {t("jsonConfiguration")}
              </label>
              <JsonEditor
                value={jsonText}
                onChange={setJsonText}
                rows={8}
                placeholder={`{
  "command": "npx",
  "args": ["-y", "some-mcp-server"],
  "env": {
    "API_KEY": "xxx"
  }
}`}
              />
            </div>
          )}

          {multiMode && (
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">
                {t("addToTools")}
              </label>
              <div className="flex flex-wrap gap-2">
                {installedTools
                  .filter((c) => c.installed)
                  .map((c) => {
                    const active = selectedTools.has(c.tool);
                    return (
                      <button
                        key={c.tool}
                        type="button"
                        onClick={() => toggleTool(c.tool)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                          active
                            ? "border-accent/40 bg-accent/15 text-accent"
                            : "border-border text-text-secondary hover:bg-bg-hover hover:border-border"
                        }`}
                      >
                        {TOOL_LABELS[c.tool]}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-bg-hover active:scale-[0.98] transition-all duration-200"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-accent text-white hover:bg-accent-hover active:scale-[0.97] transition-all duration-200 disabled:opacity-50 shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_2px_8px_rgba(94,106,210,0.25)]"
            >
              {saving
                ? (isEdit ? t("saving") : t("adding"))
                : (isEdit ? t("save") : t("addServer"))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
