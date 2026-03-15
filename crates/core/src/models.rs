use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fmt;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct McpServer {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub command: Option<String>,
    #[serde(default)]
    pub args: Vec<String>,
    #[serde(default)]
    pub env: HashMap<String, String>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "kebab-case")]
pub enum AiTool {
    ClaudeCode,
    Cursor,
    Windsurf,
    VsCodeCopilot,
}

impl AiTool {
    pub fn all() -> &'static [AiTool] {
        &[
            AiTool::ClaudeCode,
            AiTool::Cursor,
            AiTool::Windsurf,
            AiTool::VsCodeCopilot,
        ]
    }
}

impl fmt::Display for AiTool {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AiTool::ClaudeCode => write!(f, "Claude Code"),
            AiTool::Cursor => write!(f, "Cursor"),
            AiTool::Windsurf => write!(f, "Windsurf"),
            AiTool::VsCodeCopilot => write!(f, "VS Code Copilot"),
        }
    }
}

impl std::str::FromStr for AiTool {
    type Err = anyhow::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().replace(' ', "-").as_str() {
            "claude-code" | "claudecode" => Ok(AiTool::ClaudeCode),
            "cursor" => Ok(AiTool::Cursor),
            "windsurf" => Ok(AiTool::Windsurf),
            "vscode-copilot" | "vscodecopilot" | "vs-code-copilot" => Ok(AiTool::VsCodeCopilot),
            _ => Err(anyhow::anyhow!("Unknown AI tool: {}", s)),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolConfig {
    pub tool: AiTool,
    pub config_path: PathBuf,
    pub servers: Vec<McpServer>,
    pub installed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncResult {
    pub added: Vec<String>,
    pub skipped: Vec<String>,
    pub conflicts: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillArg {
    pub name: String,
    #[serde(default)]
    pub description: String,
    #[serde(default)]
    pub required: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Skill {
    pub name: String,
    #[serde(default)]
    pub description: String,
    #[serde(default, rename = "user-invokable")]
    pub user_invokable: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub license: Option<String>,
    #[serde(default)]
    pub args: Vec<SkillArg>,
    #[serde(default)]
    pub content: String,
    #[serde(default)]
    pub has_supporting_files: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolSkillConfig {
    pub tool: AiTool,
    pub skills_dir: PathBuf,
    pub skills: Vec<Skill>,
}
