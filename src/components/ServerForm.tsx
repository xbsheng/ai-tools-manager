import { useState } from "react";
import { X } from "lucide-react";
import { AiTool, TOOL_LABELS, McpServer, addServer } from "../hooks/useTauri";

interface ServerFormProps {
  tool: AiTool;
  onClose: () => void;
  onSaved: () => void;
}

export function ServerForm({ tool, onClose, onSaved }: ServerFormProps) {
  const [name, setName] = useState("");
  const [command, setCommand] = useState("");
  const [url, setUrl] = useState("");
  const [args, setArgs] = useState("");
  const [env, setEnv] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!command.trim() && !url.trim()) {
      setError("Either command or URL is required");
      return;
    }

    const envMap: Record<string, string> = {};
    if (env.trim()) {
      for (const line of env.split("\n")) {
        const idx = line.indexOf("=");
        if (idx > 0) {
          envMap[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
        }
      }
    }

    const server: McpServer = {
      name: name.trim(),
      command: command.trim() || undefined,
      url: url.trim() || undefined,
      args: args
        .trim()
        .split(/\s+/)
        .filter((a) => a),
      env: envMap,
    };

    setSaving(true);
    try {
      await addServer(tool, server);
      onSaved();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg-secondary border border-border rounded-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">
            Add Server to {TOOL_LABELS[tool]}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-bg-hover transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="text-sm text-danger bg-danger/10 rounded-lg p-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              placeholder="my-server"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Command
            </label>
            <input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              placeholder="npx"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">
              URL (alternative to command)
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              placeholder="http://localhost:3000/sse"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Arguments (space-separated)
            </label>
            <input
              value={args}
              onChange={(e) => setArgs(e.target.value)}
              className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              placeholder="-y @modelcontextprotocol/server-filesystem"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Environment (KEY=VALUE, one per line)
            </label>
            <textarea
              value={env}
              onChange={(e) => setEnv(e.target.value)}
              className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent resize-none"
              rows={3}
              placeholder={"API_KEY=xxx\nDEBUG=true"}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-bg-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add Server"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
