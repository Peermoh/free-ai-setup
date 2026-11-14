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
  /** True on scenes carrying a screenshot: the camera nearly stops so it reads. */
  settle: boolean;
  /** How the camera moves across this scene. */
  cam: 'push' | 'pull' | 'panL' | 'panR';
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
  | 'hook' | 'flow' | 'install' | 'keys' | 'local'
  | 'gpu' | 'order' | 'proof' | 'cta';

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

/**
 * Optional background music.
 *
 * The video is designed to work in silence: LinkedIn autoplays muted and all
 * meaning is in the captions. Music is a nice-to-have on top.
 *
 * To add it: drop a file in video/public/ and put its name here, e.g.
 *   export const MUSIC_FILE: string | null = 'music.mp3';
 * Set it back to null to render silent again. Use a track you are licensed
 * to use; do not commit music you do not have the rights to.
 */
export const MUSIC_FILE: string | null = 'music.mp3';

/** How loud the music sits under the video (0 = silent, 1 = full). */
export const MUSIC_VOLUME = 0.26;

/** How far the music drops while a line of narration is playing. */
export const MUSIC_DUCK = 0.11;

/** Seconds of fade-out at the very end, so it does not cut off abruptly. */
export const MUSIC_FADE_SECONDS = 2;

/**
 * Narration.
 *
 * One clip per scene lives in public/vo/<scene id>.mp3, spoken by ElevenLabs
 * and regenerated with `npm run voiceover`. The words are exactly the scene
 * captions, so what is heard and what is read never differ.
 *
 * The video must still work in silence: LinkedIn autoplays muted. Narration
 * is an addition, never the only carrier of meaning. Set this to false to
 * render silent.
 */
export const VOICEOVER = true;

/** Narration volume (0-1). */
export const VOICEOVER_VOLUME = 1;

/** A short beat after a scene starts before the voice comes in. */
export const VOICEOVER_DELAY_SECONDS = 0.4;

/** The ElevenLabs voice used. Change it and re-run `npm run voiceover`. */
export const VOICEOVER_VOICE = 'Matilda (XrExE9yKIg1WjnnlVkGX)';
