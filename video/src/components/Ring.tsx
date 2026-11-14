import React from 'react';
import {C, FONT} from '../config';
import {useScale} from '../layout';

/**
 * An orange ring drawn over a screenshot to point at one thing, with an
 * optional note. Positions are a percentage of the shot, so a re-crop does
 * not break them.
 */
export const Ring: React.FC<{
  left: string;
  top: string;
  width: string;
  height: string;
  note?: string;
  /** Which side the note sits on. */
  noteSide?: 'top' | 'bottom';
}> = ({left, top, width, height, note, noteSide = 'bottom'}) => {
  const s = useScale();
  return (
    <div style={{position: 'absolute', left, top, width, height}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          border: `${3 * s}px solid ${C.accent}`,
          borderRadius: 10 * s,
          boxShadow: `0 0 ${22 * s}px ${C.accent}66`,
        }}
      />
      {note ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            [noteSide === 'bottom' ? 'top' : 'bottom']: `calc(100% + ${9 * s}px)`,
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            padding: `${5 * s}px ${12 * s}px`,
            borderRadius: 999,
            background: C.accent,
            color: '#1a1205',
            fontFamily: FONT,
            fontSize: 23 * s,
            fontWeight: 750,
          }}
        >
          {note}
        </div>
      ) : null}
    </div>
  );
};
