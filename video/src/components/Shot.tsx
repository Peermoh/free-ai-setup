import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, FONT} from '../config';
import {useScale} from '../layout';
import {SHOTS, ShotId} from '../shots';

/**
 * A real screenshot, cropped and framed.
 *
 * The crop is done with CSS from the numbers in shots.ts: the image is scaled
 * so the kept region fills `width`, then shifted so that region starts at the
 * top-left of a clipping box. The original PNG is never modified.
 */
export const Shot: React.FC<{
  id: ShotId;
  /** Target width in design pixels (the frame is 1080 wide). */
  width?: number;
  /** Show the small caption under the frame. */
  showLabel?: boolean;
  /** 0-1, for fading a shot in. */
  opacity?: number;
  /** Slow push-in: 1 = still, 1.04 = gently moving. */
  zoom?: number;
  /**
   * Rings and notes drawn over the shot. Rendered in a layer the exact size
   * of the image, OUTSIDE the clipping box, so percentage positions line up
   * with the picture and a note may stick out past its edge.
   */
  overlay?: React.ReactNode;
}> = ({id, width = 920, showLabel = true, opacity = 1, zoom = 1, overlay}) => {
  const s = useScale();
  const shot = SHOTS[id];
  const {crop} = shot;

  // How much to scale the source so the crop region is `width` wide.
  const k = width / crop.w;

  const boxW = width * s;
  const boxH = crop.h * k * s;

  return (
    <div style={{opacity, textAlign: 'center'}}>
      <div style={{position: 'relative', width: boxW, height: boxH}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          borderRadius: 18 * s,
          border: `${1.5 * s}px solid ${C.cardEdge}`,
          // A soft lift so the shot reads as an inset, not a flat paste.
          boxShadow: `0 ${18 * s}px ${44 * s}px rgba(0,0,0,0.55)`,
          background: C.card,
        }}
      >
        <Img
          src={staticFile(shot.file)}
          style={{
            position: 'absolute',
            width: shot.nw * k * s,
            height: shot.nh * k * s,
            left: -crop.x * k * s,
            top: -crop.y * k * s,
            transform: `scale(${zoom})`,
            transformOrigin: 'center',
            maxWidth: 'none',
          }}
        />
      </div>
      {overlay ? (
        <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
          {overlay}
        </div>
      ) : null}
      </div>
      {showLabel ? (
        <div
          style={{
            marginTop: 12 * s,
            fontFamily: FONT,
            fontSize: 22 * s,
            color: C.muted,
            letterSpacing: 0.4,
          }}
        >
          {shot.label}
        </div>
      ) : null}
    </div>
  );
};
