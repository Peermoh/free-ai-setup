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
import {Atmosphere, Floor, GROTESK, INK, MONO} from './design/world';
import {Words} from './design/anim';
import {SCENES_BY_ID} from './scenes/film';

/**
 * The film.
 *
 * The world is drawn once here, not per scene: atmosphere, floor, and the
 * camera drift that every scene shares. A scene only draws its own content,
 * and the caption and HUD are rendered from the scene table so the burned-in
 * words, the .srt and the narration can never disagree.
 */

/** Which scene is on screen at this frame, for the shared camera and HUD. */
const useActiveScene = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return SCENES.find((s) => t >= s.from && t < s.from + s.dur) ?? SCENES[SCENES.length - 1];
};

/** The caption arrives word by word, so the line itself is in motion. */
const Caption: React.FC<{text: string}> = ({text}) => {
  const s = useScale();
  return (
    <div
      style={{
        position: 'absolute',
        left: '6%',
        right: '6%',
        bottom: 70 * s,
        textAlign: 'center',
        fontFamily: GROTESK,
        fontWeight: 700,
        fontSize: 50 * s,
        lineHeight: 1.2,
        color: INK,
        textWrap: 'balance',
      }}
    >
      <Words text={text} delay={3} per={1.7} />
    </div>
  );
};

const Hud: React.FC<{seq: number; settled: boolean}> = ({seq, settled}) => {
  const s = useScale();
  const base: React.CSSProperties = {
    position: 'absolute',
    fontFamily: MONO,
    fontSize: 15 * s,
    letterSpacing: 1.3,
    color: 'rgba(236,234,255,.42)',
    whiteSpace: 'pre',
  };
  return (
    <>
      <div style={{...base, left: 34 * s, top: 30 * s}}>
        {`SEQ ${String(seq).padStart(2, '0')} / ${String(SCENES.length).padStart(2, '0')}`}
      </div>
      <div style={{...base, right: 34 * s, top: 30 * s}}>FREE-AI-SETUP</div>
      <div style={{...base, left: 34 * s, bottom: 28 * s}}>6 providers · 1 local</div>
      <div style={{...base, right: 34 * s, bottom: 28 * s}}>
        {settled ? 'camera: settled' : 'camera: drift'}
      </div>
    </>
  );
};

/**
 * Music volume at a given frame: quiet under narration, up in the gaps,
 * faded at both ends. The ramps are deliberately a few frames long, because
 * an instant jump in level is audible as a click.
 */
const musicVolumeAt = (f: number) => {
  const t = f / FPS;
  const speaking = SCENES.some((s) => {
    const start = s.from + VOICEOVER_DELAY_SECONDS;
    return t > start - 0.35 && t < start + 5;
  });
  const target = speaking ? MUSIC_DUCK : MUSIC_VOLUME;
  const fadeIn = Math.min(1, t / 1.2);
  const fadeOut = Math.min(1, (TOTAL_FRAMES / FPS - t) / MUSIC_FADE_SECONDS);
  return target * fadeIn * Math.max(0, fadeOut);
};

export const Video: React.FC = () => {
  const frame = useCurrentFrame();
  const active = useActiveScene();

  /*
   * The camera does two things at once: a slow drift shared by the whole
   * film, and a deliberate move across each scene (push in, pull back, or a
   * pan). Scenes carrying a screenshot keep the move but at a fraction of the
   * amplitude, so the picture stays readable while never being quite still.
   */
  const amp = active.settle ? 0.25 : 1;
  const local = (frame - active.from * FPS) / (active.dur * FPS); // 0..1 through the scene
  const ease = 0.5 - Math.cos(Math.min(1, Math.max(0, local)) * Math.PI) / 2;

  const moves = {
    push: {sx: 1 + ease * 0.09, mx: 0, my: -ease * 14},
    pull: {sx: 1.055 - ease * 0.055, mx: 0, my: ease * 10},
    panL: {sx: 1.05, mx: (0.5 - ease) * 150, my: 0},
    panR: {sx: 1.05, mx: (ease - 0.5) * 150, my: 0},
  } as const;
  const mv = moves[active.cam];

  const tx = Math.sin(frame / 92) * 12 * amp + mv.mx * (active.settle ? 0.45 : 1);
  const ty = Math.cos(frame / 118) * 8 * amp + mv.my;
  const rot = Math.sin(frame / 165) * 0.5 * amp;
  const scale = 1 + (mv.sx - 1) * (active.settle ? 0.5 : 1);

  return (
    <AbsoluteFill style={{background: '#06040e'}}>
      {MUSIC_FILE ? (
        <Audio src={staticFile(MUSIC_FILE)} volume={(f) => musicVolumeAt(f)} />
      ) : null}
      <Atmosphere />
      <Floor drift={(frame * (active.settle ? 0.5 : 1.4)) % 118} />

      <AbsoluteFill
        style={{
          transform: `translate(${tx}px,${ty}px) rotate(${rot}deg) scale(${scale})`,
        }}
      >
        {SCENES.map((scene) => {
          const Comp = SCENES_BY_ID[scene.id];
          return (
            <Sequence
              key={scene.id}
              from={scene.from * FPS}
              durationInFrames={scene.dur * FPS}
              name={scene.id}
              layout="none"
            >
              <Comp />
            </Sequence>
          );
        })}
      </AbsoluteFill>

      {SCENES.map((scene, i) => (
        <Sequence
          key={`t-${scene.id}`}
          from={scene.from * FPS}
          durationInFrames={scene.dur * FPS}
          name={`${scene.id}-text`}
          layout="none"
        >
          <Caption text={scene.caption} />
          <Hud seq={i + 1} settled={scene.settle} />
          {VOICEOVER ? (
            <Sequence from={Math.round(VOICEOVER_DELAY_SECONDS * FPS)} layout="none">
              <Audio src={staticFile(`vo/${scene.id}.mp3`)} volume={VOICEOVER_VOLUME} />
            </Sequence>
          ) : null}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
