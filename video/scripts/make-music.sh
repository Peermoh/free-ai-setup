#!/usr/bin/env bash
# Generates the background track into public/music.mp3.
# The key is injected by the network proxy; no key is read here.
set -euo pipefail
cd "$(dirname "$0")/.."

LEN_MS="${LEN_MS:-70000}"
PROMPT="${PROMPT:-Minimal electronic underscore for a focused technical walkthrough. Soft pulsing synth arpeggio, warm sub bass, gentle hi-hats, hopeful and clean, steady 100 BPM, no vocals, no sudden drops, sits quietly under a narrator.}"

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
