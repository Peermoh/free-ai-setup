import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  continueRender,
  delayRender,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import {build, Built} from './blueprint';
import {MUSIC_FILE, MUSIC_VOLUME, MUSIC_DUCK} from '../config';

/**
 * The blueprint film. Narration placed to the four scenes of the brief:
 *   1  0:00-0:14  the foundation
 *   2  0:15-0:32  the three pillars
 *   3  0:33-0:42  the connection
 *   4  0:43-0:47  the call to action
 */
export const VO: {id: string; at: number; len: number}[] = [
  {id: 'hook', at: 0.4, len: 3.76},
  {id: 'nogpu', at: 5.0, len: 3.47},
  {id: 'still', at: 9.2, len: 5.15},
  {id: 'three', at: 15.3, len: 1.8},
  {id: 'local', at: 17.8, len: 3.84},
  {id: 'tiers', at: 22.4, len: 5.04},
  {id: 'gpu', at: 28.1, len: 3.47},
  {id: 'route', at: 33.3, len: 4.55},
  {id: 'chat', at: 38.5, len: 3.53},
  {id: 'cta', at: 43.3, len: 3.06},
];

export const TOTAL_SECONDS = 47;

const musicAt = (t: number) => {
  const speaking = VO.some((v) => t > v.at - 0.3 && t < v.at + v.len + 0.3);
  const target = speaking ? MUSIC_DUCK : MUSIC_VOLUME;
  const fadeIn = Math.min(1, t / 1.2);
  const fadeOut = Math.min(1, (TOTAL_SECONDS - t) / 2.2);
  return target * fadeIn * Math.max(0, fadeOut);
};

export const Blueprint: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const builtRef = useRef<Built | null>(null);
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const [handle] = useState(() => delayRender('blueprint scene'));
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || builtRef.current) return;
    const go = () => {
      builtRef.current = build(canvas, width, height);
      setReady(true);
      continueRender(handle);
    };
    if (document.fonts?.ready) document.fonts.ready.then(go).catch(go);
    else go();
    return () => {
      builtRef.current?.dispose();
      builtRef.current = null;
    };
  }, [width, height, handle]);

  useEffect(() => {
    const b = builtRef.current;
    if (!b || !ready) return;
    const t = frame / fps;
    b.timeline.time(t, false); // seek, never play: renders are out of order
    b.tick(t);
    b.composer.render();
  }, [frame, fps, ready]);

  return (
    <AbsoluteFill style={{background: '#081426'}}>
      <canvas ref={canvasRef} width={width} height={height} style={{width, height}} />
      {MUSIC_FILE ? (
        <Audio src={staticFile(MUSIC_FILE)} volume={(f) => musicAt(f / fps)} />
      ) : null}
      {VO.map((v) => (
        <Sequence
          key={v.id}
          from={Math.round(v.at * fps)}
          durationInFrames={Math.ceil((v.len + 0.3) * fps)}
          layout="none"
          name={`vo-${v.id}`}
        >
          <Audio src={staticFile(`vo/${v.id}.mp3`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
