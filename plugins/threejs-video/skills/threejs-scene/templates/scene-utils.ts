/**
 * Small helpers every isometric scene ends up needing.
 * Copy into the project; do not import from the plugin.
 */
import {Easing, interpolate, spring} from 'remotion';

/**
 * A point on a flat row across an isometric frame.
 * screen-x is (x - z) * 0.866, so (t, y, -t) moves sideways only.
 * The on-screen gap between t and -t is 2 * t * 0.866.
 */
export const row = (t: number, y: number): [number, number, number] => [t, y, -t];

/** 0..1 between two frames, eased. */
export const ease = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.33, 0, 0.2, 1),
  });

/**
 * An entrance spring. Pass a NEGATIVE `at` for the first object of a scene,
 * so it is already part-way in at frame 0 instead of leaving a blank frame.
 */
export const enter = (frame: number, fps: number, at: number, damping = 14) =>
  spring({frame: frame - at, fps, config: {damping}});

/** Gentle float, on a per-object phase so things do not bob in unison. */
export const float = (frame: number, fps: number, phase: number, amp = 0.15) =>
  Math.sin((frame / fps) * 0.7 + phase) * amp;
