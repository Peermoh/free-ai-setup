import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, STATS} from '../config';
import {useIsWide, useScale} from '../layout';
import {Stage} from './Stage';

/**
 * Scene 7 (66-76 s): three measured results pop in one by one.
 * Every number here came from the owner's own test run.
 */
export const Proof: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = useScale();
  const wide = useIsWide();

  return (
    <Stage>
      <div
        style={{
          display: 'flex',
          flexDirection: wide ? 'row' : 'column',
          gap: 24 * s,
          alignItems: 'center',
        }}
      >
        {STATS.map((stat, i) => {
          // Each card springs in 12 frames after the previous one.
          const p = spring({frame: frame - i * 12, fps, config: {damping: 200}});
          return (
            <div
              key={stat.big}
              style={{
                boxSizing: 'border-box',
                width: (wide ? 330 : 620) * s,
                padding: `${26 * s}px ${20 * s}px`,
                borderRadius: 20 * s,
                background: C.card,
                border: `${1.5 * s}px solid ${C.cardEdge}`,
                textAlign: 'center',
                fontFamily: FONT,
                opacity: p,
                transform: `scale(${0.9 + p * 0.1})`,
              }}
            >
              <div style={{fontSize: 72 * s, fontWeight: 800, color: C.green}}>{stat.big}</div>
              <div style={{fontSize: 28 * s, color: C.muted, marginTop: 4 * s}}>{stat.small}</div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};
