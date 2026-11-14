import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import {FPS, SCENES, VOICEOVER, VOICEOVER_DELAY_SECONDS, VOICEOVER_VOLUME} from './config';
import {useScale} from './layout';
import {Atmosphere, Floor, GROTESK, INK, MONO} from './design/world';
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
      {text}
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

export const Video: React.FC = () => {
  const frame = useCurrentFrame();
  const active = useActiveScene();

  // One camera for the whole film. It nearly stops wherever a screenshot has
  // to be read, and drifts freely everywhere else.
  const amp = active.settle ? 0.2 : 1;
  const tx = Math.sin(frame / 92) * 14 * amp;
  const ty = Math.cos(frame / 118) * 9 * amp;
  const rot = Math.sin(frame / 165) * 0.65 * amp;

  return (
    <AbsoluteFill style={{background: '#06040e'}}>
      <Atmosphere />
      <Floor drift={(frame * (active.settle ? 0.5 : 1.4)) % 118} />

      <AbsoluteFill style={{transform: `translate(${tx}px,${ty}px) rotate(${rot}deg)`}}>
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
