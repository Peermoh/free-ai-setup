import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/sora/500.css';
import '@fontsource/sora/700.css';
import '@fontsource/sora/800.css';
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
import {ACCENT, AccentCtx} from './design/iso';
import {ISO_SCENES} from './scenes/isofilm';
import {
  CallToAction,
  Chip,
  Fine,
  Karaoke,
  OVERLAYS,
  Segments,
  SlideShot,
  Source,
} from './scenes/overlay';

/**
 * The film: isometric stages in a blue-black room, annotated with chips and
 * a karaoke caption, with the camera moving across every scene.
 *
 * Everything is authored in a 1080 square and scaled once, so the isometric
 * maths never has to carry a scale factor.
 */

const Square: React.FC<{children: React.ReactNode}> = ({children}) => {
  const s = useScale();
  const {width, height} = useVideoConfig();
  // In portrait the stage rides above centre, leaving the lower third for the
  // caption and the platform's own interface.
  const portrait = height > width * 1.2;
  // Negative lift drops the stage toward the caption: centred left too
  // large a gap between the artwork and the words.
  const lift = portrait ? -height * 0.035 : 0;
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
          marginTop: -540 - lift,
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
  const {width, height} = useVideoConfig();
  const portrait = height > width * 1.2;
  const Stage = ISO_SCENES[scene.id];
  const over = OVERLAYS[scene.id];
  const dur = scene.dur * FPS;

  /*
   * Camera.
   *
   * Zoom and centre alone made every scene look framed from the same place,
   * so each scene now has its own start and end viewpoint — a different
   * zoom, a different part of the stage, and a slight roll — and the camera
   * travels between them. Two neighbouring scenes never share a framing.
   */
  const e = 0.5 - Math.cos(Math.min(1, Math.max(0, frame / dur)) * Math.PI) / 2;
  const VIEWS: Record<
    string,
    {a: [number, number, number, number]; b: [number, number, number, number]}
  > = {
    // [zoom, x, y, roll]
    hook: {a: [0.86, 540, 430, -3], b: [1.22, 560, 470, 1]},
    nogpu: {a: [1.3, 660, 520, 2], b: [0.95, 420, 450, -2]},
    still: {a: [1.0, 430, 430, -1], b: [1.26, 640, 500, 3]},
    three: {a: [1.35, 540, 520, 0], b: [0.8, 540, 420, -2]},
    local: {a: [0.92, 480, 400, 2], b: [1.3, 600, 500, -1]},
    tiers: {a: [1.22, 760, 470, -2], b: [1.0, 360, 440, 2]},
    gpu: {a: [0.9, 430, 420, 3], b: [1.3, 620, 500, -2]},
    route: {a: [1.25, 540, 560, -2], b: [0.78, 540, 430, 1]},
    chat: {a: [0.85, 520, 420, 1], b: [1.18, 560, 480, -2]},
    cta: {a: [1.3, 540, 500, -2], b: [0.92, 540, 420, 2]},
  };
  const v = VIEWS[scene.id] ?? VIEWS.hook;
  const mix = (i: number) => v.a[i] + (v.b[i] - v.a[i]) * e;
  // Portrait has vertical room to spare, so the artwork is drawn larger.
  const fill = portrait ? 1.16 : 1;
  const cam = {k: mix(0) * fill, dx: mix(1) - 540, dy: mix(2) - 470, roll: mix(3)};

  /*
   * The stage, its chips and its screenshot live in the 1080 square, because
   * they are positioned against the artwork. The source mark, progress,
   * caption and fine print belong to the frame itself, so they sit outside
   * the square and reach the real edges in any aspect ratio.
   */
  return (
    <AccentCtx.Provider value={over.accent}>
      <Square>
        <svg width={1080} height={1080} style={{position: 'absolute', inset: 0}}>
          <g
            transform={`translate(${540 + cam.dx} ${470 + cam.dy}) rotate(${cam.roll}) scale(${cam.k})`}
          >
            <Stage />
          </g>
        </svg>
        {over.chips.map((c) => (
          <Chip key={c.text} {...c} />
        ))}
        {over.slide ? <SlideShot {...over.slide} /> : null}
      </Square>

      <Source text={over.source} />
      <Segments done={i + 1} total={SCENES.length} />
      {over.cta ? (
        <CallToAction />
      ) : (
        <Karaoke text={scene.caption} durationInFrames={dur} hot={over.hot} />
      )}
      <Fine text={over.fine} />
    </AccentCtx.Provider>
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
  const t = frame / FPS;
  const active = SCENES.find((s) => t >= s.from && t < s.from + s.dur);
  const colour = active ? OVERLAYS[active.id].accent : ACCENT;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 4}}>
      <div
        style={{
          height: '100%',
          width: `${Math.min(100, (frame / TOTAL_FRAMES) * 100)}%`,
          background: colour,
          opacity: 0.9,
        }}
      />
    </div>
  );
};
