import { useState, useEffect, useCallback } from "react";
import {
  ChevronRight,
  CheckCircle,
  XCircle,
  Server,
  Plus,
  Trash2,
  FolderOpen,
  FileText,
  Undo2,
} from "lucide-react";
import {
  ToolConfig,
  TOOL_LABELS,
  removeServer,
  revealPath,
  openFile,
  hasBackup,
  restoreBackup,
  AiTool,
} from "../hooks/useTauri";
import { ServerForm } from "./ServerForm";
import { ConfirmDialog } from "./ConfirmDialog";
import { ToastData } from "./Toast";
import { useI18n } from "../i18n";

interface ToolListProps {
  tools: ToolConfig[];
  onRefresh: () => void;
  showToast: (type: ToastData["type"], message: string) => void;
}

export function ToolList({ tools, onRefresh, showToast }: ToolListProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [addingTo, setAddingTo] = useState<AiTool | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    tool: AiTool;
    name: string;
  } | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<AiTool | null>(null);
  const [backupMap, setBackupMap] = useState<Record<string, boolean>>({});
  const t = useI18n();

  const refreshBackups = useCallback(() => {
    for (const config of tools) {
      hasBackup(config.tool).then((has) =>
        setBackupMap((prev) => ({ ...prev, [config.tool]: has })),
      );
    }
  }, [tools]);

  useEffect(() => {
    refreshBackups();
  }, [refreshBackups]);

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
      showToast("success", t("deletedServer", { name }));
    } catch (e) {
      showToast("error", t("operationFailed", { error: String(e) }));
    }
  };

  const handleRestore = async (tool: AiTool) => {
    try {
      await restoreBackup(tool);
      onRefresh();
      refreshBackups();
      showToast("success", t("restoreSuccess"));
    } catch (e) {
      showToast("error", t("operationFailed", { error: String(e) }));
    }
  };

  const serverCountText = (count: number) =>
    count !== 1
      ? t("serverCountPlural", { count })
      : t("serverCount", { count });

  return (
    <div>
      <div className="sticky top-11 z-10 -mx-4 px-4 md:-mx-6 md:px-6 pt-1 pb-4 bg-bg-primary/80 backdrop-blur-xl">
        <h2 className="text-xl font-semibold">{t("aiTools")}</h2>
      </div>

      <div className="space-y-3">
        {tools.filter((config) => TOOL_LABELS[config.tool]).map((config) => {
          const isExpanded = expanded.has(config.tool);
          return (
            <div
              key={config.tool}
              className="bg-bg-card border border-border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_4px_24px_rgba(0,0,0,0.4),0_0_40px_rgba(77,120,204,0.04)]"
            >
              <button
                onClick={() => toggle(config.tool)}
                className="w-full flex items-center justify-between p-4 hover:bg-bg-hover/50 transition-colors"
                aria-expanded={isExpanded}
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
                  <div className="flex items-center gap-1 mb-3">
                    <div className="text-[11px] text-text-secondary/60 font-mono truncate">
                      {config.config_path}
                    </div>
                    <button
                      onClick={() => revealPath(config.config_path)}
                      className="p-1 rounded-md hover:bg-accent/15 text-text-secondary/40 hover:text-accent transition-all duration-200 shrink-0"
                      aria-label={t("revealInFinder")}
                      title={t("revealInFinder")}
                    >
                      <FolderOpen size={12} />
                    </button>
                    <button
                      onClick={() => openFile(config.config_path)}
                      className="p-1 rounded-md hover:bg-accent/15 text-text-secondary/40 hover:text-accent transition-all duration-200 shrink-0"
                      aria-label={t("openFile")}
                      title={t("openFile")}
                    >
                      <FileText size={12} />
                    </button>
                    {backupMap[config.tool] && (
                      <button
                        onClick={() => setConfirmRestore(config.tool)}
                        className="p-1 rounded-md hover:bg-accent/15 text-text-secondary/40 hover:text-accent transition-all duration-200 shrink-0"
                        aria-label={t("restoreBackup")}
                        title={t("restoreBackup")}
                      >
                        <Undo2 size={12} />
                      </button>
                    )}
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
                              setConfirmDelete({
                                tool: config.tool,
                                name: server.name,
                              })
                            }
                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-danger/15 text-text-secondary hover:text-danger transition-all duration-200 shrink-0 ml-2"
                            aria-label={t("deleteServer")}
                            title={t("deleteServer")}
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

      {confirmDelete && (
        <ConfirmDialog
          message={t("confirmDeleteServer", { name: confirmDelete.name })}
          onConfirm={() => {
            handleRemove(confirmDelete.tool, confirmDelete.name);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {confirmRestore && (
        <ConfirmDialog
          message={t("confirmRestore", {
            tool: TOOL_LABELS[confirmRestore],
          })}
          onConfirm={() => {
            handleRestore(confirmRestore);
            setConfirmRestore(null);
          }}
          onCancel={() => setConfirmRestore(null)}
        />
      )}
    </div>
  );
}
