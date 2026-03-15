import { ReactNode, useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import type { View } from "../App";
import { useSettings } from "../hooks/useSettings";

interface LayoutProps {
  children: ReactNode;
  view: View;
  onViewChange: (view: View) => void;
  toolCount: number;
  serverCount: number;
  skillCount: number;
  hasUpdate?: boolean;
}

export function Layout({
  children,
  view,
  onViewChange,
  toolCount,
  serverCount,
  skillCount,
  hasUpdate,
}: LayoutProps) {
  const { theme } = useSettings();
  const isLight = theme === "light";
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleViewChange = (v: View) => {
    onViewChange(v);
    setMobileOpen(false);
  };

  return (
    <div className="flex h-screen bg-bg-primary text-text-primary">
      {/* Ambient background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className={`absolute top-0 left-1/3 w-[600px] h-[400px] rounded-full blur-[120px] ${
            isLight ? "bg-accent/[0.06]" : "bg-accent/[0.03]"
          }`}
        />
        <div
          className={`absolute bottom-0 right-1/4 w-[500px] h-[300px] rounded-full blur-[100px] ${
            isLight ? "bg-accent/[0.04]" : "bg-accent/[0.02]"
          }`}
        />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          view={view}
          onViewChange={onViewChange}
          toolCount={toolCount}
          serverCount={serverCount}
          skillCount={skillCount}
          hasUpdate={hasUpdate}
        />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 md:hidden transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          view={view}
          onViewChange={handleViewChange}
          toolCount={toolCount}
          serverCount={serverCount}
          skillCount={skillCount}
          hasUpdate={hasUpdate}
        />
      </div>

      <main className="relative flex-1 overflow-auto">
        {/* Drag region for title bar area */}
        <div className="sticky top-0 h-11 shrink-0 z-20 flex items-center bg-bg-primary" data-tauri-drag-region>
          <button
            className="md:hidden ml-[74px] p-1.5 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        <div className="px-4 pb-6 md:px-6">{children}</div>
      </main>
    </div>
  );
}
