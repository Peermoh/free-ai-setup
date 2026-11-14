import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, FONT} from '../config';
import {useScale} from '../layout';

/**
 * A big number that can roll from one value to another.
 * Used for the 4,400 -> 72 token count in scenes 1 and 2.
 */
export const Counter: React.FC<{
  from: number;
  to: number;
  /** Frame to start rolling, and how many frames the roll takes. */
  startAt?: number;
  rollFrames?: number;
  colour?: string;
  /** Small shake, for the "that is a lot" moment in scene 1. */
  shake?: boolean;
}> = ({from, to, startAt = 0, rollFrames = 30, colour = C.text, shake = false}) => {
  const frame = useCurrentFrame();
  const s = useScale();

  const value = Math.round(
    interpolate(frame, [startAt, startAt + rollFrames], [from, to], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );

  // A gentle 2px wobble: enough to read as tension, not enough to flash.
  const wob = shake ? Math.sin(frame / 2.2) * 3 : 0;

  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: 230 * s,
        fontWeight: 800,
        color: colour,
        letterSpacing: -4 * s,
        transform: `translateX(${wob * s}px)`,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value.toLocaleString('en-US')}
    </div>
  );
};
