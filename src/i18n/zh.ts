import type { TranslationKey } from "./en";

export const zh: Record<TranslationKey, string> = {
  // App
  loading: "加载中...",

  // Sidebar
  appName: "ATM",
  appDescription: "AI 工具管理器",
  statsTools: "工具",
  statsServers: "MCP",

  // Navigation
  navTools: "工具",
  navServers: "MCP",
  navSync: "同步",
  navSettings: "设置",

  // ToolList
  aiTools: "AI 工具",
  serverCount: "{count} MCP",
  serverCountPlural: "{count} MCP",
  noServersConfigured: "未配置 MCP 服务器",
  addServer: "添加服务器",

  // ServerList
  allServers: "所有 MCP 服务器",
  noServersFound: "未找到 MCP 服务器",
  noServersHint: "点击「添加服务器」创建你的第一个 MCP 服务器",
  removeFrom: "从 {tool} 移除",
  addTo: "添加到 {tool}",
  deleteServer: "删除服务器",
  copyAsJson: "复制为 JSON",
  copied: "已复制!",

  // SyncPanel
  syncTitle: "同步 MCP 服务器",
  source: "来源",
  targets: "目标",
  syncing: "同步中...",
  syncAll: "同步全部服务器",
  syncResults: "同步结果",
  added: "已添加",
  skippedExists: "已跳过（已存在）",
  conflicts: "冲突",
  nothingToSync: "无需同步",
  syncSuccess: "同步完成",
  syncFailed: "同步失败：{error}",

  // SettingsPanel
  settings: "设置",
  aboutDescription: "AI 工具管理器（ATM）帮助你管理多个 AI 编码工具的 MCP 服务器配置。",
  supportedTools: "支持：Claude Code、Cursor、Windsurf、VS Code Copilot",
  configPaths: "配置路径",
  cliUsage: "CLI 用法",
  language: "语言",
  theme: "主题",
  themeDark: "深色",
  themeLight: "浅色",

  // ServerForm
  addServerTo: "添加服务器到 {tool}",
  addMcpServer: "添加 MCP 服务器",
  command: "命令",
  url: "URL",
  json: "JSON",
  name: "名称",
  nameAutoDetected: "（从 JSON 键自动检测）",
  namePlaceholder: "my-server",
  nameJsonPlaceholder: "可选 - 从 JSON 提取",
  arguments: "参数",
  argumentsHint: "（空格分隔）",
  environment: "环境变量",
  environmentHint: "（每行 KEY=VALUE）",
  envKey: "KEY",
  envValue: "VALUE",
  addEnvVar: "添加变量",
  jsonConfiguration: "JSON 配置",
  addToTools: "添加到工具",
  editMcpServer: "编辑 MCP 服务器",
  cancel: "取消",
  adding: "添加中...",
  saving: "保存中...",
  save: "保存",

  // ServerForm errors
  errorNameRequired: "名称为必填项",
  errorCommandRequired: "命令为必填项",
  errorUrlRequired: "URL 为必填项",
  errorPasteJson: "请粘贴 JSON 配置",
  errorJsonCommandOrUrl: "JSON 必须包含 'command' 或 'url' 字段",
  errorInvalidJson: "JSON 格式无效",
  errorNameRequiredJson: "名称为必填项 - 请在上方输入或使用带键名的 JSON 格式",
  errorSelectTool: "请至少选择一个工具",

  // Skills
  navSkills: "技能",
  statsSkills: "技能",
  allSkills: "所有技能",
  skillCount: "{count} 个技能",
  skillCountPlural: "{count} 个技能",
  noSkillsFound: "未找到技能",
  noSkillsHint: "在 ~/.claude/skills/ 或 ~/.cursor/skills/ 中添加技能",
  deleteSkill: "删除技能",
  copySkillContent: "复制内容",
  userInvokable: "用户可调用",
  revealInFinder: "在文件浏览器中打开",

  // Search
  searchServers: "搜索服务器...",
  searchSkills: "搜索技能...",
  noSearchResults: "未找到「{query}」的结果",

  // Confirm & Toast
  loadFailed: "加载数据失败",
  confirm: "确认",
  confirmDeleteServer: "删除「{name}」？将从所有工具中移除。",
  confirmDeleteSkill: "删除「{name}」？将从所有工具中移除。",
  deletedServer: "已删除「{name}」",
  deletedSkill: "已删除「{name}」",
  operationFailed: "操作失败：{error}",

  // JsonEditor
  valid: "有效",
  linesCount: "{count} 行",
  format: "格式化",
  formatJson: "格式化 JSON",
};
