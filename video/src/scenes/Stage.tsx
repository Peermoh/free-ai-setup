import React from 'react';
import {useScale} from '../layout';

/**
 * Shared wrapper: centres a scene's artwork and lifts it above the caption
 * so nothing ever overlaps the text at the bottom of the frame.
 */
export const Stage: React.FC<{children: React.ReactNode; lift?: number}> = ({
  children,
  lift = 70,
}) => {
  const s = useScale();
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: lift * 2 * s,
      }}
    >
      {children}
    </div>
  );
};
