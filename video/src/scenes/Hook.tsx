import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, FONT} from '../config';
import {useScale} from '../layout';
import {Counter} from '../components/Counter';
import {Stage} from './Stage';

/** Scene 1 (0-6 s): the hook. A big, slightly shaking token count. */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useScale();
  const appear = interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <Stage>
      <div style={{opacity: appear, textAlign: 'center'}}>
        <div style={{fontFamily: FONT, fontSize: 34 * s, color: C.muted, letterSpacing: 2}}>
          INPUT TOKENS FOR ONE &ldquo;HELLO&rdquo;
        </div>
        <Counter from={4400} to={4400} colour={C.red} shake />
      </div>
    </Stage>
  );
};
