#!/usr/bin/env bash
# Rebuild the distributable artifacts in installable/ from the working tree.
#
# Produces:
#   installable/design-system-ops.zip     — generic archive
#   installable/design-system-ops.plugin  — same archive, Cowork drag-and-drop name
#
# Run from anywhere: scripts/build-installable.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

node scripts/validate.mjs

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

# Only ship what the plugin runtime needs plus the user-facing docs.
INCLUDE=(
  .claude-plugin
  skills
  agents
  commands
  knowledge-notes
  sample-outputs
  .ds-ops-config.yml
  README.md
  1-INSTALL.md
  2-WHATS-INCLUDED.md
  3-SETUP-AND-CONFIG.md
  CHANGELOG.md
  LICENSE
)

for item in "${INCLUDE[@]}"; do
  cp -r "$item" "$STAGE/$item"
done

mkdir -p installable
rm -f installable/design-system-ops.zip installable/design-system-ops.plugin

(cd "$STAGE" && zip -q -r -X "$ROOT/installable/design-system-ops.zip" .)
cp installable/design-system-ops.zip installable/design-system-ops.plugin

echo "Built:"
ls -la installable/
