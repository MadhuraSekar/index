# Contributing to Muteform DS Ops

Thanks for considering a contribution. This project benefits from the experience of real design systems practitioners, and contributions that improve the skills for everyone are welcome.

## What makes a good contribution

The skills in this pack are built from production experience. Contributions that land well tend to share a few traits: they address a real problem encountered in actual design systems work, they improve the specificity or accuracy of an existing skill, or they fill a gap that practitioners hit regularly.

## How to contribute

**Bug fixes and improvements to existing skills:**
Open a pull request with a clear description of what was wrong and what you changed. If you can include an example of the improved output, that helps reviewers understand the impact.

**New skills:**
Open an issue first describing the skill you'd like to add. Include what problem it solves, who would use it, and a rough outline of the process the skill would follow. This avoids duplicate work and lets us discuss scope before you invest time writing it.

**Documentation improvements:**
Pull requests welcome. If something in the install guide, setup docs, or skill descriptions is unclear or wrong, fix it.

## Skill structure

Each skill is a markdown file (`SKILL.md`) inside its own folder under `skills/`. Skills reference knowledge notes directly from the canonical `knowledge-notes/` directory via their frontmatter `references:` field using relative paths like `../../knowledge-notes/filename.md`. When adding a new skill, include the knowledge note paths in the skill's frontmatter `references:` array.

The repo is a two-plugin monorepo: the free tier lives in `core/` and the commercial tier in `pro/`. Within each plugin: skills in `skills/skillname/SKILL.md`, agent chains in `agents/` (Pro only), slash commands in `commands/`, and knowledge notes in `knowledge-notes/`. Each plugin is self-contained — a skill may only reference notes inside its own plugin (the validator enforces this). Sample outputs live at the repo root in `sample-outputs/`.

## Validating your changes

Before opening a pull request, run the pack validator:

```bash
node scripts/validate.mjs
```

It checks skill/agent/command frontmatter, naming rules, that every `references:` path resolves, that every `${CLAUDE_PLUGIN_ROOT}` path mentioned in a command actually exists, and that the manifests parse with the right fields. CI runs the same check on every pull request, plus a build of the installable artifacts. If you change anything that ships, rebuild the installables with `bash scripts/build-installable.sh` and commit them.

## What to avoid

- Generic AI advice. Every finding, recommendation, and output should be specific to the user's actual codebase, not templated.
- Skills that duplicate what an existing skill already does. Check `2-WHATS-INCLUDED.md` for the full inventory.
- Changes to knowledge notes without understanding which skills depend on them. The notes are shared references — changes propagate. Notes that exist in both `core/` and `pro/` must be kept in sync.

## Code of conduct

Be decent. Assume good intent. Give constructive feedback. This is a project for practitioners helping practitioners.

## Questions?

Open an issue on the repository.
