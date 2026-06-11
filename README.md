# Muteform DS Ops

Design system operations for Claude Code — run your system like infrastructure, not a side project.

[muteform.com](https://muteform.com)

---

## The work nobody built AI for

Design systems drift. Tokens go stale. Components fall out of spec. Governance documentation gets written once and never updated. The deprecation plan lives in someone's head. The stakeholder brief gets thrown together the night before quarterly review.

There are great AI tools for the designer who *uses* a design system. Muteform DS Ops is for the team *running* it.

When you ask Claude to audit your tokens with this pack installed, it doesn't give you generic advice. It reads your actual token files, identifies tier leakage, flags naming violations, produces a prioritised finding table with remediation guidance, and — if you're migrating to DTCG — gives you a sprint-plannable migration plan with hour estimates.

**Who it's for:** Design systems leads, senior design engineers, and anyone responsible for a production design system.

---

## Free core vs. Pro

| | **Core** (free, MIT) | **Pro** (subscription) |
|---|---|---|
| Token, component, naming, theme & a11y audits | ✓ | ✓ |
| System health reports | ✓ | ✓ |
| Decision records & token documentation | ✓ | ✓ |
| Drift detection & system benchmarking | — | ✓ |
| Agent chains: full diagnostic, release pipeline, governance review, migration | — | ✓ |
| Governance suite: contribution workflow, deprecation, triage, versioning, retrospectives | — | ✓ |
| AI infrastructure: context engines, codebase index, metadata schemas, MCP descriptions | — | ✓ |
| Validation: design-to-code checks, token compliance, API validation, CI/CD integration | — | ✓ |
| Communication: adoption reports, stakeholder briefs, system pitch, visual reports, onboarding | — | ✓ |
| Codemod generation | — | ✓ |
| Monthly ecosystem updates (DTCG, Figma MCP, Claude Code changes) | — | ✓ |
| Priority support | — | ✓ |
| **Contents** | 8 skills · 3 commands · 9 knowledge notes | 31 skills · 4 agents · 10 commands · 11 knowledge notes |

Pro pricing and purchase: [muteform.com/pricing](https://muteform.com/pricing) — your subscription unlocks the private plugin marketplace.

---

## Install the free core

### Claude Code (terminal)

```
/plugin marketplace add <this-repo>
/plugin install muteform-ds-ops@muteform
```

### Cowork (desktop app)

1. Download `muteform-ds-ops.plugin` from the [`installable/`](installable/) folder
2. Start a Cowork session and drop the `.plugin` file into the chat
3. Follow the install prompt

**Verify:** run `/help` and confirm `/token-audit` is listed, then say "How healthy is my design system?" If Claude responds with a structured, multi-step process — not generic advice — you're set up.

### Pro

After purchase you'll receive an invite to the private customer marketplace:

```
/plugin marketplace add muteform/pro-marketplace
/plugin install muteform-ds-ops-pro@muteform-pro
```

---

## Core frameworks

The skills encode specific practitioner frameworks, not generic advice:

- **Three-tier token architecture** — primitive → semantic → component, with tier-leakage detection and DTCG 2025.10 alignment
- **Component Challenge Rating** — a difficulty classification that calibrates audit depth and remediation estimates to actual component complexity
- **Design system maturity model** — five levels from ad-hoc to optimised, used across health reports, briefs, and adoption tracking
- **AI-readiness scoring** — evaluates how well your system's metadata, naming, and structure support AI agent consumption

---

## Roadmap (Pro)

- **CI mode** — a GitHub App that runs drift and compliance audits on every pull request and tracks findings over time
- **Muteform Index** — opt-in, anonymised benchmark data from real audit runs, so reports can say "your naming consistency is in the 34th percentile of production systems" instead of guessing
- **Trend dashboards** — token debt, drift velocity, and adoption curves per team, quarter over quarter

---

## Quick examples

- *"I just want to know where we stand"* → "How healthy is my design system?"
- *"Our tokens are a mess"* → "Audit my tokens"
- *"I need to deprecate a component"* (Pro) → "Help me deprecate DatePicker in favour of DatePickerNext"
- *"Run the full pre-release pipeline"* (Pro) → "Run the release pipeline for Dialog"

You don't need to memorise skill names. Describe what you need and the right skill activates.

Real outputs from real codebases are in [`sample-outputs/`](sample-outputs/).

---

## Configuration

Every skill works out of the box. To customise — severity overrides, Figma integration, recurring trend tracking — create a `.ds-ops-config.yml` in your project root (annotated template ships with both tiers). Full reference: [3-SETUP-AND-CONFIG.md](3-SETUP-AND-CONFIG.md).

Several skills become more powerful with Figma access via the [Figma MCP server](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server). Setup details in [1-INSTALL.md](1-INSTALL.md).

---

## Documentation

| File | What it covers |
|------|---------------|
| [1-INSTALL.md](1-INSTALL.md) | Full installation guide with entry points by use case |
| [2-WHATS-INCLUDED.md](2-WHATS-INCLUDED.md) | Complete product documentation — every skill, agent, and knowledge note |
| [3-SETUP-AND-CONFIG.md](3-SETUP-AND-CONFIG.md) | Deep-dive setup, framework compatibility, monorepo handling, troubleshooting |

---

## License & attribution

The free core is MIT-licensed. Pro is commercially licensed ([pro/LICENSE.md](pro/LICENSE.md)).

Muteform DS Ops is built on [Design System Ops](https://github.com/murphytrueman/design-system-ops) by Murphy Trueman, used under the MIT License — see [NOTICE.md](NOTICE.md). The practitioner frameworks at the heart of this pack originate in that open-source work.
