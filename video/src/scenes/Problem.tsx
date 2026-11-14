import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C} from '../config';
import {useScale} from '../layout';
import {Card} from '../components/Card';
import {MessageBubble} from '../components/MessageBubble';
import {Stage} from './Stage';

/**
 * Scene 3 (12-22 s): one free service, closed. The message travels to it and
 * bounces off, which is what a used-up daily limit feels like.
 */
export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useScale();

  // Travel in (frames 20-70), hit, then bounce back and fade (70-110).
  const inX = interpolate(frame, [20, 70], [-380, -140], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const backX = interpolate(frame, [70, 110], [0, -170], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fade = interpolate(frame, [70, 115], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // A small nudge on the card at the moment of impact.
  const knock = frame > 68 && frame < 82 ? Math.sin((frame - 68) / 1.6) * 4 : 0;

  return (
    <Stage>
      <div style={{position: 'relative', width: '100%', height: 340 * s}}>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${(170 + knock) * s}px), -50%)`,
          }}
        >
          <Card label="Free service" sub="daily limit used up" status="CLOSED" statusColour={C.red} highlight={C.red} />
        </div>
        <MessageBubble x={inX + backX} y={0} opacity={fade} />
      </div>
    </Stage>
  );
};
