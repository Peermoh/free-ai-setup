import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import '@fontsource/sora/500.css';
import '@fontsource/sora/700.css';
import '@fontsource/sora/800.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import {FPS, MUSIC_DUCK, MUSIC_FILE, MUSIC_VOLUME, SCENES, TOTAL_FRAMES} from '../config';
import {SHOTS, ShotId} from '../shots';

/**
 * The plain cut.
 *
 * One idea per scene: a real screenshot of the running setup, large, with a
 * line of text under it — or, where there is nothing to show, the text alone.
 * Barely any motion beyond a slow drift on the image and a fade at each cut,
 * which is deliberate: a format with almost no motion is one whose quality
 * can be judged honestly from a single frame.
 */

const INK = '#f2f5fb';
const ACCENT = '#ff8a2b';
const BG = '#0b0f17';
const SORA = 'Sora, sans-serif';
const MONO = '"JetBrains Mono", monospace';

type Card = {
  kicker: string;
  title: string;
  shot?: ShotId;
  /** Shown instead of a screenshot. */
  points?: string[];
};

const CARDS: Record<string, Card> = {
  hook: {kicker: 'AI · LOCAL', title: 'Build your own AI setup', shot: 'models'},
  nogpu: {
    kicker: 'THE PROBLEM',
    title: 'No big GPU?',
    points: ['8–16 GB RAM', 'No dedicated GPU', 'An ordinary Windows laptop'],
  },
  still: {
    kicker: 'IT STILL WORKS',
    title: 'And a GPU makes it better',
    points: ['Small model runs on the CPU', 'With a GPU, a much bigger one'],
  },
  three: {
    kicker: 'THE RECIPE',
    title: 'Three things',
    points: ['1 · A model on your machine', '2 · Free provider tiers', '3 · A free GPU'],
  },
  local: {kicker: '1 · LOCAL MODEL', title: 'Ollama, on your laptop', shot: 'sync'},
  tiers: {kicker: '2 · FREE TIERS', title: 'Every limit, in the open', shot: 'providerMenu'},
  gpu: {kicker: '3 · FREE GPU', title: 'Kaggle lends you two', shot: 'kaggleFlow'},
  route: {kicker: 'THE ROUTER', title: 'One front door', shot: 'topology'},
  chat: {kicker: 'OPEN WEBUI', title: 'One chat page', shot: 'combos'},
  cta: {
    kicker: 'AI · LOCAL',
    title: 'Want the scripts?',
    points: ['Comment  ai-local', "I'll send the guide"],
  },
};

/** A screenshot, full width, drifting very slowly. */
const Screen: React.FC<{id: ShotId; dur: number}> = ({id, dur}) => {
  const frame = useCurrentFrame();
  const shot = SHOTS[id] as (typeof SHOTS)[keyof typeof SHOTS] & {light?: boolean};
  const {crop} = shot;

  const W = 1000; // design px, inside a 1080 frame
  const k = W / crop.w;
  const H = crop.h * k;

  const grow = interpolate(frame, [0, dur], [1, 1.05], {extrapolateRight: 'clamp'});
  const rise = interpolate(frame, [0, 14], [26, 0], {extrapolateRight: 'clamp'});
  const fade = interpolate(frame, [0, 10], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <div
      style={{
        width: W,
        height: H,
        overflow: 'hidden',
        borderRadius: 16,
        border: '1.5px solid rgba(255,255,255,.14)',
        boxShadow: '0 28px 70px rgba(0,0,0,.65)',
        opacity: fade,
        transform: `translateY(${rise}px) scale(${grow})`,
        position: 'relative',
        background: '#11161f',
      }}
    >
      <Img
        src={staticFile(shot.file)}
        style={{
          position: 'absolute',
          width: shot.nw * k,
          height: shot.nh * k,
          left: -crop.x * k,
          top: -crop.y * k,
          maxWidth: 'none',
          filter: shot.light
            ? 'invert(1) hue-rotate(180deg) brightness(0.92) contrast(1.08)'
            : undefined,
        }}
      />
    </div>
  );
};

