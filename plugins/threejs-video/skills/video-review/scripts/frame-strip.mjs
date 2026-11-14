#!/usr/bin/env node
/**
 * Render a strip of frames for every scene and lay them out as contact sheets.
 *
 *   node frame-strip.mjs --comp Portrait --scenes src/scenes.json --out out/review
 *   [--per 6] [--browser /path/to/chromium]
 *
 * scenes.json is an array of {id, from, dur} in seconds. Run from the Remotion
 * project root. Needs `sharp` for the sheets; without it, frames are still
 * rendered and listed.
 */
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {createRequire} from 'node:module';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((a, v, i, all) => {
    if (v.startsWith('--')) a.push([v.slice(2), all[i + 1]]);
    return a;
  }, [])
);

const comp = args.comp;
const scenesPath = args.scenes ?? 'src/scenes.json';
const out = args.out ?? 'out/review';
const per = Number(args.per ?? 6);
const fps = Number(args.fps ?? 30);
const browser = args.browser;

if (!comp) {
  console.error('usage: frame-strip.mjs --comp <CompositionId> [--scenes src/scenes.json] [--out out/review]');
  process.exit(2);
}

const scenes = JSON.parse(readFileSync(scenesPath, 'utf8'));
mkdirSync(out, {recursive: true});

/** Frames to sample: always the first and last, the rest spread between. */
const sample = (s) => {
  const a = Math.round(s.from * fps);
  const b = Math.round((s.from + s.dur) * fps) - 1;
  const n = Math.max(2, per);
  return Array.from({length: n}, (_, i) => Math.round(a + ((b - a) * i) / (n - 1)));
};

const rendered = [];
for (const s of scenes) {
  const frames = sample(s);
  const files = [];
  for (const f of frames) {
    const file = join(out, `${s.id}-${String(f).padStart(5, '0')}.png`);
    const cmd = ['remotion', 'still', comp, file, `--frame=${f}`, '--log=error'];
    if (browser) cmd.push(`--browser-executable=${browser}`);
    execFileSync('npx', cmd, {stdio: 'inherit'});
    files.push({frame: f, file});
  }
  rendered.push({id: s.id, files});
  console.log(`${s.id}: ${frames.join(', ')}`);
}

writeFileSync(join(out, 'frames.json'), JSON.stringify(rendered, null, 2));

/*
 * Resolve sharp from the PROJECT, not from this script. Once installed, the
 * script lives in the plugin cache, so a plain import() looks for sharp there
 * and never finds the project's copy.
 */
let sharp;
try {
  sharp = createRequire(join(process.cwd(), 'package.json'))('sharp');
} catch {
  console.log(`\nRendered ${rendered.length} scenes into ${out}/. Install \`sharp\` for contact sheets.`);
  process.exit(0);
}

const CELL_W = 270;
const sheet = async (files, path) => {
  const meta = await sharp(files[0].file).metadata();
  const cellH = Math.round((CELL_W * meta.height) / meta.width);
  const tiles = await Promise.all(
    files.map(async (f, i) => ({
      input: await sharp(f.file).resize(CELL_W, cellH).toBuffer(),
      left: 6 + i * (CELL_W + 6),
      top: 6,
    }))
  );
  await sharp({
    create: {
      width: files.length * (CELL_W + 6) + 6,
      height: cellH + 12,
      channels: 3,
      background: '#0a0d14',
    },
  })
    .composite(tiles)
    .png()
    .toFile(path);
};

for (const r of rendered) await sheet(r.files, join(out, `${r.id}.png`));
await sheet(
  rendered.map((r) => r.files[0]),
  join(out, 'index-first-frames.png')
);
console.log(`\nSheets written to ${out}/ — one per scene, plus index-first-frames.png`);
if (!existsSync(join(out, 'index-first-frames.png'))) process.exit(1);
