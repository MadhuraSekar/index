#!/usr/bin/env node
/**
 * Design System Ops — pack integrity validator.
 *
 * Validates the plugin structure against the Claude Code plugin and Agent
 * Skills specs without any external dependencies:
 *
 *   - skills/<name>/SKILL.md exists for every skill (no loose .md files)
 *   - SKILL.md frontmatter parses, `name` matches its directory, naming
 *     rules hold (lowercase, hyphens, <=64 chars), `description` <=1024 chars
 *   - every `references:` path declared in skill frontmatter resolves
 *   - agents/*.md have valid frontmatter (name + description)
 *   - commands/*.md have a description and every ${CLAUDE_PLUGIN_ROOT} path
 *     they mention exists in the repo
 *   - .claude-plugin/plugin.json and marketplace.json parse and carry the
 *     required fields, and plugin.json version matches the changelog head
 *
 * Exit code 0 = clean, 1 = findings. Run: node scripts/validate.mjs
 */

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const warnings = [];
const err = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

/** Minimal YAML frontmatter parser: scalars and simple "- item" lists. */
function parseFrontmatter(raw, file) {
  if (!raw.startsWith("---")) return null;
  const end = raw.indexOf("\n---", 3);
  if (end === -1) {
    err(`${file}: frontmatter opened with --- but never closed`);
    return null;
  }
  const block = raw.slice(raw.indexOf("\n") + 1, end);
  const out = {};
  let currentKey = null;
  for (const line of block.split("\n")) {
    if (/^\s*#/.test(line) || line.trim() === "") continue;
    const listItem = line.match(/^\s+-\s+(.*)$/);
    if (listItem && currentKey) {
      if (!Array.isArray(out[currentKey])) out[currentKey] = [];
      out[currentKey].push(stripQuotes(listItem[1].trim()));
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) {
      currentKey = kv[1];
      out[currentKey] = kv[2] === "" ? null : stripQuotes(kv[2].trim());
      continue;
    }
    err(`${file}: unparseable frontmatter line: ${JSON.stringify(line)}`);
  }
  return out;
}

const stripQuotes = (s) =>
  (s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))
    ? s.slice(1, -1)
    : s;

// ── skills/ ────────────────────────────────────────────────────────────────
const skillsDir = join(ROOT, "skills");
const skillNames = new Set();
for (const entry of readdirSync(skillsDir)) {
  const full = join(skillsDir, entry);
  if (!statSync(full).isDirectory()) {
    err(`skills/${entry}: loose file in skills/ — skills must be directories containing SKILL.md (agents belong in agents/)`);
    continue;
  }
  const skillFile = join(full, "SKILL.md");
  if (!existsSync(skillFile)) {
    err(`skills/${entry}: missing SKILL.md`);
    continue;
  }
  const raw = readFileSync(skillFile, "utf8");
  const fm = parseFrontmatter(raw, `skills/${entry}/SKILL.md`);
  if (!fm) {
    err(`skills/${entry}/SKILL.md: missing frontmatter`);
    continue;
  }
  if (!fm.name) err(`skills/${entry}/SKILL.md: missing name`);
  else {
    skillNames.add(fm.name);
    if (fm.name !== entry) err(`skills/${entry}/SKILL.md: name "${fm.name}" does not match directory name`);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fm.name)) err(`skills/${entry}/SKILL.md: name must be lowercase alphanumeric with hyphens`);
    if (fm.name.length > 64) err(`skills/${entry}/SKILL.md: name exceeds 64 characters`);
  }
  if (!fm.description) err(`skills/${entry}/SKILL.md: missing description`);
  else if (fm.description.length > 1024) err(`skills/${entry}/SKILL.md: description exceeds 1024 characters (${fm.description.length})`);
  for (const ref of [].concat(fm.references ?? [])) {
    if (!existsSync(resolve(full, ref))) err(`skills/${entry}/SKILL.md: reference does not resolve: ${ref}`);
  }
}

// ── agents/ ────────────────────────────────────────────────────────────────
const agentsDir = join(ROOT, "agents");
if (!existsSync(agentsDir)) {
  warn("agents/ directory missing — chained workflows will not load as agents");
} else {
  for (const entry of readdirSync(agentsDir).filter((f) => f.endsWith(".md"))) {
    const raw = readFileSync(join(agentsDir, entry), "utf8");
    const fm = parseFrontmatter(raw, `agents/${entry}`);
    if (!fm) { err(`agents/${entry}: missing frontmatter`); continue; }
    if (!fm.name) err(`agents/${entry}: missing name`);
    if (!fm.description) err(`agents/${entry}: missing description`);
  }
}

// ── commands/ ──────────────────────────────────────────────────────────────
const commandsDir = join(ROOT, "commands");
for (const entry of readdirSync(commandsDir).filter((f) => f.endsWith(".md"))) {
  const raw = readFileSync(join(commandsDir, entry), "utf8");
  const fm = parseFrontmatter(raw, `commands/${entry}`);
  if (!fm || !fm.description) err(`commands/${entry}: missing description frontmatter`);
  for (const m of raw.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/([A-Za-z0-9._/-]+)/g)) {
    const target = m[1].replace(/\/$/, "");
    if (target.includes("*")) {
      // glob reference — verify the static prefix exists
      const prefix = target.slice(0, target.indexOf("*")).replace(/\/$/, "");
      if (prefix && !existsSync(join(ROOT, prefix))) err(`commands/${entry}: path prefix does not exist: ${prefix}`);
      continue;
    }
    if (!existsSync(join(ROOT, target))) err(`commands/${entry}: references nonexistent path: ${target}`);
  }
}

// ── plugin manifest ────────────────────────────────────────────────────────
let pluginVersion = null;
try {
  const plugin = JSON.parse(readFileSync(join(ROOT, ".claude-plugin/plugin.json"), "utf8"));
  for (const field of ["name", "version", "description"]) {
    if (!plugin[field]) err(`.claude-plugin/plugin.json: missing required field "${field}"`);
  }
  pluginVersion = plugin.version;
} catch (e) {
  err(`.claude-plugin/plugin.json: ${e.message}`);
}

const marketplacePath = join(ROOT, ".claude-plugin/marketplace.json");
if (existsSync(marketplacePath)) {
  try {
    const mp = JSON.parse(readFileSync(marketplacePath, "utf8"));
    if (!mp.name) err(".claude-plugin/marketplace.json: missing name");
    if (!Array.isArray(mp.plugins) || mp.plugins.length === 0) err(".claude-plugin/marketplace.json: plugins array missing or empty");
  } catch (e) {
    err(`.claude-plugin/marketplace.json: ${e.message}`);
  }
} else {
  warn(".claude-plugin/marketplace.json missing — pack cannot be installed via /plugin marketplace add");
}

if (pluginVersion) {
  const changelog = readFileSync(join(ROOT, "CHANGELOG.md"), "utf8");
  const head = changelog.match(/^## \[(\d+\.\d+\.\d+)\]/m);
  if (head && head[1] !== pluginVersion) {
    err(`version mismatch: plugin.json says ${pluginVersion}, CHANGELOG.md head release is ${head[1]}`);
  }
}

// ── report ─────────────────────────────────────────────────────────────────
for (const w of warnings) console.log(`WARN  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s) across ${skillNames.size} skills`);
process.exit(errors.length ? 1 : 0);
