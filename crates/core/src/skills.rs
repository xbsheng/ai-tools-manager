use crate::models::{AiTool, Skill, SkillArg, ToolSkillConfig};
use anyhow::{bail, Context, Result};
use std::fs;
use std::path::PathBuf;

/// Returns the skills directory for a given tool.
/// Only ClaudeCode and Cursor support skills.
pub fn skills_dir(tool: AiTool) -> Result<PathBuf> {
    let home = dirs::home_dir().context("Cannot determine home directory")?;
    match tool {
        AiTool::ClaudeCode => Ok(home.join(".claude").join("skills")),
        AiTool::Cursor => Ok(home.join(".cursor").join("skills")),
        _ => bail!("{} does not support skills", tool),
    }
}

/// Tools that support skills.
pub fn skill_tools() -> &'static [AiTool] {
    &[AiTool::ClaudeCode, AiTool::Cursor]
}

/// List all skills for a single tool.
pub fn list_skills(tool: AiTool) -> Result<Vec<Skill>> {
    let dir = skills_dir(tool)?;
    if !dir.exists() {
        return Ok(Vec::new());
    }

    let mut skills = Vec::new();
    for entry in fs::read_dir(&dir)? {
        let entry = entry?;
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }
        let skill_file = path.join("SKILL.md");
        if !skill_file.exists() {
            continue;
        }
        let name = entry
            .file_name()
            .to_string_lossy()
            .to_string();
        let content = fs::read_to_string(&skill_file)?;
        let mut skill = parse_skill_file(&content)?;
        skill.name = name;
        skill.has_supporting_files = has_extra_files(&path);
        skills.push(skill);
    }

    skills.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(skills)
}

/// List skills for all supported tools.
pub fn list_all_skills() -> Vec<ToolSkillConfig> {
    let mut configs = Vec::new();
    for &tool in skill_tools() {
        let dir = skills_dir(tool).unwrap_or_default();
        let skills = list_skills(tool).unwrap_or_default();
        configs.push(ToolSkillConfig {
            tool,
            skills_dir: dir,
            skills,
        });
    }
    configs
}

/// Read a single skill by name from a tool.
pub fn get_skill(tool: AiTool, name: &str) -> Result<Skill> {
    let dir = skills_dir(tool)?;
    let skill_dir = dir.join(name);
    let skill_file = skill_dir.join("SKILL.md");
    if !skill_file.exists() {
        bail!("Skill '{}' not found for {}", name, tool);
    }
    let content = fs::read_to_string(&skill_file)?;
    let mut skill = parse_skill_file(&content)?;
    skill.name = name.to_string();
    skill.has_supporting_files = has_extra_files(&skill_dir);
    Ok(skill)
}

/// Save (create or update) a skill. Rejects if the skill directory has supporting files.
pub fn save_skill(tool: AiTool, skill: &Skill) -> Result<()> {
    let dir = skills_dir(tool)?;
    let skill_dir = dir.join(&skill.name);

    if skill_dir.exists() && has_extra_files(&skill_dir) {
        bail!(
            "Skill '{}' has supporting files and cannot be edited inline",
            skill.name
        );
    }

    fs::create_dir_all(&skill_dir)?;
    let content = serialize_skill_file(skill);
    fs::write(skill_dir.join("SKILL.md"), content)?;
    Ok(())
}

/// Remove a skill directory entirely.
pub fn remove_skill(tool: AiTool, name: &str) -> Result<()> {
    let dir = skills_dir(tool)?;
    let skill_dir = dir.join(name);
    if skill_dir.exists() {
        fs::remove_dir_all(&skill_dir)?;
    }
    Ok(())
}

/// Copy a skill directory recursively from one tool to another.
pub fn copy_skill(from: AiTool, to: AiTool, name: &str) -> Result<()> {
    let src = skills_dir(from)?.join(name);
    if !src.exists() {
        bail!("Skill '{}' not found for {}", name, from);
    }
    let dst = skills_dir(to)?.join(name);
    copy_dir_recursive(&src, &dst)?;
    Ok(())
}

// --- Internal helpers ---

/// Parse a SKILL.md file with YAML frontmatter and markdown body.
fn parse_skill_file(raw: &str) -> Result<Skill> {
    let trimmed = raw.trim();

    if !trimmed.starts_with("---") {
        // No frontmatter — treat entire content as body
        return Ok(Skill {
            name: String::new(),
            description: String::new(),
            user_invokable: false,
            license: None,
            args: Vec::new(),
            content: trimmed.to_string(),
            has_supporting_files: false,
        });
    }

    // Find the closing ---
    let after_first = &trimmed[3..];
    let end = after_first
        .find("\n---")
        .context("Malformed frontmatter: missing closing ---")?;
    let yaml_str = &after_first[..end];
    let body = after_first[end + 4..].trim().to_string();

    // Deserialize YAML frontmatter
    let fm: FrontMatter = serde_yaml::from_str(yaml_str)
        .context("Failed to parse YAML frontmatter")?;

    let args = fm
        .args
        .unwrap_or_default()
        .into_iter()
        .map(|a| SkillArg {
            name: a.name,
            description: a.description.unwrap_or_default(),
            required: a.required.unwrap_or(false),
        })
        .collect();

    Ok(Skill {
        name: String::new(),
        description: fm.description.unwrap_or_default(),
        user_invokable: fm.user_invokable.unwrap_or(false),
        license: fm.license,
        args,
        content: body,
        has_supporting_files: false,
    })
}

/// YAML frontmatter structure for deserialization.
#[derive(serde::Deserialize)]
struct FrontMatter {
    description: Option<String>,
    #[serde(rename = "user-invokable")]
    user_invokable: Option<bool>,
    license: Option<String>,
    args: Option<Vec<FrontMatterArg>>,
}

#[derive(serde::Deserialize)]
struct FrontMatterArg {
    name: String,
    description: Option<String>,
    required: Option<bool>,
}

/// Serialize a Skill back to SKILL.md format.
fn serialize_skill_file(skill: &Skill) -> String {
    let mut yaml_lines = Vec::new();

    if !skill.description.is_empty() {
        yaml_lines.push(format!("description: \"{}\"", skill.description.replace('"', "\\\"")));
    }
    yaml_lines.push(format!("user-invokable: {}", skill.user_invokable));
    if let Some(ref license) = skill.license {
        yaml_lines.push(format!("license: \"{}\"", license.replace('"', "\\\"")));
    }
    if !skill.args.is_empty() {
        yaml_lines.push("args:".to_string());
        for arg in &skill.args {
            yaml_lines.push(format!("  - name: \"{}\"", arg.name.replace('"', "\\\"")));
            if !arg.description.is_empty() {
                yaml_lines.push(format!(
                    "    description: \"{}\"",
                    arg.description.replace('"', "\\\"")
                ));
            }
            if arg.required {
                yaml_lines.push("    required: true".to_string());
            }
        }
    }

    let yaml = yaml_lines.join("\n");
    let body = &skill.content;

    format!("---\n{}\n---\n\n{}\n", yaml, body)
}

/// Check whether a skill directory contains files beyond SKILL.md.
fn has_extra_files(dir: &std::path::Path) -> bool {
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let name = entry.file_name();
            if name != "SKILL.md" {
                return true;
            }
        }
    }
    false
}

/// Recursively copy a directory.
fn copy_dir_recursive(src: &std::path::Path, dst: &std::path::Path) -> Result<()> {
    fs::create_dir_all(dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());
        if src_path.is_dir() {
            copy_dir_recursive(&src_path, &dst_path)?;
        } else {
            fs::copy(&src_path, &dst_path)?;
        }
    }
    Ok(())
}
