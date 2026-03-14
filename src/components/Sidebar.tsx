import {
  Wrench,
  Server,
  RefreshCw,
  Settings,
  LayoutDashboard,
} from "lucide-react";
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
  return (
    <aside className="w-60 bg-bg-secondary border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <LayoutDashboard size={20} className="text-accent" />
          <h1 className="font-semibold text-lg">ATM</h1>
        </div>
        <p className="text-xs text-text-secondary mt-1">AI Tools Manager</p>
      </div>

      <div className="p-3 border-b border-border">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-bg-card rounded-lg p-2">
            <div className="text-lg font-bold text-accent">{toolCount}</div>
            <div className="text-xs text-text-secondary">Tools</div>
          </div>
          <div className="bg-bg-card rounded-lg p-2">
            <div className="text-lg font-bold text-accent">{serverCount}</div>
            <div className="text-xs text-text-secondary">Servers</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-accent/15 text-accent"
                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <p className="text-xs text-text-secondary text-center">v0.1.0</p>
      </div>
    </aside>
  );
}
