import { useState, useEffect, useRef } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import {
  AiTool,
  TOOL_LABELS,
  Skill,
  SkillArg,
  SKILL_TOOLS,
  saveSkill,
  removeSkill,
} from "../hooks/useTauri";
import { useI18n } from "../i18n";

interface EditingSkill {
  name: string;
  description: string;
  user_invokable: boolean;
  license?: string;
  args: SkillArg[];
  content: string;
  tools: AiTool[];
}

interface SkillFormProps {
  editingSkill?: EditingSkill;
  onClose: () => void;
  onSaved: () => void;
}

export function SkillForm({ editingSkill, onClose, onSaved }: SkillFormProps) {
  const isEdit = !!editingSkill;

  const [name, setName] = useState(() => editingSkill?.name ?? "");
  const [description, setDescription] = useState(
    () => editingSkill?.description ?? "",
  );
  const [userInvokable, setUserInvokable] = useState(
    () => editingSkill?.user_invokable ?? false,
  );
  const [args, setArgs] = useState<SkillArg[]>(
    () => editingSkill?.args ?? [],
  );
  const [content, setContent] = useState(() => editingSkill?.content ?? "");
  const [selectedTools, setSelectedTools] = useState<Set<AiTool>>(() => {
    if (editingSkill) return new Set(editingSkill.tools);
    return new Set<AiTool>(SKILL_TOOLS);
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const backdropRef = useRef<HTMLDivElement>(null);
  const t = useI18n();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggleTool = (tool: AiTool) => {
    const next = new Set(selectedTools);
    if (next.has(tool)) next.delete(tool);
    else next.add(tool);
    setSelectedTools(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(t("errorSkillNameRequired"));
      return;
    }
    if (!/^[a-zA-Z0-9-]+$/.test(trimmedName)) {
      setError(t("errorSkillNameInvalid"));
      return;
    }
    if (!content.trim()) {
      setError(t("errorSkillContentRequired"));
      return;
    }
    if (selectedTools.size === 0) {
      setError(t("errorSelectTool"));
      return;
    }

    const skill: Skill = {
      name: trimmedName,
      description: description.trim(),
      user_invokable: userInvokable,
      license: undefined,
      args: args.filter((a) => a.name.trim()),
      content: content.trim(),
      has_supporting_files: false,
    };

    setSaving(true);
    try {
      if (isEdit && editingSkill) {
        // Remove from tools that were deselected
        for (const oldTool of editingSkill.tools) {
          if (!selectedTools.has(oldTool)) {
            await removeSkill(oldTool, editingSkill.name);
          }
        }
      }
      // Save to all selected tools
      for (const tool of selectedTools) {
        await saveSkill(tool, skill);
      }
      onSaved();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const addArg = () => {
    setArgs([...args, { name: "", description: "", required: false }]);
  };

  const updateArg = (index: number, field: keyof SkillArg, value: string | boolean) => {
    const next = [...args];
    next[index] = { ...next[index], [field]: value };
    setArgs(next);
  };

  const removeArg = (index: number) => {
    setArgs(args.filter((_, i) => i !== index));
  };

  const title = isEdit ? t("editSkill") : t("addNewSkill");

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-50 animate-fade-in"
    >
      <div className="bg-bg-secondary border border-white/[0.08] rounded-xl w-full max-w-md mx-4 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] animate-modal-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-[15px]">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto"
        >
          {error && (
            <div className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              {t("skillName")}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isEdit}
              className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all duration-200 disabled:opacity-50"
              placeholder={t("skillNamePlaceholder")}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              {t("skillDescription")}
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all duration-200"
              placeholder={t("skillDescriptionPlaceholder")}
            />
          </div>

          {/* User-invokable toggle */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-text-secondary">
                {t("skillUserInvokable")}
              </span>
              <p className="text-[11px] text-text-secondary/60 mt-0.5">
                {t("skillUserInvokableHint")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setUserInvokable(!userInvokable)}
              className={`relative w-9 h-5 rounded-full transition-all duration-200 ${
                userInvokable
                  ? "bg-accent shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                  : "bg-white/10"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                  userInvokable ? "translate-x-4" : ""
                }`}
              />
            </button>
          </div>

          {/* Arguments */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              {t("skillArguments")}
            </label>
            <div className="space-y-2">
              {args.map((arg, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={arg.name}
                    onChange={(e) => updateArg(i, "name", e.target.value)}
                    className="w-[30%] bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm font-mono placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all duration-200"
                    placeholder={t("argName")}
                  />
                  <input
                    value={arg.description}
                    onChange={(e) =>
                      updateArg(i, "description", e.target.value)
                    }
                    className="flex-1 bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all duration-200"
                    placeholder={t("argDescription")}
                  />
                  <label className="flex items-center gap-1 text-[11px] text-text-secondary shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={arg.required}
                      onChange={(e) =>
                        updateArg(i, "required", e.target.checked)
                      }
                      className="rounded border-border accent-accent"
                    />
                    {t("argRequired")}
                  </label>
                  <button
                    type="button"
                    onClick={() => removeArg(i)}
                    className="p-1.5 rounded-lg hover:bg-danger/15 text-text-secondary/40 hover:text-danger transition-all duration-200 shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addArg}
                className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent transition-colors duration-200 py-1"
              >
                <Plus size={13} />
                {t("addArgument")}
              </button>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              {t("skillContent")}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm font-mono placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all duration-200 resize-y"
              placeholder={t("skillContentPlaceholder")}
            />
          </div>

          {/* Tool toggles */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">
              {t("addToTools")}
            </label>
            <div className="flex flex-wrap gap-2">
              {SKILL_TOOLS.map((tool) => {
                const active = selectedTools.has(tool);
                return (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => toggleTool(tool)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                      active
                        ? "border-accent/40 bg-accent/15 text-accent"
                        : "border-border text-text-secondary hover:bg-bg-hover hover:border-border"
                    }`}
                  >
                    {TOOL_LABELS[tool]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-bg-hover active:scale-[0.98] transition-all duration-200"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-accent text-white hover:bg-accent-hover active:scale-[0.97] transition-all duration-200 disabled:opacity-50 shadow-[0_0_0_1px_rgba(99,102,241,0.5),0_2px_8px_rgba(99,102,241,0.25)]"
            >
              {saving
                ? t("saving")
                : isEdit
                  ? t("save")
                  : t("addSkill")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
