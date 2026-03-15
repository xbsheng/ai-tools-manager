import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import type { View } from "../App";

interface LayoutProps {
  children: ReactNode;
  view: View;
  onViewChange: (view: View) => void;
  toolCount: number;
  serverCount: number;
}

export function Layout({
  children,
  view,
  onViewChange,
  toolCount,
  serverCount,
}: LayoutProps) {
  return (
    <div className="flex h-screen bg-bg-primary text-text-primary">
      {/* Ambient background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-accent/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-accent/[0.02] rounded-full blur-[100px]" />
      </div>

      <Sidebar
        view={view}
        onViewChange={onViewChange}
        toolCount={toolCount}
        serverCount={serverCount}
      />
      <main className="relative flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
