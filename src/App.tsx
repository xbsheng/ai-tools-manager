import { useState, useEffect, useCallback } from "react";
import { Layout } from "./components/Layout";
import { ToolList } from "./components/ToolList";
import { ServerList } from "./components/ServerList";
import { SyncPanel } from "./components/SyncPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { detectTools, ToolConfig } from "./hooks/useTauri";

export type View = "tools" | "servers" | "sync" | "settings";

export default function App() {
  const [view, setView] = useState<View>("tools");
  const [tools, setTools] = useState<ToolConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const result = await detectTools();
      setTools(result);
    } catch {
      // Running outside Tauri (dev mode) - use mock data
      setTools([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const installedTools = tools.filter((t) => t.installed);
  const totalServers = tools.reduce((sum, t) => sum + t.servers.length, 0);

  return (
    <Layout
      view={view}
      onViewChange={setView}
      toolCount={installedTools.length}
      serverCount={totalServers}
    >
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            Loading...
          </div>
        </div>
      ) : (
        <>
          {view === "tools" && <ToolList tools={tools} onRefresh={refresh} />}
          {view === "servers" && (
            <ServerList tools={tools} onRefresh={refresh} />
          )}
          {view === "sync" && <SyncPanel tools={tools} onRefresh={refresh} />}
          {view === "settings" && <SettingsPanel />}
        </>
      )}
    </Layout>
  );
}
