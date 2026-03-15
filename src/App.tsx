import { useState, useEffect, useCallback } from "react";
import { Layout } from "./components/Layout";
import { ToolList } from "./components/ToolList";
import { ServerList } from "./components/ServerList";
import { SkillList } from "./components/SkillList";
import { SyncPanel } from "./components/SyncPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { detectTools, listAllSkills, ToolConfig, ToolSkillConfig } from "./hooks/useTauri";
import { useI18n } from "./i18n";

export type View = "tools" | "servers" | "skills" | "sync" | "settings";

export default function App() {
  const [view, setView] = useState<View>("tools");
  const [tools, setTools] = useState<ToolConfig[]>([]);
  const [skillConfigs, setSkillConfigs] = useState<ToolSkillConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshSkills = useCallback(async () => {
    try {
      const result = await listAllSkills();
      setSkillConfigs(result);
    } catch {
      setSkillConfigs([]);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const result = await detectTools();
      setTools(result);
    } catch {
      // Running outside Tauri (dev mode) - use mock data
      setTools([]);
    }
    await refreshSkills();
    setLoading(false);
  }, [refreshSkills]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const t = useI18n();
  const installedTools = tools.filter((t) => t.installed);
  const totalServers = new Set(tools.flatMap((t) => t.servers.map((s) => s.name))).size;
  const totalSkills = new Set(skillConfigs.flatMap((c) => c.skills.map((s) => s.name))).size;

  return (
    <Layout
      view={view}
      onViewChange={setView}
      toolCount={installedTools.length}
      serverCount={totalServers}
      skillCount={totalSkills}
    >
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            {t("loading")}
          </div>
        </div>
      ) : (
        <>
          {view === "tools" && <ToolList tools={tools} onRefresh={refresh} />}
          {view === "servers" && (
            <ServerList tools={tools} onRefresh={refresh} />
          )}
          {view === "skills" && (
            <SkillList skillConfigs={skillConfigs} onRefresh={refreshSkills} />
          )}
          {view === "sync" && <SyncPanel tools={tools} onRefresh={refresh} />}
          {view === "settings" && <SettingsPanel />}
        </>
      )}
    </Layout>
  );
}
