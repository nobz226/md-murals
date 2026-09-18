#!/usr/bin/env bash
# Submit all 5 issues to the md-murals GitHub repo.
# Requires: gh CLI installed and authenticated.
# POSIX-safe: works on macOS bash 3.2 (no associative arrays).

set -euo pipefail

REPO="nobz226/md-murals"
DIR="$(cd "$(dirname "$0")" && pwd)"

IDS=(01 02 03 04 05)
TITLES=(
  "Delete project/image fails on seeded records — ctx.storage.delete(undefined) crashes the mutation"
  "Cannot upload/replace nav-hover and nav-click sounds — mutation validators missing the two types"
  "Duplicate 'About Page Settings' form on Admin dashboard"
  "/about route missing from App.jsx; pages/About.jsx is unreachable dead code"
  "Grid vs. bounds mismatch after zoom — gap recalculated without re-laying out grid items"
)

for i in "${!IDS[@]}"; do
  id="${IDS[$i]}"
  body_file="$(ls "$DIR" | grep "^$id-" | head -1)"
  echo "Creating issue $id: ${TITLES[$i]}"
  gh issue create --repo "$REPO" \
    --title "${TITLES[$i]}" \
    --body-file "$DIR/$body_file" \
    --label "bug"
done

echo "Done. All ${#IDS[@]} issues submitted."