import React from 'react';
import {Easing, interpolate, spring} from 'remotion';
import '@fontsource/sora/600.css';
import '@fontsource/sora/800.css';

/*
 * Shared pieces for the flat film: palette, motion helpers, and the cute
 * characters. Everything is a pure function of the frame number.
 */
export const FPS = 30;
export const BG = '#000000';
export const CARD = '#1c1c22';
export const INK = '#ffffff';
export const SOFT = '#b8b8c4';
export const SKY = '#4cc9f0';
export const CORAL = '#ff6b6b';
export const SUN = '#ffc93c';
export const MINT = '#2ec4a0';
export const FONT = 'Sora, sans-serif';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Bouncy 0 -> 1 (overshoots past 1 before settling). */
export const bounce = (frame: number, delay: number, stiffness = 170, damping = 10) =>
  spring({frame: frame - delay, fps: FPS, config: {stiffness, damping, mass: 0.8}});

/**
 * Squash and stretch from a bouncy value: while it overshoots it gets wider
 * and shorter, as if landing; while it undershoots it gets tall and thin.
 */
export const squash = (p: number) => {
  const k = Math.max(-0.22, Math.min(0.22, (p - 1) * 1.3));
  return {sx: p * (1 + k), sy: p * (1 - k)};
};

/** 1 -> 0 over the last `len` frames of a scene, ending exactly at `end`. */
export const exit = (frame: number, end: number, len = 9, lead = 0) =>
  interpolate(frame, [end - len - lead, end - lead], [1, 0], {...clamp, easing: Easing.in(Easing.back(2))});

/** Gentle idle bob, in pixels. */
export const bob = (frame: number, amp = 8, period = 44, phase = 0) =>
  Math.sin(((frame + phase) / period) * Math.PI * 2) * amp;

/** True for 4 frames at each blink time. */
export const blinking = (frame: number, at: number[]) => at.some((t) => frame >= t && frame < t + 4);

/* ---------------- face ---------------- */
export type Mood = 'happy' | 'sad' | 'wow';
export const Face: React.FC<{x: number; y: number; s?: number; blink?: boolean; mood?: Mood; look?: [number, number]; ink?: string}> = ({
  x, y, s = 1, blink = false, mood = 'happy', look = [0, 0], ink = '#1d1b3a',
}) => (
  <g transform={`translate(${x}, ${y}) scale(${s})`}>
    {[-34, 34].map((ex) => (
      <ellipse key={ex} cx={ex + look[0]} cy={look[1]} rx={11} ry={blink ? 1.5 : 14} fill={ink} />
    ))}
    {!blink ? [-34, 34].map((ex) => <circle key={ex} cx={ex + look[0] + 4} cy={look[1] - 5} r={4} fill="#fff" />) : null}
    <ellipse cx={-56} cy={26} rx={13} ry={7} fill={CORAL} opacity={0.55} />
    <ellipse cx={56} cy={26} rx={13} ry={7} fill={CORAL} opacity={0.55} />
    {mood === 'happy' ? <path d="M-16,24 Q0,40 16,24" fill="none" stroke={ink} strokeWidth={7} strokeLinecap="round" /> : null}
    {mood === 'sad' ? <path d="M-16,36 Q0,22 16,36" fill="none" stroke={ink} strokeWidth={7} strokeLinecap="round" /> : null}
    {mood === 'wow' ? <ellipse cx={0} cy={32} rx={9} ry={11} fill={ink} /> : null}
  </g>
);

export const Shadow: React.FC<{y: number; w: number; o?: number}> = ({y, w, o = 1}) => (
  <ellipse cx={0} cy={y} rx={w / 2} ry={w / 12} fill="#000" opacity={0.22 * o} />
);

export const Star: React.FC<{x: number; y: number; r: number; c: string; rot?: number}> = ({x, y, r, c, rot = 0}) => (
  <path
    transform={`rotate(${rot} ${x} ${y})`}
    d={`M${x},${y - r} Q${x},${y} ${x + r},${y} Q${x},${y} ${x},${y + r} Q${x},${y} ${x - r},${y} Q${x},${y} ${x},${y - r} Z`}
    fill={c}
  />
);