/** Big statement lines, when there is nothing real to show. */
const Points: React.FC<{points: string[]}> = ({points}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{width: 940, display: 'flex', flexDirection: 'column', gap: 26}}>
      {points.map((p, i) => {
        const t = interpolate(frame, [10 + i * 9, 10 + i * 9 + 10], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div
            key={p}
            style={{
              opacity: t,
              transform: `translateY(${(1 - t) * 18}px)`,
              fontFamily: SORA,
              fontWeight: 600,
              fontSize: 54,
              color: INK,
              borderLeft: `5px solid ${ACCENT}`,
              paddingLeft: 26,
              lineHeight: 1.25,
            }}
          >
            {p}
          </div>
        );
      })}
    </div>
  );
};

const SceneCard: React.FC<{id: string; dur: number}> = ({id, dur}) => {
  const frame = useCurrentFrame();
  const c = CARDS[id];
  const kick = interpolate(frame, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
  const tIn = interpolate(frame, [4, 16], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 40px',
        paddingBottom: 90,
        gap: 46,
      }}
    >
      <div style={{width: 1000}}>
        <div
          style={{
            opacity: kick,
            fontFamily: MONO,
            fontSize: 26,
            letterSpacing: 4,
            color: ACCENT,
            marginBottom: 14,
          }}
        >
          {c.kicker}
        </div>
        <div
          style={{
            opacity: tIn,
            transform: `translateY(${(1 - tIn) * 16}px)`,
            fontFamily: SORA,
            fontWeight: 800,
            fontSize: 78,
            lineHeight: 1.08,
            letterSpacing: -1.5,
            color: INK,
          }}
        >
          {c.title}
        </div>
      </div>

      {c.shot ? <Screen id={c.shot} dur={dur} /> : <Points points={c.points ?? []} />}
    </AbsoluteFill>
  );
};

const musicAt = (f: number) => {
  const t = f / FPS;
  const speaking = SCENES.some((s) => t > s.from + 0.1 && t < s.from + s.dur - 0.2);
  const target = speaking ? MUSIC_DUCK : MUSIC_VOLUME;
  return target * Math.min(1, t / 1.2) * Math.max(0, Math.min(1, (TOTAL_FRAMES / FPS - t) / 2));
};

/** A quiet mark and a progress line, so the lower band is not dead space. */
const Mark: React.FC = () => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();
  const u = width / 1080;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 46 * u,
          bottom: 60 * u,
          fontFamily: MONO,
          fontSize: 22 * u,
          letterSpacing: 4,
          color: 'rgba(242,245,251,.4)',
        }}
      >
        AI · LOCAL
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 5 * u}}>
        <div
          style={{
            height: '100%',
            width: `${Math.min(100, (frame / TOTAL_FRAMES) * 100)}%`,
            background: ACCENT,
          }}
        />
      </div>
    </>
  );
};

export const Simple: React.FC = () => {
  const {width, height} = useVideoConfig();
  const scale = Math.min(width, height) / 1080;

  return (
    <AbsoluteFill style={{background: BG}}>
      {MUSIC_FILE ? (
        <Audio src={staticFile(MUSIC_FILE)} volume={(f) => musicAt(f)} />
      ) : null}

      <Mark />
      {SCENES.map((scene) => (
        <Sequence
          key={scene.id}
          from={Math.round(scene.from * FPS)}
          durationInFrames={Math.round(scene.dur * FPS)}
          name={scene.id}
          layout="none"
        >
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
                transform: `scale(${scale})`,
              }}
            >
              <SceneCard id={scene.id} dur={Math.round(scene.dur * FPS)} />
            </div>
          </AbsoluteFill>
          <Audio src={staticFile(`vo/${scene.id}.mp3`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
