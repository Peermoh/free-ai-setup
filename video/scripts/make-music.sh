#!/usr/bin/env bash
# Generates the background track into public/music.mp3.
# The key is injected by the network proxy; no key is read here.
set -euo pipefail
cd "$(dirname "$0")/.."

LEN_MS="${LEN_MS:-60000}"
PROMPT="${PROMPT:-Cinematic synthwave with a solid beat. Wide analog pads and a pulsing bass arpeggio over punchy kick, snare and crisp hi-hats. Hopeful, modern tech documentary energy, 112 BPM, no vocals, steady groove that drives a tutorial forward without crowding a narrator.}"

body=$(python3 -c "
import json,sys
print(json.dumps({'prompt': sys.argv[1], 'music_length_ms': int(sys.argv[2])}))" "$PROMPT" "$LEN_MS")

code=$(curl -sS -X POST 'https://api.elevenlabs.io/v1/music' \
  -H 'Content-Type: application/json' -d "$body" \
  -o public/music.mp3 -w '%{http_code}')

if [ "$code" != "200" ]; then
  echo "FAILED: HTTP $code" >&2; head -c 300 public/music.mp3 >&2; echo >&2
  rm -f public/music.mp3; exit 1
fi
echo "public/music.mp3  $(wc -c < public/music.mp3) bytes"
