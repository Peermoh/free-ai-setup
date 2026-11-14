import React from 'react';
import {C, FONT} from '../config';
import {useScale} from '../layout';

/** The chat message travelling through the setup. */
export const MessageBubble: React.FC<{
  x: number;
  y: number;
  label?: string;
  opacity?: number;
}> = ({x, y, label = 'your message', opacity = 1}) => {
  const s = useScale();

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${x * s}px), calc(-50% + ${y * s}px))`,
        opacity,
        padding: `${13 * s}px ${22 * s}px`,
        borderRadius: `${20 * s}px ${20 * s}px ${20 * s}px ${5 * s}px`,
        background: C.text,
        color: C.bg,
        fontFamily: FONT,
        fontSize: 26 * s,
        fontWeight: 650,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </div>
  );
};
