import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {C, FPS, SCENES} from './config';
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
