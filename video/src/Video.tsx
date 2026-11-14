import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile} from 'remotion';
import {
  C,
  FPS,
  MUSIC_FADE_SECONDS,
  MUSIC_FILE,
  MUSIC_VOLUME,
  SCENES,
  TOTAL_FRAMES,
} from './config';
import {Caption} from './components/Caption';
import {Hook} from './scenes/Hook';
import {Twist} from './scenes/Twist';
import {Problem} from './scenes/Problem';
import {FrontDesk} from './scenes/FrontDesk';
import {Privacy} from './scenes/Privacy';
import {Scripts} from './scenes/Scripts';
import {Proof} from './scenes/Proof';
import {CTA} from './scenes/CTA';

/** One component per storyboard scene, keyed by the id used in config.ts. */
const SCENE_COMPONENTS = {
  hook: Hook,
  twist: Twist,
  problem: Problem,
  frontdesk: FrontDesk,
  privacy: Privacy,
  scripts: Scripts,
  proof: Proof,
  cta: CTA,
} as const;

/**
 * The whole video: each scene is a <Sequence>, and the caption for that scene
 * is rendered here rather than inside the scene, so the burned-in text and the
 * SRT file always come from the same place (config.ts).
 */
export const Video: React.FC = () => (
  <AbsoluteFill style={{background: C.bg}}>
    {/*
      Optional background music. Nothing is rendered unless MUSIC_FILE is set
      in config.ts, so the video stays silent by default.
    */}
    {MUSIC_FILE ? (
      <Audio
        src={staticFile(MUSIC_FILE)}
        volume={(f) =>
          interpolate(
            f,
            [TOTAL_FRAMES - MUSIC_FADE_SECONDS * FPS, TOTAL_FRAMES],
            [MUSIC_VOLUME, 0],
            {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
          )
        }
      />
    ) : null}

    {SCENES.map((scene) => {
      const Comp = SCENE_COMPONENTS[scene.id];
      return (
        <Sequence
          key={scene.id}
          from={scene.from * FPS}
          durationInFrames={scene.dur * FPS}
          name={scene.id}
        >
          <Comp />
          <Caption text={scene.caption} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
