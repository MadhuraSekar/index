#!/usr/bin/env node
/**
 * Muteform DS Ops — pack integrity validator.
 *
 * Validates each plugin in the monorepo (core/ and pro/) against the Claude
 * Code plugin and Agent Skills specs without any external dependencies:
 *
 *   - skills/<name>/SKILL.md exists for every skill (no loose .md files)
 *   - SKILL.md frontmatter parses, `name` matches its directory, naming
 *     rules hold (lowercase, hyphens, <=64 chars), `description` <=1024 chars
 *   - every `references:` path declared in skill frontmatter resolves
 *     (so each plugin is self-contained — no reaching across tiers)
 *   - agents/*.md have valid frontmatter (name + description)
 *   - commands/*.md have a description and every ${CLAUDE_PLUGIN_ROOT} path
 *     they mention exists inside that plugin
 *   - each plugin.json parses with name/version/description
 *   - the root marketplace.json lists every plugin with a matching version
 *   - the changelog head release matches the plugin versions
 *
 * Exit code 0 = clean, 1 = findings. Run: node scripts/validate.mjs
 */

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PLUGINS = ["core", "pro"];
const errors = [];
const warnings = [];
const err = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);
let skillCount = 0;

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

const pluginVersions = {};

for (const plugin of PLUGINS) {
  const base = join(ROOT, plugin);
  const label = (p) => `${plugin}/${p}`;

  // ── skills/ ──────────────────────────────────────────────────────────
  const skillsDir = join(base, "skills");
  if (!existsSync(skillsDir)) {
    err(`${plugin}: missing skills/ directory`);
  } else {
    for (const entry of readdirSync(skillsDir)) {
      const full = join(skillsDir, entry);
      if (!statSync(full).isDirectory()) {
        err(`${label(`skills/${entry}`)}: loose file in skills/ — skills must be directories containing SKILL.md (agents belong in agents/)`);
        continue;
      }
      const skillFile = join(full, "SKILL.md");
      if (!existsSync(skillFile)) {
        err(`${label(`skills/${entry}`)}: missing SKILL.md`);
        continue;
      }
      skillCount++;
      const raw = readFileSync(skillFile, "utf8");
      const fm = parseFrontmatter(raw, label(`skills/${entry}/SKILL.md`));
      if (!fm) {
        err(`${label(`skills/${entry}/SKILL.md`)}: missing frontmatter`);
        continue;
      }
      if (!fm.name) err(`${label(`skills/${entry}/SKILL.md`)}: missing name`);
      else {
        if (fm.name !== entry) err(`${label(`skills/${entry}/SKILL.md`)}: name "${fm.name}" does not match directory name`);
        if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fm.name)) err(`${label(`skills/${entry}/SKILL.md`)}: name must be lowercase alphanumeric with hyphens`);
        if (fm.name.length > 64) err(`${label(`skills/${entry}/SKILL.md`)}: name exceeds 64 characters`);
      }
      if (!fm.description) err(`${label(`skills/${entry}/SKILL.md`)}: missing description`);
      else if (fm.description.length > 1024) err(`${label(`skills/${entry}/SKILL.md`)}: description exceeds 1024 characters (${fm.description.length})`);
      for (const ref of [].concat(fm.references ?? [])) {
        const target = resolve(full, ref);
        if (!existsSync(target)) err(`${label(`skills/${entry}/SKILL.md`)}: reference does not resolve: ${ref}`);
        else if (!target.startsWith(base)) err(`${label(`skills/${entry}/SKILL.md`)}: reference escapes the plugin directory: ${ref}`);
      }
    }
  }

  // ── agents/ ──────────────────────────────────────────────────────────
  const agentsDir = join(base, "agents");
  if (existsSync(agentsDir)) {
    for (const entry of readdirSync(agentsDir).filter((f) => f.endsWith(".md"))) {
      const raw = readFileSync(join(agentsDir, entry), "utf8");
      const fm = parseFrontmatter(raw, label(`agents/${entry}`));
      if (!fm) { err(`${label(`agents/${entry}`)}: missing frontmatter`); continue; }
      if (!fm.name) err(`${label(`agents/${entry}`)}: missing name`);
      if (!fm.description) err(`${label(`agents/${entry}`)}: missing description`);
    }
  }

  // ── commands/ ────────────────────────────────────────────────────────
  const commandsDir = join(base, "commands");
  if (existsSync(commandsDir)) {
    for (const entry of readdirSync(commandsDir).filter((f) => f.endsWith(".md"))) {
      const raw = readFileSync(join(commandsDir, entry), "utf8");
      const fm = parseFrontmatter(raw, label(`commands/${entry}`));
      if (!fm || !fm.description) err(`${label(`commands/${entry}`)}: missing description frontmatter`);
      for (const m of raw.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/([A-Za-z0-9._/-]+)/g)) {
        const target = m[1].replace(/\/$/, "");
        if (target.includes("*")) {
          const prefix = target.slice(0, target.indexOf("*")).replace(/\/$/, "");
          if (prefix && !existsSync(join(base, prefix))) err(`${label(`commands/${entry}`)}: path prefix does not exist: ${prefix}`);
          continue;
        }
        if (!existsSync(join(base, target))) err(`${label(`commands/${entry}`)}: references nonexistent path: ${target}`);
      }
    }
  }

  // ── plugin manifest ──────────────────────────────────────────────────
  try {
    const manifest = JSON.parse(readFileSync(join(base, ".claude-plugin/plugin.json"), "utf8"));
    for (const field of ["name", "version", "description"]) {
      if (!manifest[field]) err(`${plugin}/.claude-plugin/plugin.json: missing required field "${field}"`);
    }
    pluginVersions[manifest.name] = manifest.version;
  } catch (e) {
    err(`${plugin}/.claude-plugin/plugin.json: ${e.message}`);
  }
}

// ── root marketplace ─────────────────────────────────────────────────────
try {
  const mp = JSON.parse(readFileSync(join(ROOT, ".claude-plugin/marketplace.json"), "utf8"));
  if (!mp.name) err(".claude-plugin/marketplace.json: missing name");
  const listed = new Map((mp.plugins ?? []).map((p) => [p.name, p]));
  for (const [name, version] of Object.entries(pluginVersions)) {
    const entry = listed.get(name);
    if (!entry) err(`.claude-plugin/marketplace.json: plugin "${name}" not listed`);
    else if (entry.version !== version) err(`.claude-plugin/marketplace.json: "${name}" version ${entry.version} does not match plugin.json ${version}`);
  }
} catch (e) {
  err(`.claude-plugin/marketplace.json: ${e.message}`);
}

// ── changelog agreement ──────────────────────────────────────────────────
const versions = [...new Set(Object.values(pluginVersions))];
if (versions.length === 1) {
  const changelog = readFileSync(join(ROOT, "CHANGELOG.md"), "utf8");
  const head = changelog.match(/^## \[(\d+\.\d+\.\d+)\]/m);
  if (head && head[1] !== versions[0]) {
    err(`version mismatch: plugins are at ${versions[0]}, CHANGELOG.md head release is ${head[1]}`);
  }
} else if (versions.length > 1) {
  warn(`plugin versions diverge (${versions.join(", ")}) — intentional?`);
}

// ── report ───────────────────────────────────────────────────────────────
for (const w of warnings) console.log(`WARN  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s) across ${skillCount} skills in ${PLUGINS.length} plugins`);
process.exit(errors.length ? 1 : 0);
