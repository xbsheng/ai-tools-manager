import { useMemo, useState } from "react";
import {
  BookOpen,
  Trash2,
  Plus,
  Check,
  Edit2,
  Copy,
  CheckCheck,
  Lock,
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
  saveSkill,
} from "../hooks/useTauri";
import { SkillForm } from "./SkillForm";
import { useI18n } from "../i18n";

interface SkillListProps {
  skillConfigs: ToolSkillConfig[];
  onRefresh: () => void;
}

interface UnifiedSkill {
  name: string;
  description: string;
  user_invokable: boolean;
  license?: string;
  args: Skill["args"];
  content: string;
  has_supporting_files: boolean;
  tools: AiTool[];
}

export function SkillList({ skillConfigs, onRefresh }: SkillListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<UnifiedSkill | null>(null);
  const [copiedSkill, setCopiedSkill] = useState<string | null>(null);
  const t = useI18n();

  const unified = useMemo(() => {
    const map = new Map<string, UnifiedSkill>();

    for (const config of skillConfigs) {
      for (const skill of config.skills) {
        const existing = map.get(skill.name);
        if (existing) {
          existing.tools.push(config.tool);
          // Merge: prefer the version with more content
          if (skill.content.length > existing.content.length) {
            existing.description = skill.description;
            existing.user_invokable = skill.user_invokable;
            existing.license = skill.license;
            existing.args = skill.args;
            existing.content = skill.content;
          }
          if (skill.has_supporting_files) {
            existing.has_supporting_files = true;
          }
        } else {
          map.set(skill.name, {
            name: skill.name,
            description: skill.description,
            user_invokable: skill.user_invokable,
            license: skill.license,
            args: skill.args,
            content: skill.content,
            has_supporting_files: skill.has_supporting_files,
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
        // Find a source tool that has this skill, then copy
        const sourceTool = skill.tools[0];
        if (sourceTool) {
          await copySkill(sourceTool, tool, skill.name);
        } else {
          // No source — save directly
          const skillData: Skill = {
            name: skill.name,
            description: skill.description,
            user_invokable: skill.user_invokable,
            license: skill.license,
            args: skill.args,
            content: skill.content,
            has_supporting_files: false,
          };
          await saveSkill(tool, skillData);
        }
      }
      onRefresh();
    } catch (e) {
      console.error("Failed to toggle tool:", e);
    }
  };

  const handleEdit = (skill: UnifiedSkill) => {
    setEditingSkill(skill);
    setShowForm(true);
  };

  const handleCopy = async (skill: UnifiedSkill) => {
    const text = `# ${skill.name}\n\n${skill.description ? skill.description + "\n\n" : ""}${skill.content}`;
    await navigator.clipboard.writeText(text);
    setCopiedSkill(skill.name);
    setTimeout(() => setCopiedSkill(null), 2000);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingSkill(null);
  };

  const handleFormSaved = () => {
    setShowForm(false);
    setEditingSkill(null);
    onRefresh();
  };

  const skillCountText =
    unified.length !== 1
      ? t("skillCountPlural", { count: unified.length })
      : t("skillCount", { count: unified.length });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{t("allSkills")}</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-secondary">{skillCountText}</span>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-accent text-white hover:bg-accent-hover active:scale-[0.97] transition-all duration-200 shadow-[0_0_0_1px_rgba(99,102,241,0.5),0_2px_8px_rgba(99,102,241,0.25)]"
          >
            <Plus size={15} />
            {t("addSkill")}
          </button>
        </div>
      </div>

      {unified.length === 0 ? (
        <div className="text-center py-20 text-text-secondary">
          <div className="inline-flex p-4 rounded-2xl bg-bg-card/50 mb-4">
            <BookOpen size={40} className="opacity-40" />
          </div>
          <p className="font-medium text-text-primary/70">
            {t("noSkillsFound")}
          </p>
          <p className="text-sm mt-1">{t("noSkillsHint")}</p>
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
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{skill.name}</h3>
                    {skill.has_supporting_files && (
                      <span
                        className="text-text-secondary/50"
                        title={t("readOnlySkill")}
                      >
                        <Lock size={13} />
                      </span>
                    )}
                  </div>
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
                  {!skill.has_supporting_files && (
                    <button
                      onClick={() => handleEdit(skill)}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-accent/15 text-text-secondary hover:text-accent transition-all duration-200"
                      title={t("editSkill")}
                    >
                      <Edit2 size={15} />
                    </button>
                  )}
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

      {showForm && (
        <SkillForm
          editingSkill={editingSkill ?? undefined}
          onClose={handleFormClose}
          onSaved={handleFormSaved}
        />
      )}
    </div>
  );
}
