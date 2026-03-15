export const en = {
  // App
  loading: "Loading...",

  // Sidebar
  appName: "ATM",
  appDescription: "AI Tools Manager",
  statsTools: "Tools",
  statsServers: "MCP",

  // Navigation
  navTools: "Tools",
  navServers: "MCP",
  navSync: "Sync",
  navSettings: "Settings",

  // ToolList
  aiTools: "AI Tools",
  serverCount: "{count} MCP",
  serverCountPlural: "{count} MCP",
  noServersConfigured: "No MCP servers configured",
  addServer: "Add Server",

  // ServerList
  allServers: "All MCP Servers",
  noServersFound: "No MCP servers found",
  noServersHint: "Click \"Add Server\" to create your first MCP server",
  removeFrom: "Remove from {tool}",
  addTo: "Add to {tool}",
  deleteServer: "Delete server",
  copyAsJson: "Copy as JSON",
  copied: "Copied!",

  // SyncPanel
  syncTitle: "Sync MCP Servers",
  source: "Source",
  targets: "Targets",
  syncing: "Syncing...",
  syncAll: "Sync All Servers",
  syncResults: "Sync Results",
  added: "Added",
  skippedExists: "Skipped (already exists)",
  conflicts: "Conflicts",
  nothingToSync: "Nothing to sync",
  syncSuccess: "Sync completed successfully",
  syncFailed: "Sync failed: {error}",

  // SettingsPanel
  settings: "Settings",
  aboutDescription: "AI Tools Manager (ATM) helps you manage MCP server configurations across multiple AI coding tools.",
  supportedTools: "Supported: Claude Code, Cursor, Windsurf, VS Code Copilot",
  configPaths: "Config Paths",
  cliUsage: "CLI Usage",
  language: "Language",
  theme: "Theme",
  themeDark: "Dark",
  themeLight: "Light",

  // ServerForm
  addServerTo: "Add Server to {tool}",
  addMcpServer: "Add MCP Server",
  command: "Command",
  url: "URL",
  json: "JSON",
  name: "Name",
  nameAutoDetected: "(auto-detected from JSON key)",
  namePlaceholder: "my-server",
  nameJsonPlaceholder: "optional — extracted from JSON",
  arguments: "Arguments",
  argumentsHint: "(space-separated)",
  environment: "Environment",
  environmentHint: "(KEY=VALUE per line)",
  envKey: "KEY",
  envValue: "VALUE",
  addEnvVar: "Add variable",
  jsonConfiguration: "JSON Configuration",
  addToTools: "Add to tools",
  editMcpServer: "Edit MCP Server",
  cancel: "Cancel",
  adding: "Adding...",
  saving: "Saving...",
  save: "Save",

  // ServerForm errors
  errorNameRequired: "Name is required",
  errorCommandRequired: "Command is required",
  errorUrlRequired: "URL is required",
  errorPasteJson: "Paste JSON configuration",
  errorJsonCommandOrUrl: "JSON must contain a 'command' or 'url' field",
  errorInvalidJson: "Invalid JSON format",
  errorNameRequiredJson: "Name is required — provide it above or use keyed JSON format",
  errorSelectTool: "Select at least one tool",

  // Skills
  navSkills: "Skills",
  statsSkills: "Skills",
  allSkills: "All Skills",
  skillCount: "{count} skill",
  skillCountPlural: "{count} skills",
  noSkillsFound: "No skills found",
  noSkillsHint: "Add skills in ~/.claude/skills/ or ~/.cursor/skills/",
  deleteSkill: "Delete skill",
  copySkillContent: "Copy content",
  userInvokable: "User-invokable",
  revealInFinder: "Reveal in file browser",

  // Search
  searchServers: "Search servers...",
  searchSkills: "Search skills...",
  noSearchResults: "No results for \"{query}\"",

  // Confirm & Toast
  loadFailed: "Failed to load data",
  confirm: "Confirm",
  confirmDeleteServer: "Delete \"{name}\"? This will remove it from all tools.",
  confirmDeleteSkill: "Delete \"{name}\"? This will remove it from all tools.",
  deletedServer: "Deleted \"{name}\"",
  deletedSkill: "Deleted \"{name}\"",
  operationFailed: "Operation failed: {error}",

  // Keyboard Shortcuts
  keyboardShortcuts: "Keyboard Shortcuts",
  shortcutRefresh: "Refresh data",
  shortcutNewServer: "Add new server",
  shortcutSettings: "Open settings",
  shortcutSearch: "Focus search",
  shortcutNavTools: "Go to Tools",
  shortcutNavServers: "Go to MCP",
  shortcutNavSkills: "Go to Skills",
  shortcutNavSync: "Go to Sync",

  // Update Checker
  currentVersion: "Current version",
  checkForUpdates: "Check for updates",
  checkingForUpdates: "Checking...",
  upToDate: "Up to date",
  newVersionAvailable: "v{version} available",
  downloadUpdate: "Download",
  updateCheckFailed: "Check failed",

  // JsonEditor
  valid: "Valid",
  linesCount: "{count} lines",
  format: "Format",
  formatJson: "Format JSON",
} as const;

export type TranslationKey = keyof typeof en;
