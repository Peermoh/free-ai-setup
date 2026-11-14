import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Shot} from './Shot';
import {ShotId} from '../shots';

/**
 * Screenshots dealt onto a pile, each sliding in over the last at a slight
 * angle. Shows several pieces of evidence in the time one would normally take.
 */
export const ShotStack: React.FC<{
  items: {id: ShotId; at: number; width?: number; rot: number; dx: number; dy: number}[];
}> = ({items}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{position: 'relative', width: 920, height: 620}}>
      {items.map((it, i) => {
        const p = spring({frame: frame - it.at, fps, config: {damping: 17}});
        return (
          <div
            key={it.id}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform:
                `translate(-50%,-50%) translate(${it.dx}px, ${it.dy + (1 - p) * 90}px) ` +
                `rotate(${it.rot * p}deg) scale(${0.9 + p * 0.1})`,
              opacity: p,
              zIndex: i,
            }}
          >
            <Shot id={it.id} width={it.width ?? 760} showLabel={false} />
          </div>
        );
      })}
    </div>
  );
};
