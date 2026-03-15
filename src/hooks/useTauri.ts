import { invoke } from "@tauri-apps/api/core";

export interface McpServer {
  name: string;
  url?: string;
  command?: string;
  args: string[];
  env: Record<string, string>;
}

export type AiTool =
  | "claude-code"
  | "cursor"
  | "windsurf"
  | "vscode-copilot";

export interface ToolConfig {
  tool: AiTool;
  config_path: string;
  servers: McpServer[];
  installed: boolean;
}

export interface SyncResult {
  added: string[];
  skipped: string[];
  conflicts: string[];
}

export const TOOL_LABELS: Record<AiTool, string> = {
  "claude-code": "Claude Code",
  cursor: "Cursor",
  windsurf: "Windsurf",
  "vscode-copilot": "VS Code Copilot",
};

export async function detectTools(): Promise<ToolConfig[]> {
  return invoke("detect_tools");
}

export async function getServers(tool: AiTool): Promise<McpServer[]> {
  return invoke("get_servers", { tool });
}

export async function getAllServers(): Promise<Record<AiTool, McpServer[]>> {
  return invoke("get_all_servers");
}

export async function addServer(
  tool: AiTool,
  server: McpServer,
): Promise<void> {
  return invoke("add_server", { tool, server });
}

export async function removeServer(
  tool: AiTool,
  name: string,
): Promise<void> {
  return invoke("remove_server", { tool, name });
}

export async function syncServers(
  from: AiTool,
  to: AiTool[],
  names?: string[],
): Promise<SyncResult> {
  return invoke("sync_servers", { from, to, names });
}

// --- Registry (local favorites) ---

export async function registryList(): Promise<McpServer[]> {
  return invoke("registry_list");
}

export async function registryAdd(server: McpServer): Promise<void> {
  return invoke("registry_add", { server });
}

export async function registryRemove(name: string): Promise<void> {
  return invoke("registry_remove", { name });
}

// --- Skills ---

export interface SkillArg {
  name: string;
  description: string;
  required: boolean;
}

export interface Skill {
  name: string;
  description: string;
  user_invokable: boolean;
  license?: string;
  args: SkillArg[];
  content: string;
  has_supporting_files: boolean;
}

export interface ToolSkillConfig {
  tool: AiTool;
  skills_dir: string;
  skills: Skill[];
}

export const SKILL_TOOLS: AiTool[] = ["claude-code", "cursor"];

export async function listAllSkills(): Promise<ToolSkillConfig[]> {
  return invoke("list_all_skills");
}

export async function removeSkill(tool: AiTool, name: string): Promise<void> {
  return invoke("remove_skill", { tool, name });
}

export async function copySkill(
  from: AiTool,
  to: AiTool,
  name: string,
): Promise<void> {
  return invoke("copy_skill", { from, to, name });
}

export async function revealSkillPath(
  tool: AiTool,
  name: string,
): Promise<void> {
  return invoke("reveal_skill_path", { tool, name });
}

export async function revealPath(path: string): Promise<void> {
  return invoke("reveal_path", { path });
}

export async function openFile(path: string): Promise<void> {
  return invoke("open_file", { path });
}
