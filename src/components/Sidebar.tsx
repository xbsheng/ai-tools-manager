import { useState, useEffect } from "react";
import {
  Wrench,
  Server,
  BookOpen,
  RefreshCw,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { getVersion } from "@tauri-apps/api/app";
import type { View } from "../App";
import { useI18n, type TranslationKey } from "../i18n";

interface SidebarProps {
  view: View;
  onViewChange: (view: View) => void;
  toolCount: number;
  serverCount: number;
  skillCount: number;
  hasUpdate?: boolean;
}

const NAV_ITEMS: { id: View; labelKey: TranslationKey; icon: typeof Wrench }[] = [
  { id: "tools", labelKey: "navTools", icon: Wrench },
  { id: "servers", labelKey: "navServers", icon: Server },
  { id: "skills", labelKey: "navSkills", icon: BookOpen },
  { id: "sync", labelKey: "navSync", icon: RefreshCw },
  { id: "settings", labelKey: "navSettings", icon: Settings },
];

export function Sidebar({
  view,
  onViewChange,
  toolCount,
  serverCount,
  skillCount,
  hasUpdate,
}: SidebarProps) {
  const [version, setVersion] = useState("");
  const t = useI18n();

  useEffect(() => {
    getVersion().then(setVersion).catch(() => setVersion("dev"));
  }, []);

  return (
    <aside className="relative w-60 bg-bg-secondary border-r border-border flex flex-col z-10">
      {/* macOS traffic light spacer + drag region */}
      <div
        className="h-11 shrink-0 border-b border-border"
        data-tauri-drag-region
      />
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-accent/15">
            <LayoutDashboard size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="font-semibold text-sm leading-none">{t("appName")}</h1>
            <p className="text-[11px] text-text-secondary mt-0.5">
              {t("appDescription")}
            </p>
          </div>
        </div>
      </div>

      <div className="p-3 border-b border-border">
        <div className="grid grid-cols-3 gap-2 text-center">
          <button
            onClick={() => onViewChange("tools")}
            className="bg-bg-card/80 rounded-lg p-2.5 border border-border/50 hover:bg-bg-hover/60 hover:border-accent/30 transition-all duration-200"
          >
            <div className="text-lg font-bold text-accent leading-none">
              {toolCount}
            </div>
            <div className="text-[11px] text-text-secondary mt-1">{t("statsTools")}</div>
          </button>
          <button
            onClick={() => onViewChange("servers")}
            className="bg-bg-card/80 rounded-lg p-2.5 border border-border/50 hover:bg-bg-hover/60 hover:border-accent/30 transition-all duration-200"
          >
            <div className="text-lg font-bold text-accent leading-none">
              {serverCount}
            </div>
            <div className="text-[11px] text-text-secondary mt-1">{t("statsServers")}</div>
          </button>
          <button
            onClick={() => onViewChange("skills")}
            className="bg-bg-card/80 rounded-lg p-2.5 border border-border/50 hover:bg-bg-hover/60 hover:border-accent/30 transition-all duration-200"
          >
            <div className="text-lg font-bold text-accent leading-none">
              {skillCount}
            </div>
            <div className="text-[11px] text-text-secondary mt-1">{t("statsSkills")}</div>
          </button>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                active
                  ? "bg-accent/12 text-accent shadow-[inset_3px_0_0_0_var(--color-accent)]"
                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary active:scale-[0.98]"
              }`}
            >
              <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
              <span className={active ? "font-medium" : ""}>{t(item.labelKey)}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={() => hasUpdate && onViewChange("settings")}
          className={`w-full flex items-center justify-center gap-1.5 text-[11px] text-text-secondary/60 ${
            hasUpdate ? "hover:text-text-secondary transition-colors" : "cursor-default"
          }`}
        >
          {hasUpdate && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          )}
          v{version}
        </button>
      </div>
    </aside>
  );
}
