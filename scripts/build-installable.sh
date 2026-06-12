#!/usr/bin/env bash
# Rebuild the distributable artifacts in installable/ from the working tree.
#
# Produces one archive per tier:
#   installable/muteform-ds-ops.zip / .plugin       — free core
#   installable/muteform-ds-ops-pro.zip / .plugin   — Pro (private distribution only)
#
# The .plugin copies are the same archives named for Cowork drag-and-drop.
# Run from anywhere: scripts/build-installable.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

node scripts/validate.mjs

mkdir -p installable
rm -f installable/*.zip installable/*.plugin

build_tier() {
  local tier="$1" name="$2"
  local stage
  stage="$(mktemp -d)"

  # The plugin directory is self-contained; add the shared root docs.
  cp -r "$tier"/. "$stage/"
  cp README.md CHANGELOG.md LICENSE NOTICE.md "$stage/"

  (cd "$stage" && zip -q -r -X "$ROOT/installable/$name.zip" .)
  cp "installable/$name.zip" "installable/$name.plugin"
  rm -rf "$stage"
}

build_tier core muteform-ds-ops
build_tier pro muteform-ds-ops-pro

echo "Built:"
ls -la installable/
