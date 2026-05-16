#!/usr/bin/env bash
#
# Regenerates the vendored Activepieces catalog snapshot.
# Pulls the public (unauthenticated) Activepieces Cloud pieces metadata API:
#   - GET /api/v1/pieces                  -> list of piece summaries
#   - GET /api/v1/pieces/<@scope/name>    -> full detail (auth/actions/triggers/props)
# and writes a single JSON array to src/main/resources/catalog/activepieces-pieces.json
#
# Re-run to refresh. Requires: curl, jq.
set -euo pipefail

API="https://cloud.activepieces.com/api/v1/pieces"
OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/src/main/resources/catalog"
OUT_FILE="$OUT_DIR/activepieces-pieces.json"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

mkdir -p "$OUT_DIR"

echo "Fetching piece list from $API ..."
curl -fsSL "$API" -o "$TMP_DIR/list.json"
jq -r '.[].name' "$TMP_DIR/list.json" > "$TMP_DIR/names.txt"
TOTAL=$(wc -l < "$TMP_DIR/names.txt" | tr -d ' ')
echo "Found $TOTAL pieces. Fetching full detail for each ..."

i=0
while IFS= read -r name; do
  [ -z "$name" ] && continue
  i=$((i + 1))
  # @ is path-safe for curl; encode it defensively anyway.
  enc="${name/@/%40}"
  if curl -fsSL "$API/$enc" -o "$TMP_DIR/piece-$i.json"; then
    printf '\r  [%d/%d] %-50s' "$i" "$TOTAL" "$name"
  else
    echo
    echo "  WARN: failed to fetch $name (skipping)" >&2
    rm -f "$TMP_DIR/piece-$i.json"
  fi
done < "$TMP_DIR/names.txt"
echo

echo "Assembling snapshot ..."
jq -s '.' "$TMP_DIR"/piece-*.json > "$OUT_FILE"

COUNT=$(jq 'length' "$OUT_FILE")
SIZE=$(du -h "$OUT_FILE" | cut -f1)
echo "Wrote $COUNT pieces ($SIZE) -> $OUT_FILE"
