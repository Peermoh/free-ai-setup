import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {build, Built} from './scene';

/**
 * Three.js inside Remotion.
 *
 * GSAP is time based and Remotion renders frames out of order, so the
 * timeline is created paused and SEEKED to the exact time of the frame being
 * drawn. The same code therefore gives an identical result whether it is
 * previewed live or rendered to a file.
 */
export const ThreeFilm: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const builtRef = useRef<Built | null>(null);
  const frame = useCurrentFrame();
  const {width, height, fps, durationInFrames} = useVideoConfig();
  const [handle] = useState(() => delayRender('building the three.js scene'));
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || builtRef.current) return;
    // Panel textures are drawn with a web font; wait for it so the first
    // frame does not bake a fallback typeface into the texture.
    const go = () => {
      builtRef.current = build(canvas, width, height, durationInFrames / fps);
      setReady(true);
      continueRender(handle);
    };
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(go).catch(go);
    } else {
      go();
    }
    return () => {
      builtRef.current?.dispose();
      builtRef.current = null;
    };
  }, [width, height, fps, durationInFrames, handle]);

  useEffect(() => {
    const b = builtRef.current;
    if (!b || !ready) return;
    const t = frame / fps;
    b.timeline.time(t, false); // seek, never play
    b.tick(t);
    b.composer.render();
  }, [frame, fps, ready]);

  return (
    <AbsoluteFill style={{background: '#0d1117'}}>
      <canvas ref={canvasRef} width={width} height={height} style={{width, height}} />
    </AbsoluteFill>
  );
};
