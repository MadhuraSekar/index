# Muteform DS Ops — Launch Plan

Target launch: **July 2026**

---

## 1. Positioning

**Category:** AI-native design system operations.
**One-liner:** *Run your design system like infrastructure.*
**Buyer:** design systems leads and senior design engineers at companies with a production design system (roughly: 3+ product teams consuming it). They have budget authority for tooling in the $300–$2,000/yr range without procurement.

The free core is the distribution engine: it earns trust by producing one genuinely staff-level audit. The Pro subscription sells the *operational* layer — governance, drift, migrations, release pipelines — plus the promise that the pack tracks a fast-moving ecosystem (DTCG revisions, Figma MCP changes, Claude Code plugin API changes) so the buyer doesn't have to.

---

## 2. The moat — stated honestly

The pack itself is markdown. It is MIT-derived, the upstream original is free, and any customer can read every prompt. **The files are not the moat and never will be.** Pricing must be justified by things that cannot be copied by copying files:

| Layer | What it is | Why it can't be cloned | Status |
|---|---|---|---|
| **Update velocity** | Monthly releases tracking DTCG, Figma MCP/Code Connect, Claude Code plugin API | Requires sustained effort; the free upstream goes stale | Ships at launch (the commitment + CI/validator infrastructure) |
| **CI mode** | GitHub App that runs drift/compliance audits on every PR, persists findings | Software + accumulated per-customer history | Build in first 90 days |
| **Muteform Index** | Opt-in, anonymised benchmark data from real audit runs → percentile scoring in reports | Data network effect — each customer improves it; a copycat starts at zero | Seed at launch (instrument the skills), surface once n ≥ 50 systems |
| **Trend dashboards** | Token debt, drift velocity, adoption curves per team over time | Hosted product; switching cost grows with history | After CI mode |
| **Distribution & brand** | Claude Code marketplace placement, newsletter, the free core's install base | Compounding; first-mover in the category name | Starts at launch |

Sequencing principle: **every quarter, move more of the perceived value out of the markdown and into the hosted/data layer.**

---

## 3. Paid mechanics: private-marketplace gating

You cannot license-key a markdown file, but you can gate access to the repository that serves it.

**Architecture:**

1. **Public repo** (`muteform/ds-ops`): the free core + docs + sample outputs. This is the marketing site's proof of quality.
2. **Private repo** (`muteform/pro-marketplace`): the `pro/` plugin plus its own `.claude-plugin/marketplace.json`. Only customers have read access.
3. **Payments:** Polar or Lemon Squeezy (both handle VAT/merchant-of-record, both have GitHub-friendly webhooks). Subscription product, seat quantity.
4. **Provisioning webhook:** a ~100-line service (Cloudflare Worker or similar):
   - `subscription.created` → invite the buyer's GitHub username(s) as read-only collaborators on `muteform/pro-marketplace` (`PUT /repos/{owner}/{repo}/collaborators/{username}` with `permission: pull`).
   - `subscription.cancelled` / payment lapse → remove collaborator after the 30-day grace period in the license.
   - Collect GitHub usernames at checkout (custom field) — no account system needed at launch.
5. **Customer install experience** (two lines, in the receipt email and the repo README):
   ```
   /plugin marketplace add muteform/pro-marketplace
   /plugin install muteform-ds-ops-pro@muteform-pro
   ```
6. **Updates:** customers get them by design — `/plugin` update pulls from the repo they already have access to. Every monthly release is a visible, dated reminder of what the subscription buys.

**Accepted leak risk:** a customer can copy the files out. The license forbids redistribution of Muteform's additions, but MIT-derived portions carry MIT rights — so enforcement is soft. This is priced in: the moat layers above are what retain customers, not the gate. Do not spend engineering effort on DRM; spend it on CI mode.

---

## 4. Pricing (launch hypothesis — test, don't marry)

| Plan | Price | Includes |
|---|---|---|
| **Core** | Free (MIT) | 8 audit skills, 3 commands |
| **Pro Individual** | $29/mo or $290/yr | 1 seat, full Pro pack, monthly updates, support |
| **Pro Team** | $149/mo or $1,490/yr | 10 seats, everything in Individual, priority support, CI mode when it ships |
| **Design partner** (first 10 customers) | $990/yr, locked 3 years | Team plan + roadmap input + their anonymised data seeds the Index |

Rationale: anchored against one consulting hour ($150–300) — a single token audit that saves a day of staff-engineer time pays for a year of Individual. Team price stays under typical no-procurement thresholds. The design-partner tier converts early scarcity (no Index data yet) into an asset (founding data + testimonials).

---

## 5. Launch sequence

**Now → launch:**
1. Create `muteform/ds-ops` (public) and `muteform/pro-marketplace` (private); split this monorepo per §3 (`core/` → public root; `pro/` → private root with its own marketplace.json; CI/validator goes to both).
2. Set up Polar/Lemon Squeezy product + provisioning webhook; test the full purchase → invite → install loop end to end.
3. Landing page at muteform.com: positioning, pricing table (see `docs/PRICING.md`), one full sample audit as the centrepiece proof.
4. Instrument skills for the Index: add an opt-in `telemetry` block to `.ds-ops-config.yml` (off by default, anonymised aggregates only, documented plainly).

**Launch week:**
- Submit the free core to Claude Code marketplace listings/directories.
- Ship: Show HN / design-systems Slack communities / Design Systems newsletter sponsorship — the free core is the artifact being shared, Pro is one link away.
- Personally onboard the first 10 design partners.

**First 90 days:**
- Monthly Pro release cadence from day one (even small: DTCG note updates, new sample outputs, skill calibration fixes — the *rhythm* is the product promise).
- Build CI mode v1: GitHub Action (not full App yet) wrapping drift-detection + token-compliance on PR diffs, writing findings as PR comments. Pro-only.
- Publish one public benchmark teaser from early Index data ("the median production system has 23% hardcoded colour usage") — content marketing that only Muteform can write.

**6–12 months:** GitHub App + dashboards; Index percentiles appear inside every Pro report; raise prices for new customers once percentile reporting ships.

---

## 6. Risks

- **Upstream competition:** Murphy Trueman keeps shipping the free original. Mitigation: never compete on the markdown; compete on CI, data, and cadence. Maintain courteous attribution — the fork's legitimacy depends on it. Consider offering him a revenue-share or advisory role; an endorsed fork is stronger than a rival one.
- **License leak of Pro files:** accepted, see §3.
- **Anthropic platform changes:** plugin spec/marketplace changes could break installs. Mitigation: the validator + CI already pin structural assumptions; monthly cadence absorbs changes within weeks.
- **Category timing:** if "design system ops" doesn't resonate as a category, fall back to selling the *outcome* ("cut design-system maintenance time in half") rather than the category.

---

## 7. Launch checklist

- [ ] Repos split (public core / private pro) with CI green on both
- [ ] Payment product live; webhook provisioning tested with a real purchase
- [ ] Purchase → invite → `/plugin install` loop under 5 minutes, verified on a clean machine
- [ ] Landing page + pricing page live
- [ ] NOTICE/attribution reviewed (and upstream author contacted — see Risks)
- [ ] 3 sample outputs refreshed and linked from the landing page
- [ ] Telemetry opt-in documented; privacy note published
- [ ] Design-partner offer email drafted; first 10 prospects listed
- [ ] Launch posts drafted (HN, communities, newsletter)
