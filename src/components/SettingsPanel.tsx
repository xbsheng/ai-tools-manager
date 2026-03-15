import { Info, Terminal, Sun, Moon, Keyboard } from "lucide-react";
import { useI18n } from "../i18n";
import { useSettings } from "../hooks/useSettings";

const CONFIG_PATHS = [
  { tool: "Claude Code", path: "~/.claude/settings.json" },
  { tool: "Cursor", path: "~/.cursor/mcp.json" },
  { tool: "Windsurf", path: "~/.codeium/windsurf/mcp_config.json" },
  { tool: "VS Code Copilot", path: "~/.vscode/mcp.json" },
];

const CLI_COMMANDS = [
  "atm detect",
  "atm list",
  "atm add my-server --command npx --args -y @mcp/server --to claude-code,cursor",
  "atm sync --all --from claude-code --to cursor,windsurf",
];

export function SettingsPanel() {
  const t = useI18n();
  const { language, setLanguage, theme, setTheme } = useSettings();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">{t("settings")}</h2>

      <div className="space-y-4">
        {/* Language & Theme */}
        <div className="bg-bg-card border border-border rounded-xl p-5 space-y-4">
          {/* Language */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("language")}</span>
            <div className="flex gap-1 p-0.5 bg-bg-primary/80 rounded-lg border border-border/50">
              <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1 text-xs rounded-md transition-all duration-200 ${
                  language === "en"
                    ? "bg-accent/15 text-accent border border-accent/30 shadow-[0_0_8px_rgba(94,106,210,0.1)]"
                    : "text-text-secondary hover:text-text-primary border border-transparent"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("zh")}
                className={`px-3 py-1 text-xs rounded-md transition-all duration-200 ${
                  language === "zh"
                    ? "bg-accent/15 text-accent border border-accent/30 shadow-[0_0_8px_rgba(94,106,210,0.1)]"
                    : "text-text-secondary hover:text-text-primary border border-transparent"
                }`}
              >
                中文
              </button>
            </div>
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("theme")}</span>
            <div className="flex gap-1 p-0.5 bg-bg-primary/80 rounded-lg border border-border/50">
              <button
                onClick={() => setTheme("dark")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md transition-all duration-200 ${
                  theme === "dark"
                    ? "bg-accent/15 text-accent border border-accent/30 shadow-[0_0_8px_rgba(94,106,210,0.1)]"
                    : "text-text-secondary hover:text-text-primary border border-transparent"
                }`}
              >
                <Moon size={12} />
                {t("themeDark")}
              </button>
              <button
                onClick={() => setTheme("light")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md transition-all duration-200 ${
                  theme === "light"
                    ? "bg-accent/15 text-accent border border-accent/30 shadow-[0_0_8px_rgba(94,106,210,0.1)]"
                    : "text-text-secondary hover:text-text-primary border border-transparent"
                }`}
              >
                <Sun size={12} />
                {t("themeLight")}
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-accent/10 mt-0.5 shrink-0">
              <Info size={14} className="text-accent" />
            </div>
            <div className="text-sm text-text-secondary leading-relaxed">
              <p>{t("aboutDescription")}</p>
              <p className="mt-2 text-text-secondary/70">
                {t("supportedTools")}
              </p>
            </div>
          </div>
        </div>

        {/* Config Paths */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">
            {t("configPaths")}
          </h3>
          <div className="space-y-1.5">
            {CONFIG_PATHS.map((item) => (
              <div
                key={item.tool}
                className="flex items-center justify-between bg-bg-primary/80 rounded-lg px-3 py-2.5"
              >
                <span className="text-sm">{item.tool}</span>
                <code className="text-xs text-text-secondary/70 font-mono">
                  {item.path}
                </code>
              </div>
            ))}
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Keyboard size={13} className="text-text-secondary" />
            <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              {t("keyboardShortcuts")}
            </h3>
          </div>
          <div className="space-y-1.5">
            {([
              ["⌘ R", t("shortcutRefresh")],
              ["⌘ N", t("shortcutNewServer")],
              ["⌘ ,", t("shortcutSettings")],
              ["⌘ /", t("shortcutSearch")],
              ["⌘ 1", t("shortcutNavTools")],
              ["⌘ 2", t("shortcutNavServers")],
              ["⌘ 3", t("shortcutNavSkills")],
              ["⌘ 4", t("shortcutNavSync")],
            ] as const).map(([key, desc]) => (
              <div
                key={key}
                className="flex items-center justify-between bg-bg-primary/80 rounded-lg px-3 py-2"
              >
                <span className="text-sm text-text-secondary">{desc}</span>
                <kbd className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-bg-hover border border-border text-text-secondary/80">
                  {key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* CLI Usage */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Terminal size={13} className="text-text-secondary" />
            <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              {t("cliUsage")}
            </h3>
          </div>
          <div className="bg-bg-primary/80 rounded-lg p-4 space-y-1.5 border border-border/50">
            {CLI_COMMANDS.map((cmd, i) => (
              <div key={i} className="text-xs font-mono text-text-secondary leading-relaxed">
                <span className="text-accent/60 select-none">$ </span>
                <span className="text-text-primary/80">{cmd}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
