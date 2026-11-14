import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, FONT, PROVIDERS} from '../config';
import {useScale} from '../layout';
import {Card} from '../components/Card';
import {MessageBubble} from '../components/MessageBubble';
import {Stage} from './Stage';

/**
 * Scene 5 (40-50 s): a private question skips the cloud entirely.
 * The cloud cards dim; the laptop card is the only lit one.
 */
export const Privacy: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useScale();

  const padlock = interpolate(frame, [0, 14], [0, 1], {extrapolateRight: 'clamp'});
  // The bubble drops straight down into the laptop card.
  const y = interpolate(frame, [30, 85], [-120, 60], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bubbleFade = interpolate(frame, [75, 95], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <Stage>
      <div style={{opacity: padlock, fontSize: 92 * s, marginBottom: 10 * s}}>&#128274;</div>

      {/* The cloud options, visibly out of the picture */}
      <div style={{display: 'flex', gap: 14 * s, marginBottom: 26 * s}}>
        {PROVIDERS.map((p) => (
          <div
            key={p}
            style={{
              padding: `${9 * s}px ${16 * s}px`,
              borderRadius: 12 * s,
              background: C.card,
              border: `${1.5 * s}px solid ${C.cardEdge}`,
              color: C.muted,
              fontFamily: FONT,
              fontSize: 24 * s,
              opacity: 0.3,
            }}
          >
            {p}
          </div>
        ))}
      </div>

      <div style={{position: 'relative'}}>
        <Card label="Your laptop" sub="private, nothing leaves the machine" status="PRIVATE" statusColour={C.green} highlight={C.green} width={430} />
        <MessageBubble x={0} y={y - 70} label="work question" opacity={bubbleFade} />
      </div>
    </Stage>
  );
};
