import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {AMBER, GREEN, GROTESK, INK, MONO, VIOLET} from '../design/world';

/**
 * The setup, drawing itself.
 *
 * Boxes arrive in order and the arrows grow between them, so the viewer sees
 * the shape being assembled rather than presented finished.
 */

export type FlowBox = {
  id: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  w?: number;
  at: number;
  tone?: 'ink' | 'router' | 'green';
};

export type FlowArrow = {from: string; to: string; at: number};

const colourOf = (t?: string) => (t === 'router' ? AMBER : t === 'green' ? GREEN : INK);

export const Flow: React.FC<{
  boxes: FlowBox[];
  arrows: FlowArrow[];
  width?: number;
  height?: number;
}> = ({boxes, arrows, width = 1000, height = 620}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const byId = Object.fromEntries(boxes.map((b) => [b.id, b]));

  return (
    <div style={{position: 'relative', width, height}}>
      <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
        <defs>
          <marker id="ah" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,0 L9,4.5 L0,9 z" fill="rgba(190,170,255,.85)" />
          </marker>
        </defs>
        {arrows.map((a, i) => {
          const f = byId[a.from];
          const t = byId[a.to];
          if (!f || !t) return null;
          const p = interpolate(frame, [a.at, a.at + 12], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const x1 = f.x;
          const y1 = f.y + 34;
          const x2 = t.x;
          const y2 = t.y - 38;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x1 + (x2 - x1) * p}
              y2={y1 + (y2 - y1) * p}
              stroke="rgba(190,170,255,.7)"
              strokeWidth={2}
              markerEnd={p > 0.98 ? 'url(#ah)' : undefined}
            />
          );
        })}
      </svg>

      {boxes.map((b) => {
        const p = spring({frame: frame - b.at, fps, config: {damping: 14}});
        const c = colourOf(b.tone);
        return (
          <div
            key={b.id}
            style={{
              position: 'absolute',
              left: b.x,
              top: b.y,
              width: b.w ?? 250,
              marginLeft: -(b.w ?? 250) / 2,
              marginTop: -38,
              opacity: Math.min(1, p * 1.5),
              transform: `scale(${0.8 + p * 0.2})`,
              padding: '14px 18px',
              borderRadius: 13,
              border: `1.8px solid ${c}${b.tone === 'ink' ? '55' : 'dd'}`,
              background: 'rgba(10,8,22,.9)',
              boxShadow: b.tone === 'ink' ? 'none' : `0 0 38px ${c}33`,
              textAlign: 'center',
            }}
          >
            <div style={{fontFamily: GROTESK, fontWeight: 700, fontSize: 28, color: INK}}>
              {b.label}
            </div>
            {b.sub ? (
              <div style={{fontFamily: MONO, fontSize: 17, color: 'rgba(236,234,255,.5)'}}>
                {b.sub}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
