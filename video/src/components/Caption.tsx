import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, FONT} from '../config';
import {useScale} from '../layout';

/**
 * The burned-in caption. LinkedIn autoplays muted, so this carries all the
 * meaning. Big (56px+ at square size), bottom-anchored, max ~12 words.
 */
export const Caption: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const s = useScale();

  // 300 ms fade and a small rise, so it never flashes.
  const opacity = interpolate(frame, [0, 9], [0, 1], {extrapolateRight: 'clamp'});
  const lift = interpolate(frame, [0, 12], [18, 0], {extrapolateRight: 'clamp'});

  return (
    <div
      style={{
        position: 'absolute',
        left: '5%',
        right: '5%',
        bottom: 70 * s,
        textAlign: 'center',
        opacity,
        transform: `translateY(${lift * s}px)`,
      }}
    >
      <span
        style={{
          fontFamily: FONT,
          fontSize: 58 * s,
          lineHeight: 1.25,
          fontWeight: 600,
          color: C.text,
          textWrap: 'balance',
        }}
      >
        {text}
      </span>
    </div>
  );
};
