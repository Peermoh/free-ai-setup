import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import {
  FPS,
  MUSIC_DUCK,
  MUSIC_FADE_SECONDS,
  MUSIC_FILE,
  MUSIC_VOLUME,
  SCENES,
  TOTAL_FRAMES,
  VOICEOVER,
  VOICEOVER_DELAY_SECONDS,
  VOICEOVER_VOLUME,
} from './config';
import {useScale} from './layout';
import {ACCENT} from './design/iso';
import {ISO_SCENES} from './scenes/isofilm';
import {CallToAction, Chip, Fine, Karaoke, OVERLAYS, Segments, Source} from './scenes/overlay';

/**
 * The film: isometric stages in a blue-black room, annotated with chips and
 * a karaoke caption, with the camera moving across every scene.
 *
 * Everything is authored in a 1080 square and scaled once, so the isometric
 * maths never has to carry a scale factor.
 */

const Square: React.FC<{children: React.ReactNode}> = ({children}) => {
  const s = useScale();
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 1080,
          height: 1080,
          marginLeft: -540,
          marginTop: -540,
          transform: `scale(${s})`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/** Blue-black room. The floor is drawn inside the stage, in iso space. */
const Room: React.FC = () => (
  <AbsoluteFill style={{background: '#070c16'}}>
    <AbsoluteFill
      style={{
        background: 'radial-gradient(70% 50% at 50% 26%, #0f1a2d 0%, #070c16 74%)',
      }}
    />
  </AbsoluteFill>
);

const musicVolumeAt = (f: number) => {
  const t = f / FPS;
  const speaking = SCENES.some((s) => {
    const start = s.from + VOICEOVER_DELAY_SECONDS;
    return t > start - 0.35 && t < start + 5;
  });
  const target = speaking ? MUSIC_DUCK : MUSIC_VOLUME;
  const fadeIn = Math.min(1, t / 1);
  const fadeOut = Math.min(1, (TOTAL_FRAMES / FPS - t) / MUSIC_FADE_SECONDS);
  return target * fadeIn * Math.max(0, fadeOut);
};

/** One scene: its stage, its camera move, and its overlay. */
const SceneBlock: React.FC<{i: number}> = ({i}) => {
  const scene = SCENES[i];
  const frame = useCurrentFrame();
  const Stage = ISO_SCENES[scene.id];
  const over = OVERLAYS[scene.id];
  const dur = scene.dur * FPS;

  // The camera crosses the stage: a slow push, pull or pan, eased in and out.
  const e = 0.5 - Math.cos(Math.min(1, Math.max(0, frame / dur)) * Math.PI) / 2;
  const cam = {
    push: {k: 1 + e * 0.17, dx: 0, dy: -e * 46},
    pull: {k: 1.17 - e * 0.17, dx: 0, dy: e * 40},
    panL: {k: 1.08, dx: (0.5 - e) * 230, dy: -e * 14},
    panR: {k: 1.08, dx: (e - 0.5) * 230, dy: -e * 14},
  }[scene.cam];

  return (
    <Square>
      <svg width={1080} height={1080} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(${540 + cam.dx} ${470 + cam.dy}) scale(${cam.k})`}>
          <Stage />
        </g>
      </svg>

      <Source text={over.source} />
      <Segments done={i + 1} total={SCENES.length} />
      {over.chips.map((c) => (
        <Chip key={c.text} {...c} />
      ))}
      {over.cta ? (
        <CallToAction />
      ) : (
        <Karaoke text={scene.caption} durationInFrames={dur} hot={over.hot} />
      )}
      <Fine text={over.fine} />
    </Square>
  );
};

export const Video: React.FC = () => (
  <AbsoluteFill style={{background: '#070c16'}}>
    {MUSIC_FILE ? (
      <Audio src={staticFile(MUSIC_FILE)} volume={(f) => musicVolumeAt(f)} />
    ) : null}
    <Room />

    {SCENES.map((scene, i) => (
      <Sequence
        key={scene.id}
        from={scene.from * FPS}
        durationInFrames={scene.dur * FPS}
        name={scene.id}
        layout="none"
      >
        <SceneBlock i={i} />
      </Sequence>
    ))}

    {VOICEOVER
      ? SCENES.map((scene) => (
          <Sequence
            key={`vo-${scene.id}`}
            from={Math.round((scene.from + VOICEOVER_DELAY_SECONDS) * FPS)}
            durationInFrames={scene.dur * FPS}
            name={`${scene.id}-vo`}
            layout="none"
          >
            <Audio src={staticFile(`vo/${scene.id}.mp3`)} volume={VOICEOVER_VOLUME} />
          </Sequence>
        ))
      : null}

    <Progress />
  </AbsoluteFill>
);

const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 4}}>
      <div
        style={{
          height: '100%',
          width: `${Math.min(100, (frame / TOTAL_FRAMES) * 100)}%`,
          background: ACCENT,
          opacity: 0.9,
        }}
      />
    </div>
  );
};
