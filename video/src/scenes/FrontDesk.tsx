import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, PROVIDERS} from '../config';
import {useScale} from '../layout';
import {Card} from '../components/Card';
import {MessageBubble} from '../components/MessageBubble';
import {Stage} from './Stage';

/**
 * Scene 4 (22-40 s): the idea.
 *
 * The message goes to the front desk, the desk fans out to the free services,
 * the first one is closed, and the message is rerouted to the next one that
 * is open. This is the whole point of the video, so it gets the most time.
 *
 * Timeline (frames, 30 fps):
 *   0-60    message travels in to the front desk
 *   60-150  the four provider cards fan out
 *   150-230 message drops towards the first provider
 *   230-250 that provider shows CLOSED
 *   250-330 message slides to the next provider
 *   330+    that provider lights up green and answers
 */
const X = [-366, -122, 122, 366]; // card centres, design pixels

export const FrontDesk: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = useScale();

  const DESK_Y = -170;
  const ROW_Y = 120;

  // 1. message in
  const inX = interpolate(frame, [0, 60], [-430, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 2. drop to the first provider, then slide to the second
  const dropT = interpolate(frame, [150, 230], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const slideT = interpolate(frame, [250, 330], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const bubbleX = inX + dropT * (X[0] - 0) + slideT * (X[1] - X[0]);
  // stop short of the row so the bubble never covers a provider's name
  const bubbleY = DESK_Y + dropT * (ROW_Y - DESK_Y - 165);
  const bubbleFade = interpolate(frame, [350, 380], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const groqClosed = frame >= 230;
  const geminiOpen = frame >= 330;

  return (
    <Stage>
      <div style={{position: 'relative', width: '100%', height: 470 * s}}>
        {/* The front desk itself */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, calc(-50% + ${DESK_Y * s}px))`,
          }}
        >
          <Card label="Front desk" sub="the router" highlight={C.accent} width={340} />
        </div>

        {/* The four free services, fanning out one after another */}
        {PROVIDERS.map((name, i) => {
          const p = spring({frame: frame - (60 + i * 14), fps, config: {damping: 200}});
          const closed = i === 0 && groqClosed;
          const open = i === 1 && geminiOpen;
          return (
            <div
              key={name}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${X[i] * s}px), calc(-50% + ${
                  ROW_Y * s
                }px)) scale(${0.85 + p * 0.15})`,
                opacity: p,
              }}
            >
              <Card
                label={name}
                width={232}
                status={closed ? 'CLOSED' : open ? 'OPEN' : undefined}
                statusColour={closed ? C.red : open ? C.green : undefined}
                highlight={closed ? C.red : open ? C.green : undefined}
                dim={geminiOpen && i !== 1}
              />
            </div>
          );
        })}

        <MessageBubble x={bubbleX} y={bubbleY} opacity={bubbleFade} />
      </div>
    </Stage>
  );
};