/* ---------------- characters ---------------- */
/** Laptop, origin at the top-centre of the lid; base sits at y = 370. */
export const Laptop: React.FC<{light?: number; children?: React.ReactNode}> = ({light = 1, children}) => (
  <g>
    <rect x={-280} y={0} width={560} height={330} rx={26} fill="#2a2a31" />
    <rect x={-258} y={22} width={516} height={286} rx={14} fill="#f4f5ff" opacity={light} />
    {children}
    <polygon points="-340,332 340,332 300,370 -300,370" fill="#3e3e48" />
  </g>
);

const Fan: React.FC<{cx: number; spin: number}> = ({cx, spin}) => (
  <g>
    <circle cx={cx} cy={110} r={34} fill="#2b2b2b" />
    <g transform={`rotate(${spin} ${cx} 110)`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={cx} cy={92} rx={9} ry={17} fill="#5a5a5a" transform={`rotate(${a} ${cx} 110)`} />
      ))}
    </g>
    <circle cx={cx} cy={110} r={8} fill={SUN} />
  </g>
);

/** Graphics card in a 240 x 210 box; the two fans are its eyes. */
export const Gpu: React.FC<{spin?: number; mood?: Mood}> = ({spin = 0, mood = 'happy'}) => (
  <g>
    <rect x="20" y="62" width="200" height="96" rx="16" fill={SUN} />
    <Fan cx={80} spin={spin} />
    <Fan cx={160} spin={spin} />
    <ellipse cx={42} cy={140} rx={9} ry={5} fill={CORAL} opacity={0.6} />
    <ellipse cx={198} cy={140} rx={9} ry={5} fill={CORAL} opacity={0.6} />
    {mood === 'happy' ? <path d="M110,138 Q120,150 130,138" fill="none" stroke="#7a5800" strokeWidth={5} strokeLinecap="round" /> : null}
    {mood === 'sad' ? <path d="M110,150 Q120,138 130,150" fill="none" stroke="#7a5800" strokeWidth={5} strokeLinecap="round" /> : null}
    {[40, 62, 84, 106, 128, 150, 172].map((x) => (
      <rect key={x} x={x} y="160" width="12" height="16" rx="2" fill="#d99e00" />
    ))}
  </g>
);

/* ---------------- title ---------------- */
/** Capitals that drop in one letter at a time, land with a squash, then settle. */
export const Title: React.FC<{frame: number; text: string; sub?: string; delay?: number; out?: number}> = ({
  frame, text, sub, delay = 0, out = 1,
}) => {
  const letters = text.toUpperCase().split('');
  const subDelay = delay + letters.length * 1.6 + 6;
  const ps = bounce(frame, subDelay, 200, 12);
  return (
    <div style={{position: 'absolute', top: 220, left: 40, right: 40, textAlign: 'center', opacity: out, transform: `scale(${0.85 + 0.15 * out})`}}>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 96, color: INK, lineHeight: 1.05, whiteSpace: 'pre-wrap'}}>
        {letters.map((ch, i) => {
          const p = bounce(frame, delay + i * 1.6, 220, 9);
          const {sx, sy} = squash(p);
          const tilt = (1 - Math.min(p, 1)) * (i % 2 ? 24 : -24);
          return (
            <span key={i} style={{display: 'inline-block', opacity: Math.min(1, p * 3),
              transform: `translateY(${(1 - p) * -160}px) rotate(${tilt}deg) scale(${sx}, ${sy})`, transformOrigin: '50% 100%'}}>
              {ch === ' ' ? ' ' : ch}
            </span>
          );
        })}
      </div>
      {sub ? (
        <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 40, letterSpacing: 2, color: SOFT, marginTop: 18,
          opacity: Math.min(1, ps * 2), transform: `translateY(${(1 - ps) * 50}px) scale(${0.7 + 0.3 * ps})`}}>
          {sub.toUpperCase()}
        </div>
      ) : null}
    </div>
  );
};
