// ---------------------------------------------------------------------------
// Every colour, size, timing and placeholder lives here.
// Change a number in this file rather than hunting through the scenes.
// ---------------------------------------------------------------------------

import sceneTable from './scenes.json';

/**
 * One storyboard scene. `from` and `dur` are seconds; Video.tsx turns them
 * into frames. The captions are burned into the video AND written to
 * captions/captions.srt by `npm run captions`, from this same table.
 */
export type Scene = {
  id: SceneId;
  from: number;
  dur: number;
  caption: string;
};

/** Filled in by the owner. Shown in the final scene. */
export const REPO_URL = 'github.com/Peermoh/free-ai-setup';
export const AUTHOR_NAME = 'Peer Mohamed';

export const FPS = 30;

/** Colours from the project brief. */
export const C = {
  bg: '#141414',
  card: '#1f1f1f',
  cardEdge: '#2e2e2e',
  text: '#f5f5f4',
  muted: '#a8a29e',
  accent: '#f97316', // front desk, highlights
  green: '#22c55e', // success, private
  red: '#ef4444', // problem
} as const;

export const FONT =
  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

/**
 * Scene timings in seconds, straight from the storyboard.
 * `from`/`dur` are converted to frames by Video.tsx, so this stays readable.
 */
// JSON imports widen `id` to string, so assert the narrower union once here.
export const SCENES = sceneTable as readonly Scene[];

export type SceneId =
  | 'hook' | 'twist' | 'problem' | 'frontdesk'
  | 'privacy' | 'scripts' | 'proof' | 'cta';

/** Total length in seconds: 85 s, inside the 75-90 s target. */
export const TOTAL_SECONDS = SCENES.reduce((a, s) => Math.max(a, s.from + s.dur), 0);
export const TOTAL_FRAMES = TOTAL_SECONDS * FPS;

/**
 * Provider names shown as plain text cards.
 * No company logos anywhere, by design.
 */
export const PROVIDERS = ['Groq', 'Gemini', 'NVIDIA', 'OpenRouter'] as const;

/**
 * The real tier labels printed by scripts/add-provider.ps1, with the colours
 * that script uses. Do not invent labels: these are the ones a viewer will see.
 */
export const TIERS = [
  {label: 'FREE', colour: C.green},
  {label: 'FREE TRIAL', colour: C.green},
  {label: 'FREE + PAID', colour: '#eab308'},
  {label: 'CHECK', colour: '#eab308'},
  {label: 'PAID', colour: C.red},
] as const;

/** The three proof stats, all measured on the owner's own setup. */
export const STATS = [
  {big: '15 / 15', small: 'checks passed'},
  {big: 'Fallback', small: 'tested with outages'},
  {big: '72', small: 'tokens per “hello”'},
] as const;
