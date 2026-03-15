import { useMemo, useState } from "react";
import {
  BookOpen,
  Trash2,
  Check,
  Copy,
  CheckCheck,
  FolderOpen,
  Zap,
} from "lucide-react";
import {
  ToolSkillConfig,
  TOOL_LABELS,
  AiTool,
  Skill,
  SKILL_TOOLS,
  removeSkill,
  copySkill,
  revealSkillPath,
} from "../hooks/useTauri";
import { useI18n } from "../i18n";

interface SkillListProps {
  skillConfigs: ToolSkillConfig[];
  onRefresh: () => void;
}

interface UnifiedSkill {
  name: string;
  description: string;
  user_invokable: boolean;
  args: Skill["args"];
  content: string;
  tools: AiTool[];
}

export function SkillList({ skillConfigs, onRefresh }: SkillListProps) {
  const [copiedSkill, setCopiedSkill] = useState<string | null>(null);
  const t = useI18n();

  const unified = useMemo(() => {
    const map = new Map<string, UnifiedSkill>();

    for (const config of skillConfigs) {
      for (const skill of config.skills) {
        const existing = map.get(skill.name);
        if (existing) {
          existing.tools.push(config.tool);
          if (skill.content.length > existing.content.length) {
            existing.description = skill.description;
            existing.user_invokable = skill.user_invokable;
            existing.args = skill.args;
            existing.content = skill.content;
          }
        } else {
          map.set(skill.name, {
            name: skill.name,
            description: skill.description,
            user_invokable: skill.user_invokable,
            args: skill.args,
            content: skill.content,
            tools: [config.tool],
          });
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [skillConfigs]);

  const handleDelete = async (skill: UnifiedSkill) => {
    try {
      for (const tool of skill.tools) {
        await removeSkill(tool, skill.name);
      }
      onRefresh();
    } catch (e) {
      console.error("Failed to delete skill:", e);
    }
  };

  const handleToggleTool = async (skill: UnifiedSkill, tool: AiTool) => {
    try {
      if (skill.tools.includes(tool)) {
        await removeSkill(tool, skill.name);
      } else {
        const sourceTool = skill.tools[0];
        if (sourceTool) {
          await copySkill(sourceTool, tool, skill.name);
        }
      }
      onRefresh();
    } catch (e) {
      console.error("Failed to toggle tool:", e);
    }
  };

  const handleCopy = async (skill: UnifiedSkill) => {
    const text = `# ${skill.name}\n\n${skill.description ? skill.description + "\n\n" : ""}${skill.content}`;
    await navigator.clipboard.writeText(text);
    setCopiedSkill(skill.name);
    setTimeout(() => setCopiedSkill(null), 2000);
  };

  const handleReveal = async (skill: UnifiedSkill) => {
    try {
      await revealSkillPath(skill.tools[0], skill.name);
    } catch (e) {
      console.error("Failed to reveal skill:", e);
    }
  };

  const skillCountText =
    unified.length !== 1
      ? t("skillCountPlural", { count: unified.length })
      : t("skillCount", { count: unified.length });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{t("allSkills")}</h2>
        <span className="text-sm text-text-secondary">{skillCountText}</span>
      </div>

      {unified.length === 0 ? (
        <div className="text-center py-20 text-text-secondary">
          <div className="inline-flex p-4 rounded-2xl bg-bg-card/50 mb-4">
            <BookOpen size={40} className="opacity-40" />
          </div>
          <p className="font-medium text-text-primary/70">
            {t("noSkillsFound")}
          </p>
          <p className="text-sm mt-1 font-mono text-text-secondary/70">
            {t("noSkillsHint")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {unified.map((skill) => (
            <div
              key={skill.name}
              className="group bg-bg-card border border-border rounded-xl p-4 transition-all duration-200 hover:border-border hover:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_4px_24px_rgba(0,0,0,0.3)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{skill.name}</h3>
                  {skill.description && (
                    <p className="text-sm text-text-secondary mt-1 truncate">
                      {skill.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {skill.user_invokable && (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border border-accent/30 bg-accent/10 text-accent">
                        <Zap size={10} />
                        {t("userInvokable")}
                      </span>
                    )}
                    {skill.args.length > 0 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full border border-border text-text-secondary">
                        {skill.args.length} arg{skill.args.length !== 1 ? "s" : ""}
                      </span>
                    )}

                    {SKILL_TOOLS.map((tool) => {
                      const active = skill.tools.includes(tool);
                      return (
                        <button
                          key={tool}
                          onClick={() => handleToggleTool(skill, tool)}
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all duration-200 ${
                            active
                              ? "border-accent/40 bg-accent/15 text-accent"
                              : "border-border text-text-secondary hover:border-accent/30 hover:text-text-primary"
                          }`}
                        >
                          {active && <Check size={11} strokeWidth={3} />}
                          {TOOL_LABELS[tool]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-3 shrink-0">
                  <button
                    onClick={() => handleCopy(skill)}
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      copiedSkill === skill.name
                        ? "opacity-100 text-green-400"
                        : "opacity-0 group-hover:opacity-100 hover:bg-accent/15 text-text-secondary hover:text-accent"
                    }`}
                    title={
                      copiedSkill === skill.name
                        ? t("copied")
                        : t("copySkillContent")
                    }
                  >
                    {copiedSkill === skill.name ? (
                      <CheckCheck size={15} />
                    ) : (
                      <Copy size={15} />
                    )}
                  </button>
                  <button
                    onClick={() => handleReveal(skill)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-accent/15 text-text-secondary hover:text-accent transition-all duration-200"
                    title={t("revealInFinder")}
                  >
                    <FolderOpen size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(skill)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-danger/15 text-text-secondary hover:text-danger transition-all duration-200"
                    title={t("deleteSkill")}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
