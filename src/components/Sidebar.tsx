import { useState, useEffect } from "react";
import {
  Wrench,
  Server,
  RefreshCw,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { getVersion } from "@tauri-apps/api/app";
import type { View } from "../App";

interface SidebarProps {
  view: View;
  onViewChange: (view: View) => void;
  toolCount: number;
  serverCount: number;
}

const NAV_ITEMS: { id: View; label: string; icon: typeof Wrench }[] = [
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "servers", label: "Servers", icon: Server },
  { id: "sync", label: "Sync", icon: RefreshCw },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  view,
  onViewChange,
  toolCount,
  serverCount,
}: SidebarProps) {
  const [version, setVersion] = useState("");

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
            <h1 className="font-semibold text-sm leading-none">ATM</h1>
            <p className="text-[11px] text-text-secondary mt-0.5">
              AI Tools Manager
            </p>
          </div>
        </div>
      </div>

      <div className="p-3 border-b border-border">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-bg-card/80 rounded-lg p-2.5 border border-border/50">
            <div className="text-lg font-bold text-accent leading-none">
              {toolCount}
            </div>
            <div className="text-[11px] text-text-secondary mt-1">Tools</div>
          </div>
          <div className="bg-bg-card/80 rounded-lg p-2.5 border border-border/50">
            <div className="text-lg font-bold text-accent leading-none">
              {serverCount}
            </div>
            <div className="text-[11px] text-text-secondary mt-1">Servers</div>
          </div>
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
              <span className={active ? "font-medium" : ""}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <p className="text-[11px] text-text-secondary/60 text-center">
          v{version}
        </p>
      </div>
    </aside>
  );
}
