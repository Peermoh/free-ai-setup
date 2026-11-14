import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {GREEN, INK, MONO, VIOLET} from '../design/world';

/**
 * A terminal that actually runs.
 *
 * The command types itself a character at a time, then its output arrives
 * line by line, with ticks and an optional progress bar. Everything is
 * derived from the frame number, never from real time, because Remotion
 * renders frames out of order.
 */

export type Line =
  | {at: number; kind: 'cmd'; text: string}
  | {at: number; kind: 'out'; text: string}
  | {at: number; kind: 'ok'; text: string}
  | {at: number; kind: 'bar'; text: string; frames: number};

export const Terminal: React.FC<{
  lines: Line[];
  width?: number;
  title?: string;
  cps?: number;
}> = ({lines, width = 880, title = 'PowerShell', cps = 2.1}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        width,
        padding: 26,
        borderRadius: 16,
        background: 'rgba(6,5,14,.92)',
        border: '1.5px solid rgba(160,130,255,.30)',
        boxShadow: '0 24px 70px rgba(0,0,0,.6), 0 0 60px rgba(122,70,255,.15)',
        fontFamily: MONO,
        fontSize: 27,
        lineHeight: 1.65,
        textAlign: 'left',
        overflow: 'hidden',
      }}
    >
      <div style={{display: 'flex', gap: 9, marginBottom: 16, alignItems: 'center'}}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <div key={c} style={{width: 12, height: 12, borderRadius: 999, background: c}} />
        ))}
        <span style={{marginLeft: 10, fontSize: 19, color: 'rgba(236,234,255,.45)'}}>
          {title}
        </span>
      </div>

      {lines.map((l, i) => {
        if (frame < l.at) return null;

        if (l.kind === 'cmd') {
          const n = Math.floor((frame - l.at) * cps);
          const shown = l.text.slice(0, n);
          const typing = shown.length < l.text.length;
          return (
            <div key={i} style={{color: INK, whiteSpace: 'pre'}}>
              <span style={{color: VIOLET}}>PS&gt; </span>
              {shown}
              {typing || Math.floor(frame / 9) % 2 === 0 ? (
                <span style={{color: VIOLET}}>▌</span>
              ) : null}
            </div>
          );
        }

        if (l.kind === 'bar') {
          const p = interpolate(frame, [l.at, l.at + l.frames], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const cells = 22;
          const filled = Math.round(p * cells);
          return (
            <div key={i} style={{color: 'rgba(236,234,255,.8)', whiteSpace: 'pre'}}>
              {'  '}
              {l.text}{' '}
              <span style={{color: GREEN}}>{'█'.repeat(filled)}</span>
              <span style={{color: 'rgba(236,234,255,.22)'}}>{'░'.repeat(cells - filled)}</span>{' '}
              {Math.round(p * 100)}%
            </div>
          );
        }

        // A result line slides up as it lands, so output feels like it arrives.
        const a = interpolate(frame, [l.at, l.at + 5], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div
            key={i}
            style={{
              color: l.kind === 'ok' ? GREEN : 'rgba(236,234,255,.78)',
              whiteSpace: 'pre',
              opacity: a,
              transform: `translateY(${(1 - a) * 8}px)`,
            }}
          >
            {l.kind === 'ok' ? '  ✓ ' : '    '}
            {l.text}
          </div>
        );
      })}
    </div>
  );
};
