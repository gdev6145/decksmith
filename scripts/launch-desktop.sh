#!/usr/bin/env bash
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB_DIST="$ROOT/apps/web/dist"

# Build the web app if not built yet (or if source is newer)
if [ ! -d "$WEB_DIST" ] || [ -n "$(find "$ROOT/apps/web/src" -newer "$WEB_DIST/index.html" 2>/dev/null | head -1)" ]; then
  echo "Building web app..."
  (cd "$ROOT" && /home/ghost/.local/node-v24.15.0-linux-x64/bin/pnpm --filter @decksmith/web build)
fi

cd "$ROOT/apps/desktop"
exec ./node_modules/.bin/electron . --no-sandbox --disable-gpu --ozone-platform-hint=auto "$@"