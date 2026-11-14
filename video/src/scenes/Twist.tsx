import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, FONT} from '../config';
import {useScale} from '../layout';
import {Counter} from '../components/Counter';
import {Stage} from './Stage';

/** Scene 2 (6-12 s): the same counter rolls down to 72 and turns green. */
export const Twist: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useScale();

  // Hold red for 12 frames, roll over 36, then it is green.
  const toGreen = interpolate(frame, [12, 48], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const colour = toGreen > 0.85 ? C.green : C.red;

  return (
    <Stage>
      <div style={{textAlign: 'center'}}>
        <div style={{fontFamily: FONT, fontSize: 34 * s, color: C.muted, letterSpacing: 2}}>
          AFTER SWITCHING OFF HIDDEN TOOLS
        </div>
        <Counter from={4400} to={72} startAt={12} rollFrames={36} colour={colour} />
      </div>
    </Stage>
  );
};
