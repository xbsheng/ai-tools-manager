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
      <Sidebar
        view={view}
        onViewChange={onViewChange}
        toolCount={toolCount}
        serverCount={serverCount}
      />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
