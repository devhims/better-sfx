#!/bin/bash
# Turns the SVGs from src/icons.mjs into the PNGs browsers and social sites
# need. Run locally after changing the icon: npm run icons
# Needs Google Chrome (headless) and ffmpeg.
set -e
cd "$(dirname "$0")/.."
node src/icons.mjs

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
PROFILE="$(mktemp -d)"
trap 'rm -rf "$PROFILE" out/icon-512.png' EXIT

shot() { # svg-file width height output
  "$CHROME" --headless=new --no-sandbox --disable-gpu --disable-gpu-sandbox --in-process-gpu --use-angle=swiftshader --hide-scrollbars --no-first-run \
    --user-data-dir="$PROFILE" --default-background-color=00000000 \
    --window-size="$2,$3" --screenshot="$PWD/$4" "file://$PWD/$1" >/dev/null 2>&1
}

shot dist/favicon.svg 512 512 out/icon-512.png
shot out/og.svg 1200 630 dist/og.png

# Chrome will not open a window narrower than 500 px, so the small sizes are
# scaled down from the 512 px render.
ffmpeg -v error -y -i out/icon-512.png -vf scale=180:180:flags=lanczos dist/apple-touch-icon.png
ffmpeg -v error -y -i out/icon-512.png -vf scale=32:32:flags=lanczos dist/favicon-32.png
# favicon.ico for browsers and crawlers that ask for it by name.
ffmpeg -v error -y -i out/icon-512.png -vf scale=32:32:flags=lanczos dist/favicon.ico
cp out/icon-512.png dist/icon-512.png
echo >&2 "icons: dist/apple-touch-icon.png, dist/favicon-32.png, dist/favicon.ico, dist/icon-512.png, dist/og.png"
