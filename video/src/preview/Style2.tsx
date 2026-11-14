import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import {useScale} from '../layout';
import {ACCENT, ChatCard, Gpu, INK, IsoFloor, Laptop, Rack, Router} from '../design/iso';

/**
 * Style study: flat-shaded 3D props on a blue-black floor, annotated with
 * chips, with a karaoke caption at the bottom. Four frames, each built from
 * different objects. Render stills at 20 / 50 / 80 / 110.
 */

const MONO = '"JetBrains Mono", monospace';
const GROTESK = '"Space Grotesk", sans-serif';

/** Blue-black room with a receding floor. */
const Room: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#070c16'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(70% 50% at 50% 26%, #0f1a2d 0%, #070c16 74%)',
        }}
      />
      {children}
    </div>
  );
};

/** The isometric stage: one SVG, authored in iso space. */
const Stage: React.FC<{children: React.ReactNode; tx?: number; ty?: number; k?: number}> = ({
  children,
  tx = 540,
  ty = 470,
  k = 1,
}) => (
  <svg width={1080} height={1080} style={{position: 'absolute', inset: 0}}>
    <g transform={`translate(${tx} ${ty}) scale(${k})`}>
      <IsoFloor />
      {children}
    </g>
  </svg>
);

/** The 1080 square everything is authored in. */
const Frame: React.FC<{children: React.ReactNode}> = ({children}) => {
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

/** A label pinned onto the scene. */
const Chip: React.FC<{x: number; y: number; text: string; hot?: boolean}> = ({
  x,
  y,
  text,
  hot,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      background: hot ? ACCENT : '#0a0f1b',
      color: hot ? '#140a02' : INK,
      border: hot ? 'none' : '1.4px solid rgba(255,255,255,.22)',
      borderRadius: 7,
      padding: '7px 13px',
      fontFamily: MONO,
      fontSize: 19,
      fontWeight: 700,
      letterSpacing: 1.4,
      whiteSpace: 'nowrap',
      boxShadow: '0 8px 24px rgba(0,0,0,.5)',
    }}
  >
    {text}
  </div>
);

/** Thin leader line from a chip to the thing it names. */
const Leader: React.FC<{x1: number; y1: number; x2: number; y2: number}> = ({
  x1,
  y1,
  x2,
  y2,
}) => (
  <svg width={1080} height={1080} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,.4)" strokeWidth={1.4} />
    <circle cx={x2} cy={y2} r={3.4} fill="rgba(255,255,255,.65)" />
  </svg>
);

