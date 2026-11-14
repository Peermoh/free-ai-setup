import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useScale} from '../layout';

/**
 * Shared pieces for the Constellation look.
 *
 * Everything is authored in a 1080x1080 "design space" and the whole frame is
 * scaled once at the end, so no measurement has to be multiplied by a scale
 * factor and the perspective maths stays readable.
 */

export const MONO = '"JetBrains Mono", monospace';
export const GROTESK = '"Space Grotesk", sans-serif';
export const INK = '#eceaff';
export const VIOLET = '#9a6bff';
export const AMBER = '#ff9a3c';
export const GREEN = '#3ddc84';
export const RED = '#ff5d5d';

/** Camera distance. Smaller = stronger perspective. */
export const CAM = 900;

export type P3 = {x: number; y: number; z: number};

/**
 * Perspective projection. z = 0 is the camera plane; larger z is further away.
 * Returns where the point lands in design space and how much it shrinks.
 */
export const project = (p: P3, cx = 540, cy = 540) => {
  const k = CAM / (CAM + p.z);
  return {x: cx + p.x * k, y: cy + p.y * k, k};
};

/** Scales the 1080-square design space to whatever the composition is. */
export const DesignFrame: React.FC<{children: React.ReactNode}> = ({children}) => {
  const s = useScale();
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 1080,
          height: 1080,
          marginLeft: -540,
          marginTop: -540,
          transform: `scale(${s})`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/** Violet depth bloom + vignette. */
export const Atmosphere: React.FC = () => (
  <>
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(48% 36% at 28% 24%, rgba(122,70,255,.42) 0%, transparent 70%),' +
          'radial-gradient(44% 34% at 80% 70%, rgba(196,74,255,.26) 0%, transparent 72%),' +
          'radial-gradient(80% 54% at 50% 112%, rgba(66,34,170,.55) 0%, transparent 72%)',
      }}
    />
    <AbsoluteFill
      style={{
        background: 'radial-gradient(72% 62% at 50% 46%, transparent 42%, rgba(0,0,0,.72) 100%)',
      }}
    />
  </>
);

/** Receding floor, faded out at the horizon. */
export const Floor: React.FC<{drift: number}> = ({drift}) => {
  const s = useScale();
  return (
    <AbsoluteFill style={{perspective: `${640 * s}px`, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: '-60%',
          right: '-60%',
          top: '58%',
          height: '100%',
          transform: 'rotateX(75deg)',
          transformOrigin: 'top center',
          backgroundImage:
            `repeating-linear-gradient(0deg, rgba(176,150,255,.34) 0 1.4px, transparent 1.4px ${118 * s}px),` +
            `repeating-linear-gradient(90deg, rgba(176,150,255,.22) 0 1.4px, transparent 1.4px ${118 * s}px)`,
          backgroundPosition: `0 ${drift * s}px`,
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,.9) 0%, transparent 56%)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,.9) 0%, transparent 56%)',
        }}
      />
    </AbsoluteFill>
  );
};

/** Corner telemetry. */
export const Hud: React.FC<{tl: string; tr: string; bl: string; br: string}> = ({
  tl,
  tr,
  bl,
  br,
}) => {
  const s = useScale();
  const base: React.CSSProperties = {
    position: 'absolute',
    fontFamily: MONO,
    fontSize: 15 * s,
    letterSpacing: 1.3,
    color: 'rgba(236,234,255,.45)',
    whiteSpace: 'pre',
  };
  return (
    <>
      <div style={{...base, left: 34 * s, top: 30 * s}}>{tl}</div>
      <div style={{...base, right: 34 * s, top: 30 * s}}>{tr}</div>
      <div style={{...base, left: 34 * s, bottom: 28 * s}}>{bl}</div>
      <div style={{...base, right: 34 * s, bottom: 28 * s}}>{br}</div>
    </>
  );
};

/**
 * A node in the constellation: a provider, the router, or the laptop.
 * Drawn at its projected position, shrunk and dimmed with distance.
 */
export const Node: React.FC<{
  p: P3;
  label: string;
  sub?: string;
  tone?: 'ink' | 'router' | 'open' | 'closed';
  state?: string;
}> = ({p, label, sub, tone = 'ink', state}) => {
  const {x, y, k} = project(p);
  const colour =
    tone === 'router' ? AMBER : tone === 'open' ? GREEN : tone === 'closed' ? RED : INK;
  // Far things are smaller, dimmer and very slightly soft.
  const dim = Math.max(0.3, Math.min(1, k * 1.25));
  const blur = k < 0.62 ? (0.62 - k) * 7 : 0;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%,-50%) scale(${k})`,
        opacity: dim,
        filter: blur ? `blur(${blur}px)` : undefined,
      }}
    >
      <div
        style={{
          padding: '18px 26px',
          borderRadius: 14,
          border: `1.6px solid ${colour}${tone === 'ink' ? '55' : 'cc'}`,
          background: 'rgba(10,8,22,.72)',
          boxShadow: tone === 'ink' ? 'none' : `0 0 44px ${colour}44`,
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{fontFamily: GROTESK, fontWeight: 700, fontSize: 34, color: INK}}>
          {label}
        </div>
        {sub ? (
          <div style={{fontFamily: MONO, fontSize: 19, color: 'rgba(236,234,255,.55)', marginTop: 4}}>
            {sub}
          </div>
        ) : null}
        {state ? (
          <div
            style={{
              marginTop: 9,
              display: 'inline-block',
              padding: '3px 12px',
              borderRadius: 999,
              border: `1.4px solid ${colour}`,
              color: colour,
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 17,
              letterSpacing: 1,
            }}
          >
            {state}
          </div>
        ) : null}
      </div>
    </div>
  );
};

/** Connection lines, drawn in 2D after projecting both ends. */
export const Links: React.FC<{
  from: P3;
  to: P3[];
  highlight?: number;
  dim?: boolean;
}> = ({from, to, highlight, dim}) => {
  const a = project(from);
  return (
    <svg
      width={1080}
      height={1080}
      style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}
    >
      {to.map((t, i) => {
        const b = project(t);
        const lit = highlight === i;
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={lit ? GREEN : INK}
            strokeOpacity={lit ? 0.85 : dim ? 0.1 : 0.22}
            strokeWidth={lit ? 2.4 : 1.2}
          />
        );
      })}
    </svg>
  );
};
