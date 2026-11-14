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
import {Backdrop} from './design/backdrop';
import {Progress} from './design/anim';
import {MONO, VIOLET} from './design/world';
import {SCENES_BY_ID} from './scenes/film';

/**
 * The film.
 *
 * There is no subtitle bar. Each scene brings its own moving background and
 * its own text beats, and the camera makes a deliberate move across it.
 */

/** Scales the 1080 square the scenes are authored in. */
const DesignFrame: React.FC<{children: React.ReactNode}> = ({children}) => {
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

const useActiveScene = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return SCENES.find((s) => t >= s.from && t < s.from + s.dur) ?? SCENES[SCENES.length - 1];
};

/**
 * Music volume at a frame: quiet under narration, up in the gaps, faded at
 * both ends. The ramps run over several frames because an instant level
 * change is audible as a click.
 */
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

export const Video: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useScale();
  const active = useActiveScene();

  // A deliberate move across each scene, plus a drift shared by the film.
  const amp = active.settle ? 0.25 : 1;
  const local = (frame - active.from * FPS) / (active.dur * FPS);
  const ease = 0.5 - Math.cos(Math.min(1, Math.max(0, local)) * Math.PI) / 2;
  const moves = {
    push: {sx: 1 + ease * 0.085, mx: 0, my: -ease * 13},
    pull: {sx: 1.055 - ease * 0.055, mx: 0, my: ease * 10},
    panL: {sx: 1.05, mx: (0.5 - ease) * 140, my: 0},
    panR: {sx: 1.05, mx: (ease - 0.5) * 140, my: 0},
  } as const;
  const mv = moves[active.cam];
  const tx = Math.sin(frame / 92) * 11 * amp + mv.mx * (active.settle ? 0.45 : 1);
  const ty = Math.cos(frame / 118) * 7 * amp + mv.my;
  const rot = Math.sin(frame / 165) * 0.45 * amp;
  const scale = 1 + (mv.sx - 1) * (active.settle ? 0.5 : 1);

  return (
    <AbsoluteFill style={{background: '#05040c'}}>
      {MUSIC_FILE ? (
        <Audio src={staticFile(MUSIC_FILE)} volume={(f) => musicVolumeAt(f)} />
      ) : null}

      {/* Each explanation brings its own moving background. */}
      {SCENES.map((scene) => (
        <Sequence
          key={`bg-${scene.id}`}
          from={scene.from * FPS}
          durationInFrames={scene.dur * FPS}
          name={`${scene.id}-bg`}
          layout="none"
        >
          <SceneBackdrop id={scene.bg} />
        </Sequence>
      ))}

      <AbsoluteFill
        style={{transform: `translate(${tx}px,${ty}px) rotate(${rot}deg) scale(${scale})`}}
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
              <DesignFrame>
                <Comp />
              </DesignFrame>
            </Sequence>
          );
        })}
      </AbsoluteFill>

      {/* Narration, one clip per scene, a beat after the scene opens. */}
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

      <div
        style={{
          position: 'absolute',
          right: 30 * s,
          top: 26 * s,
          fontFamily: MONO,
          fontSize: 15 * s,
          letterSpacing: 2,
          color: 'rgba(236,234,255,.35)',
        }}
      >
        AI-LOCAL
      </div>
      <Progress total={TOTAL_FRAMES} colour={VIOLET} />
    </AbsoluteFill>
  );
};

/** Wrapper so the backdrop sees frames relative to its own scene. */
const SceneBackdrop: React.FC<{id: Parameters<typeof Backdrop>[0]['id']}> = ({id}) => {
  const f = useCurrentFrame();
  return <Backdrop id={id} sceneFrame={f} />;
};
