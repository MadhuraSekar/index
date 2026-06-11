# Changelog

All notable changes to Muteform DS Ops will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Entries up to and including 2.0.0 cover the upstream lineage as Design System Ops; Muteform DS Ops versioning restarts at 1.0.0.

## [1.0.0] — 2026-07 (Muteform DS Ops)

First release under the Muteform brand. Commercial fork of Design System Ops
(see [NOTICE.md](NOTICE.md) for attribution and licensing).

### Added

- **Two-tier product structure.** The pack is now a two-plugin monorepo:
  - `core/` — **muteform-ds-ops** (free, MIT): 8 audit skills (token-audit, component-audit, system-health, naming-audit, theme-audit, accessibility-per-component, token-documentation, decision-record), 3 commands, 9 knowledge notes.
  - `pro/` — **muteform-ds-ops-pro** (commercial): 31 skills, all 4 agent chains, 10 commands, 11 knowledge notes, plus the monthly ecosystem-update commitment.
- **pro/LICENSE.md** — commercial license for the Pro tier (seat-based, outputs unrestricted, MIT-derived portions unaffected).
- **NOTICE.md** — upstream attribution and the licensing structure in plain language.
- **Launch kit** (`docs/`) — launch plan with moat roadmap (hosted CI layer, Muteform Index benchmarks), pricing page copy, and private-marketplace gating architecture.

### Changed

- **Validator** now validates each plugin independently, enforces plugin self-containment (references may not escape the plugin directory), and cross-checks plugin versions against the root marketplace manifest.
- **Build script** produces one installable per tier.
- **Marketplace manifest** lists both plugins; at launch the Pro source moves to the private customer marketplace.

## [2.0.0] — 2026-07

### Added

- **Marketplace manifest** (`.claude-plugin/marketplace.json`) — the pack can now be installed with `/plugin marketplace add murphytrueman/design-system-ops` followed by `/plugin install design-system-ops@design-system-ops`. This is the new recommended install path and the only one that loads skills, commands, and agents together.
- **Pack validator** (`scripts/validate.mjs`) — zero-dependency integrity check covering skill/agent/command frontmatter, naming rules, `references:` path resolution, `${CLAUDE_PLUGIN_ROOT}` path existence in commands, and manifest/changelog version agreement.
- **CI** (`.github/workflows/validate.yml`) — runs the validator and an installable build on every push and pull request.
- **Installable build script** (`scripts/build-installable.sh`) — reproducibly rebuilds `installable/design-system-ops.zip` and `.plugin` from the working tree, validating first.

### Changed

- **BREAKING: agent chains moved from `skills/` to `agents/`.** The four chained workflows (`full-system-diagnostic`, `component-to-release`, `governance-review`, `migration`) were loose `.md` files inside `skills/`, where they were invalid as skills (skills must be directories containing a `SKILL.md`) and were not loaded as agents either. They now live in `agents/` per the Claude Code plugin layout, and the four commands that chain them load from the new paths.
- **Install documentation** (README, 1-INSTALL) now leads with the plugin marketplace flow. Cloning into `~/.claude/skills/` is explicitly discouraged: it nests skills one level too deep for discovery and never activated commands or agents.
- **Installable artifacts rebuilt** with the corrected structure.

### Fixed

- **All 13 commands pointed at nonexistent reference directories.** Commands instructed Claude to read reference material from `${CLAUDE_PLUGIN_ROOT}/skills/<name>/references/`, a path that exists nowhere in the pack — reference material lives in `knowledge-notes/`. Every command now points at `${CLAUDE_PLUGIN_ROOT}/knowledge-notes/` via the skill frontmatter `references:` lists.
- **Directory tree in 2-WHATS-INCLUDED.md** listed nine command files that do not exist (e.g. `theme-audit.md`, `naming-audit.md`, `figma-variable-audit.md`) and omitted six that do. The tree now matches the repository.
- **plugin.json description** undercounted the pack contents (now: 39 skills, 4 agents, 13 commands, 11 knowledge notes).

## [1.1.0] — 2026-03

### Added

- **theme-audit skill** — Dedicated skill for auditing theme implementation. Covers theme discovery, coverage checking, component-tier propagation, visual consistency, DTCG resolver validation, and regression detection.
- **4 new sample outputs** — system-health-campusiq, drift-detection-sparky-consumer-app, stakeholder-brief-campusiq-q1, component-audit-fintech-pulse. These join the existing samples to provide calibration material across the most-used skill categories.
- **CHANGELOG.md** — This file.
- **LICENSE** — MIT license.

### Changed

- **adoption-report skill** — Expanded from a structural outline to a full step-by-step workflow with 5 phases, calibration checkpoint, integration awareness, small-system guidance, and quality checks. Now matches the procedural depth of the audit skills.
- **stakeholder-brief skill** — Expanded with tone calibration by audience (engineering, product, design leadership), framing patterns, anti-patterns, maturity-level framing, and quality checks.
- **system-pitch skill** — Expanded with ROI calculation framework, 7 objection handlers, audience calibration, investment models, risk framing, and anti-patterns section.
- **All 13 commands** — Widened `allowed-tools` lists to include `Bash(ls:*)`, `Bash(cat:*)`, `Bash(head:*)`, `Bash(tail:*)` and other baseline tools where missing, preventing silent failures during real-world codebase navigation.
- **Knowledge note references consolidated** — All skills with references now point to the canonical `knowledge-notes/` directory via `../../knowledge-notes/` instead of per-skill copies. Eliminates duplicated files and the maintenance drift they caused.
- **Redundant prose loading instructions removed** — Skills that had both frontmatter `references:` declarations and prose "Reference material" sections now rely solely on the frontmatter, saving tokens and eliminating ambiguity.

### Fixed

- **Sample output path references** — Corrected provenance paths in sample outputs to match actual plugin structure (`skills/` prefix).
