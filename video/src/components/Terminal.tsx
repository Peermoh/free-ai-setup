import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FONT} from '../config';
import {useScale} from '../layout';

export type TermLine = {
  /** Frame (relative to the scene) when this line starts typing. */
  at: number;
  text: string;
  /** A line that simply appears, e.g. a tick or a menu row. */
  instant?: boolean;
  colour?: string;
};

/**
 * A PowerShell-looking window that types its lines out.
 * Typing is derived from the frame number, so it is deterministic: Remotion
 * renders frames out of order and nothing may depend on real time.
 */
export const Terminal: React.FC<{lines: TermLine[]; width?: number}> = ({
  lines,
  width = 870,
}) => {
  const frame = useCurrentFrame();
  const s = useScale();
  const CPF = 1.6; // characters typed per frame

  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: width * s,
        minHeight: 300 * s,
        padding: 26 * s,
        borderRadius: 18 * s,
        overflow: 'hidden',
        background: '#0b0b0b',
        border: `${1.5 * s}px solid ${C.cardEdge}`,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        fontSize: 27 * s,
        lineHeight: 1.6,
        textAlign: 'left',
      }}
    >
      {/* window chrome */}
      <div style={{display: 'flex', gap: 9 * s, marginBottom: 18 * s}}>
        {[C.red, '#eab308', C.green].map((c) => (
          <div
            key={c}
            style={{width: 13 * s, height: 13 * s, borderRadius: 999, background: c}}
          />
        ))}
        <div style={{color: C.muted, fontFamily: FONT, fontSize: 21 * s, marginLeft: 10 * s}}>
          PowerShell
        </div>
      </div>

      {lines.map((l, i) => {
        if (frame < l.at) return null;
        const shown = l.instant
          ? l.text
          : l.text.slice(0, Math.floor((frame - l.at) * CPF));
        const typing = !l.instant && shown.length < l.text.length;
        return (
          <div key={i} style={{color: l.colour ?? C.text, whiteSpace: 'pre'}}>
            {shown}
            {typing ? <span style={{color: C.accent}}>_</span> : null}
          </div>
        );
      })}
    </div>
  );
};
