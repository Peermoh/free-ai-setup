import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * Motion helpers.
 *
 * The rule this file exists to enforce: something should change on screen
 * roughly every second. A scene is a sequence of small arrivals, not a static
 * composition with a drifting camera over it.
 *
 * Every helper takes a `delay` in frames, relative to the start of the scene,
 * so a scene reads as a list of beats.
 */

/** 0 to 1, springy, after `delay` frames. */
export const useIn = (delay = 0, damping = 200) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping}});
};

/** Fade and lift into place. The default beat for almost everything. */
export const Rise: React.FC<{
  delay?: number;
  y?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({delay = 0, y = 26, children, style}) => {
  const p = useIn(delay);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * y}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Reveal by uncovering left to right — good for a marked or filled word. */
export const Wipe: React.FC<{
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({delay = 0, children, style}) => {
  const p = useIn(delay, 220);
  return (
    <span
      style={{
        display: 'inline-block',
        clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/** Pop in with a slight overshoot — for tags and chips. */
export const Pop: React.FC<{delay?: number; children: React.ReactNode}> = ({
  delay = 0,
  children,
}) => {
  const p = useIn(delay, 12);
  return (
    <div style={{opacity: Math.min(1, p * 1.6), transform: `scale(${0.82 + p * 0.18})`}}>
      {children}
    </div>
  );
};

/** A screenshot arriving: fade, settle up, and keep drifting very slightly. */
export const ShotIn: React.FC<{delay?: number; children: React.ReactNode}> = ({
  delay = 0,
  children,
}) => {
  const frame = useCurrentFrame();
  const p = useIn(delay, 190);
  // never completely still: a slow breath keeps it from looking like a photo
  const breathe = 1 + Math.sin((frame - delay) / 70) * 0.004;
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * 34}px) scale(${(0.965 + p * 0.035) * breathe})`,
      }}
    >
      {children}
    </div>
  );
};

/** Count a number up. */
export const useCount = (to: number, delay = 0, frames = 26) => {
  const frame = useCurrentFrame();
  return Math.round(
    interpolate(frame, [delay, delay + frames], [0, to], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
};

/** Caption revealed word by word, so the line itself is moving. */
export const Words: React.FC<{
  text: string;
  delay?: number;
  per?: number;
  style?: React.CSSProperties;
}> = ({text, delay = 2, per = 1.6, style}) => {
  const frame = useCurrentFrame();
  return (
    <span style={style}>
      {text.split(' ').map((w, i) => {
        const t = interpolate(frame, [delay + i * per, delay + i * per + 7], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <span
            key={`${w}-${i}`}
            style={{
              display: 'inline-block',
              opacity: t,
              transform: `translateY(${(1 - t) * 14}px)`,
            }}
          >
            {w}
            {' '}
          </span>
        );
      })}
    </span>
  );
};

/**
 * A short flash and scan-line at every cut, so scenes change rather than
 * simply replacing one another.
 */
export const CutFlash: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame > 10) return null;
  const a = interpolate(frame, [0, 3, 10], [0.5, 0.22, 0], {extrapolateRight: 'clamp'});
  const y = interpolate(frame, [0, 10], [0, 130], {extrapolateRight: 'clamp'});
  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(150,110,255,.65) 0%, rgba(120,80,255,.15) 60%, transparent 100%)',
          opacity: a,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${y}%`,
          height: 2,
          background: 'rgba(220,200,255,.85)',
          opacity: a * 1.6,
          pointerEvents: 'none',
        }}
      />
    </>
  );
};
