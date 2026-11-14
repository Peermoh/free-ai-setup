import React from 'react';
import {GROTESK, INK, MONO} from './constellation-lib';

/**
 * Typographic treatments. The point is that a line of text is built out of
 * parts that look different from each other: filled, outlined, marked,
 * underlined, bracketed. Plain weight-and-size alone reads as undesigned.
 *
 * All sizes are in design-space pixels (the 1080 square), so these go inside
 * a <DesignFrame>.
 */

export const VIOLET_HI = '#8b5cff';

/** Solid display text. */
export const Fill: React.FC<{size: number; children: React.ReactNode}> = ({
  size,
  children,
}) => (
  <span style={{fontFamily: GROTESK, fontWeight: 700, fontSize: size, color: INK}}>
    {children}
  </span>
);

/** Hollow display text, for the half of a headline that should recede. */
export const Outline: React.FC<{size: number; children: React.ReactNode}> = ({
  size,
  children,
}) => (
  <span
    style={{
      fontFamily: GROTESK,
      fontWeight: 700,
      fontSize: size,
      color: 'transparent',
      WebkitTextStroke: `${Math.max(1.4, size * 0.016)}px ${INK}`,
    }}
  >
    {children}
  </span>
);

/** A word sitting in a solid accent block — the eye lands here first. */
export const Marked: React.FC<{size: number; children: React.ReactNode}> = ({
  size,
  children,
}) => (
  <span
    style={{
      fontFamily: GROTESK,
      fontWeight: 700,
      fontSize: size,
      color: '#140b2e',
      background: VIOLET_HI,
      padding: `${size * 0.04}px ${size * 0.13}px`,
      borderRadius: size * 0.08,
      boxDecorationBreak: 'clone',
      WebkitBoxDecorationBreak: 'clone',
    }}
  >
    {children}
  </span>
);

/** Mono text with a hairline rule under it, like the reference's prompt. */
export const Underlined: React.FC<{size: number; children: React.ReactNode}> = ({
  size,
  children,
}) => (
  <span
    style={{
      fontFamily: MONO,
      fontSize: size,
      color: INK,
      borderBottom: `${Math.max(1, size * 0.045)}px solid rgba(190,165,255,.65)`,
      paddingBottom: size * 0.12,
    }}
  >
    {children}
  </span>
);

/** Corner ticks around a block: makes any group look placed, not pasted. */
export const Framed: React.FC<{
  children: React.ReactNode;
  pad?: number;
  tick?: number;
  label?: string;
}> = ({children, pad = 26, tick = 22, label}) => {
  const corner = (pos: React.CSSProperties, borders: React.CSSProperties) => (
    <div
      style={{
        position: 'absolute',
        width: tick,
        height: tick,
        borderColor: 'rgba(190,165,255,.8)',
        borderStyle: 'solid',
        borderWidth: 0,
        ...pos,
        ...borders,
      }}
    />
  );
  return (
    <div style={{position: 'relative', padding: pad, display: 'inline-block'}}>
      {corner({left: 0, top: 0}, {borderLeftWidth: 2, borderTopWidth: 2})}
      {corner({right: 0, top: 0}, {borderRightWidth: 2, borderTopWidth: 2})}
      {corner({left: 0, bottom: 0}, {borderLeftWidth: 2, borderBottomWidth: 2})}
      {corner({right: 0, bottom: 0}, {borderRightWidth: 2, borderBottomWidth: 2})}
      {label ? (
        <div
          style={{
            position: 'absolute',
            left: pad,
            top: -10,
            fontFamily: MONO,
            fontSize: 15,
            letterSpacing: 2,
            color: 'rgba(190,165,255,.9)',
            background: '#06040e',
            padding: '0 8px',
          }}
        >
          {label}
        </div>
      ) : null}
      {children}
    </div>
  );
};

/** A ruler of ticks — pure ornament, but it reads as measurement. */
export const Measure: React.FC<{width: number; count?: number; label?: string}> = ({
  width,
  count = 28,
  label,
}) => (
  <div style={{width, marginTop: 14}}>
    <div style={{display: 'flex', alignItems: 'flex-end', gap: (width - count * 2) / (count - 1)}}>
      {Array.from({length: count}).map((_, i) => (
        <div
          key={i}
          style={{
            width: 2,
            height: i % 5 === 0 ? 13 : 7,
            background: i % 5 === 0 ? 'rgba(190,165,255,.85)' : 'rgba(190,165,255,.38)',
          }}
        />
      ))}
    </div>
    {label ? (
      <div
        style={{
          marginTop: 7,
          fontFamily: MONO,
          fontSize: 14,
          letterSpacing: 2,
          color: 'rgba(236,234,255,.45)',
        }}
      >
        {label}
      </div>
    ) : null}
  </div>
);

/** A small uppercase mono tag. */
export const Tag: React.FC<{children: React.ReactNode; tone?: string}> = ({
  children,
  tone = 'rgba(190,165,255,.9)',
}) => (
  <span
    style={{
      fontFamily: MONO,
      fontSize: 16,
      fontWeight: 700,
      letterSpacing: 2,
      color: tone,
      border: `1.4px solid ${tone}`,
      borderRadius: 4,
      padding: '4px 10px',
    }}
  >
    {children}
  </span>
);

/** Rotated label down the side of the frame. */
export const SideLabel: React.FC<{children: React.ReactNode; right?: boolean}> = ({
  children,
  right,
}) => (
  <div
    style={{
      position: 'absolute',
      [right ? 'right' : 'left']: 26,
      top: '50%',
      /*
       * writing-mode, not rotate(): a rotated element keeps the footprint of
       * its unrotated width, so a long label silently overlaps whatever is in
       * the middle of the frame. Vertical text is actually narrow.
       */
      writingMode: 'vertical-rl',
      transform: `translateY(-50%)${right ? '' : ' rotate(180deg)'}`,
      fontFamily: MONO,
      fontSize: 15,
      letterSpacing: 6,
      color: 'rgba(236,234,255,.32)',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </div>
);
