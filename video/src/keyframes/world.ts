/**
 * The world and the ten beats, as data.
 *
 * One persistent isometric scene is built up across the film. Each beat is a
 * state of that world: what exists, what is highlighted, and where the camera
 * looks. The keyframe stills render these states; the animation will later
 * move between them.
 */

export type V3 = [number, number, number];

/** Flat row across an isometric frame: screen-x is (x - z) * 0.866. */
export const row = (t: number, y: number): V3 => [t, y, -t];

export const BG = '#081426';
export const WIRE = '#eaf3ff';
export const CYAN = '#4bd8ff';
export const RED = '#ff5d6c';
export const GREEN = '#4ade80';
export const TOWER = ['#22d3ee', '#e879f9', '#facc15'] as const;

export const LAPTOP: V3 = [0, -7, 0];
export const SLOT: V3 = row(3.4, -7);
export const CUBE: V3 = [0, -4.6, 0];
export const TOWERS: V3[] = [row(-3.3, 5.6), [0, 6.1, 0], row(3.3, 5.6)];
export const HUB: V3 = [0, 0.4, 0];

/**
 * Camera framing per beat. An orthographic camera on the (1,1,1) diagonal,
 * looking at `target`, `zoom` pixels per world unit.
 */
export type Beat = {
  id: string;
  text: string;
  sub?: string;
  target: V3;
  zoom: number;
};

export const BEATS: Beat[] = [
  {id: 'hook', text: 'YOUR OWN AI', sub: 'on the laptop you already have', target: [0, -4.6, 0], zoom: 118},
  {id: 'nogpu', text: 'NO BIG GPU', target: row(1.5, -5.0), zoom: 100},
  {id: 'still', text: 'STILL WORKS', sub: 'and bigger with a GPU', target: row(1.2, -4.2), zoom: 96},
  {id: 'three', text: 'THREE THINGS', target: [0, 5.4, 0], zoom: 64},
  {id: 'local', text: '1 · OLLAMA', sub: 'a model on your machine', target: row(-3.3, 4.2), zoom: 84},
  {id: 'tiers', text: '2 · FREE TIERS', target: [0, 4.6, 0], zoom: 66},
  {id: 'gpu', text: '3 · FREE GPU', sub: 'Kaggle gives you two', target: row(3.3, 4.2), zoom: 84},
  {id: 'route', text: 'OMNIROUTE', sub: 'an open source router', target: [0, 3.0, 0], zoom: 56},
  {id: 'chat', text: 'ONE CHAT PAGE', sub: 'Open WebUI', target: [0, -1.2, 0], zoom: 50},
  {id: 'cta', text: '', target: [0, -2.4, 0], zoom: 50},
];

/*
 * Exact screen position of a world point, for HTML labels.
 * For an orthographic camera on the (1,1,1) diagonal the screen axes are
 *   right = (1, 0, -1) / sqrt 2
 *   up    = (-1, 2, -1) / sqrt 6
 * so a label can be pinned to an object without a 3D text library.
 */
const R: V3 = [Math.SQRT1_2, 0, -Math.SQRT1_2];
const U: V3 = [-1 / Math.sqrt(6), 2 / Math.sqrt(6), -1 / Math.sqrt(6)];

export const toScreen = (
  p: V3,
  beat: Beat,
  width: number,
  height: number
): {x: number; y: number} => {
  const d: V3 = [p[0] - beat.target[0], p[1] - beat.target[1], p[2] - beat.target[2]];
  const sx = d[0] * R[0] + d[1] * R[1] + d[2] * R[2];
  const sy = d[0] * U[0] + d[1] * U[1] + d[2] * U[2];
  return {x: width / 2 + sx * beat.zoom, y: height / 2 - sy * beat.zoom};
};