/** The caption: words arrive as spoken, one word boxed in the accent. */
const Caption: React.FC<{words: string[]; hot?: number; from?: number}> = ({
  words,
  hot,
  from = 0,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 108,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          background: 'rgba(8,12,20,.92)',
          border: '1.5px solid rgba(255,255,255,.16)',
          borderRadius: 12,
          padding: '14px 20px',
          boxShadow: '0 18px 44px rgba(0,0,0,.6)',
        }}
      >
        {words.map((w, i) => {
          const t = interpolate(frame, [from + i * 5, from + i * 5 + 6], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const isHot = hot === i;
          return (
            <span
              key={i}
              style={{
                fontFamily: GROTESK,
                fontWeight: 700,
                fontSize: 40,
                color: isHot ? '#140a02' : INK,
                background: isHot ? ACCENT : 'transparent',
                borderRadius: 6,
                padding: isHot ? '2px 10px' : '2px 0',
                opacity: t,
                transform: `translateY(${(1 - t) * 10}px)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Segmented progress, top right. */
const Segments: React.FC<{done: number; total?: number}> = ({done, total = 10}) => (
  <div style={{position: 'absolute', right: 34, top: 32, display: 'flex', gap: 5}}>
    {Array.from({length: total}).map((_, i) => (
      <div
        key={i}
        style={{
          width: 15,
          height: 13,
          background: i < done ? ACCENT : 'rgba(255,255,255,.18)',
        }}
      />
    ))}
  </div>
);

const Source: React.FC<{text: string}> = ({text}) => (
  <div
    style={{
      position: 'absolute',
      left: 34,
      top: 32,
      fontFamily: MONO,
      fontSize: 18,
      letterSpacing: 2.5,
      color: 'rgba(238,242,251,.6)',
    }}
  >
    {text}
  </div>
);

const Fine: React.FC<{text: string}> = ({text}) => (
  <div
    style={{
      position: 'absolute',
      left: 34,
      bottom: 34,
      fontFamily: MONO,
      fontSize: 15,
      letterSpacing: 2,
      color: 'rgba(238,242,251,.32)',
    }}
  >
    {text}
  </div>
);

/* ------------------------------------------------------------ the frames */

const A: React.FC = () => (
  <>
    <Room />
    <Frame>
      <Stage ty={520} k={1.5}>
        <Laptop x={-75} y={-50} />
      </Stage>
      <Source text="AI · LOCAL" />
      <Segments done={2} />
      <Chip x={96} y={300} text="YOUR LAPTOP" />
      <Chip x={690} y={620} text="NO BIG GPU" hot />
      <Caption words={['Most', 'laptops', 'are', 'not', 'powerful.']} hot={4} />
      <Fine text="SIMPLIFIED" />
    </Frame>
  </>
);

const B: React.FC = () => (
  <>
    <Room />
    <Frame>
      <Stage ty={430} k={1.35}>
        <Rack x={-100} y={100} lit label="GROQ" />
        <Rack x={0} y={0} label="GEMINI" />
        <Rack x={100} y={-100} label="NVIDIA" />
      </Stage>
      <Source text="AI · FREE TIERS" />
      <Segments done={5} />
      <Chip x={110} y={250} text="FREE TIER" hot />
      <Chip x={660} y={330} text="DAILY LIMIT" />
      <Caption words={['Free', 'tiers', 'from', 'four', 'providers.']} hot={0} />
      <Fine text="ILLUSTRATIVE" />
    </Frame>
  </>
);

const C: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Room />
      <Frame>
        <Stage ty={450} k={1.5}>
          <Gpu x={-130} y={-70} spin={frame} />
          <Gpu x={-40} y={60} spin={frame * 1.25} />
        </Stage>
        <Source text="AI · KAGGLE" />
        <Segments done={7} />
        <Chip x={640} y={300} text="2 × TESLA T4" hot />
        <Chip x={110} y={740} text="FREE, HOURS PER WEEK" />
        <Caption words={['Kaggle', 'lends', 'you', 'two', 'GPUs.']} hot={4} />
        <Fine text="FREE TIER · WEEKLY QUOTA" />
      </Frame>
    </>
  );
};

const D: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Room />
      <Frame>
        <Stage ty={430} k={1.12}>
          <Rack x={120} y={-230} lit label="GROQ" />
          <Rack x={210} y={-150} label="GEMINI" />
          <Router x={-65} y={-45} pulse={frame} />
          <Laptop x={-300} y={130} />
          <ChatCard x={150} y={110} scale={0.95} />
        </Stage>
        <Source text="AI · THE ROUTER" />
        <Segments done={9} />
        <Chip x={430} y={330} text="OMNIROUTE" hot />
        <Chip x={70} y={640} text="YOUR LAPTOP" />
        <Chip x={740} y={170} text="FREE TIERS" />
        <Chip x={690} y={560} text="OPEN WEBUI" />
        <Caption words={['One', 'router', 'in', 'front', 'of', 'all.']} hot={1} />
        <Fine text="SIMPLIFIED" />
      </Frame>
    </>
  );
};

const FRAMES = [A, B, C, D];

export const Style2: React.FC = () => {
  const frame = useCurrentFrame();
  const F = FRAMES[Math.min(FRAMES.length - 1, Math.floor(frame / 30))];
  return (
    <AbsoluteFill style={{background: '#070c16'}}>
      <F />
    </AbsoluteFill>
  );
};
