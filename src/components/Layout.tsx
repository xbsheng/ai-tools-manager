import { ReactNode } from "react";
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
}

export function Layout({
  children,
  view,
  onViewChange,
  toolCount,
  serverCount,
  skillCount,
}: LayoutProps) {
  const { theme } = useSettings();
  const isLight = theme === "light";

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

      <Sidebar
        view={view}
        onViewChange={onViewChange}
        toolCount={toolCount}
        serverCount={serverCount}
        skillCount={skillCount}
      />
      <main className="relative flex-1 overflow-auto">
        {/* Drag region for title bar area */}
        <div className="sticky top-0 h-11 shrink-0 z-10" data-tauri-drag-region />
        <div className="px-6 pb-6">{children}</div>
      </main>
    </div>
  );
}
