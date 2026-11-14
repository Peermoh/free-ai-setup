import {useVideoConfig} from 'remotion';

/**
 * Everything is designed against a 1080x1080 square. `useScale()` returns the
 * factor to multiply design pixels by, so the same scenes work in 1920x1080:
 * it scales on the SHORTER side, so nothing grows past the top and bottom.
 */
export const useScale = () => {
  const {width, height} = useVideoConfig();
  return Math.min(width, height) / 1080;
};

/** Keep every important element inside 90% of the frame. */
export const SAFE = 0.9;

/** True when the composition is wider than it is tall (the Landscape cut). */
export const useIsWide = () => {
  const {width, height} = useVideoConfig();
  return width > height;
};
