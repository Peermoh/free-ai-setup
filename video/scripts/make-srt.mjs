// Writes captions/captions.srt from src/scenes.json, the same table the video
// burns in. Run with: npm run captions
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const scenes = JSON.parse(readFileSync(join(here, '..', 'src', 'scenes.json'), 'utf8'));

/** Seconds -> "HH:MM:SS,mmm" as SubRip requires. */
const stamp = (sec) => {
  const ms = Math.round(sec * 1000);
  const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
  const f = String(ms % 1000).padStart(3, '0');
  return `${h}:${m}:${s},${f}`;
};

const srt = scenes
  .map((sc, i) => `${i + 1}\n${stamp(sc.from)} --> ${stamp(sc.from + sc.dur)}\n${sc.caption}\n`)
  .join('\n');

mkdirSync(join(here, '..', 'captions'), {recursive: true});
writeFileSync(join(here, '..', 'captions', 'captions.srt'), srt, 'utf8');
console.log(`captions/captions.srt written (${scenes.length} cues, ${scenes.at(-1).from + scenes.at(-1).dur}s)`);
