import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {AUTHOR_NAME, C, FONT, REPO_URL} from '../config';
import {useScale} from '../layout';
import {Stage} from './Stage';

/** Scene 8 (76-85 s): where to get the guide and the scripts. */
export const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = useScale();

  const a = spring({frame, fps, config: {damping: 200}});
  const b = spring({frame: frame - 24, fps, config: {damping: 200}});

  return (
    <Stage>
      <div style={{display: 'flex', gap: 26 * s, alignItems: 'center', opacity: a}}>
        {/* Guide: a plain document shape, no branding */}
        <div
          style={{
            width: 190 * s,
            height: 250 * s,
            borderRadius: 14 * s,
            background: C.card,
            border: `${2 * s}px solid ${C.accent}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: 18 * s,
            fontFamily: FONT,
            fontSize: 26 * s,
            fontWeight: 650,
            color: C.text,
          }}
        >
          Guide
        </div>
        {/* Scripts folder */}
        <div
          style={{
            width: 190 * s,
            height: 250 * s,
            borderRadius: 14 * s,
            background: C.card,
            border: `${2 * s}px solid ${C.green}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: 18 * s,
            fontFamily: FONT,
            fontSize: 26 * s,
            fontWeight: 650,
            color: C.text,
          }}
        >
          Scripts
        </div>
      </div>

      <div
        style={{
          marginTop: 34 * s,
          opacity: b,
          textAlign: 'center',
          fontFamily: FONT,
        }}
      >
        <div style={{fontSize: 40 * s, fontWeight: 700, color: C.accent}}>{REPO_URL}</div>
        <div style={{fontSize: 27 * s, color: C.muted, marginTop: 6 * s}}>{AUTHOR_NAME}</div>
      </div>
    </Stage>
  );
};
