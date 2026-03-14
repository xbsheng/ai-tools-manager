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
