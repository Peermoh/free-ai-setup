#!/usr/bin/env bash
# Generates one narration clip per scene from src/scenes.json into public/vo/.
#
# The ElevenLabs key is NOT read here: in this cloud environment the network
# proxy injects it into requests to api.elevenlabs.io. Running this elsewhere
# needs an "xi-api-key" header adding below.
set -euo pipefail
cd "$(dirname "$0")/.."

VOICE_ID="${VOICE_ID:-XrExE9yKIg1WjnnlVkGX}"   # Matilda - professional, informative
MODEL="${MODEL:-eleven_multilingual_v2}"
mkdir -p public/vo

python3 -c "
import json
for s in json.load(open('src/scenes.json')):
    print(s['id'] + '\t' + s['caption'])
" | while IFS=$'\t' read -r id text; do
  body=$(python3 -c "
import json,sys
print(json.dumps({
  'text': sys.argv[1],
  'model_id': sys.argv[2],
  'voice_settings': {'stability': 0.5, 'similarity_boost': 0.75, 'style': 0.0}
}))" "$text" "$MODEL")

  code=$(curl -sS -X POST \
    "https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128" \
    -H 'Content-Type: application/json' \
    -d "$body" \
    -o "public/vo/${id}.mp3" -w '%{http_code}')

  if [ "$code" != "200" ]; then
    echo "FAILED ${id}: HTTP ${code}" >&2
    head -c 300 "public/vo/${id}.mp3" >&2; echo >&2
    rm -f "public/vo/${id}.mp3"
    exit 1
  fi
  echo "  ${id}.mp3  $(wc -c < "public/vo/${id}.mp3") bytes"
done
echo "voiceover written to public/vo/"
