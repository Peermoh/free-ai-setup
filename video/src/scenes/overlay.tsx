import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ACCENT} from '../design/iso';
import {SceneId} from '../config';

const MONO = '"JetBrains Mono", monospace';
const GROTESK = '"Space Grotesk", sans-serif';
const INK = '#eef2fb';

/** A label pinned on the scene, arriving with a small pop. */
export const Chip: React.FC<{
  x: number;
  y: number;
  text: string;
  hot?: boolean;
  at?: number;
}> = ({x, y, text, hot, at = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - at, fps, config: {damping: 13}});
  if (p <= 0.001) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity: Math.min(1, p * 1.6),
        transform: `translateY(${(1 - p) * 16}px) scale(${0.88 + p * 0.12})`,
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
        boxShadow: '0 8px 24px rgba(0,0,0,.55)',
      }}
    >
      {text}
    </div>
  );
};

/**
 * The caption.
 *
 * The narration line is split into chunks of a few words, each chunk taking
 * its share of the scene, and inside a chunk the words arrive one at a time.
 * One word per chunk is boxed in the accent: it lands on the stressed beat,
 * which is what makes the line feel spoken rather than displayed.
 */
export const Karaoke: React.FC<{
  text: string;
  durationInFrames: number;
  hot?: string[];
  size?: number;
}> = ({text, durationInFrames, hot = [], size = 40}) => {
  const frame = useCurrentFrame();
  const words = text.split(' ');

  /*
   * Chunking matters more than it looks: a fixed every-five-words split
   * produces fragments like "you" or "things." that carry no meaning on
   * their own. Break after punctuation where possible, keep chunks to four
   * to six words, and never leave a one or two word orphan at the end.
   */
  const chunks: string[][] = [];
  let cur: string[] = [];
  for (const w of words) {
    cur.push(w);
    const ends = /[.,;:?!]$/.test(w);
    if ((cur.length >= 4 && ends) || cur.length >= 6) {
      chunks.push(cur);
      cur = [];
    }
  }
  if (cur.length) chunks.push(cur);
  if (chunks.length > 1 && chunks[chunks.length - 1].length <= 2) {
    const tail = chunks.pop() as string[];
    chunks[chunks.length - 1] = chunks[chunks.length - 1].concat(tail);
  }

  const start = 8;
  const span = Math.max(24, (durationInFrames - start - 6) / chunks.length);
  const index = Math.min(chunks.length - 1, Math.max(0, Math.floor((frame - start) / span)));
  const chunk = chunks[index];
  const local = frame - (start + index * span);

  const isHot = (w: string) =>
    hot.some((h) => w.toLowerCase().replace(/[^a-z0-9-]/g, '') === h.toLowerCase());

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 104,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          maxWidth: 940,
          flexWrap: 'wrap',
          justifyContent: 'center',
          background: 'rgba(8,12,20,.92)',
          border: '1.5px solid rgba(255,255,255,.16)',
          borderRadius: 12,
          padding: '14px 20px',
          boxShadow: '0 18px 44px rgba(0,0,0,.6)',
        }}
      >
        {chunk.map((w, i) => {
          const t = interpolate(local, [i * 4, i * 4 + 6], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const h = isHot(w);
          return (
            <span
              key={`${index}-${i}`}
              style={{
                fontFamily: GROTESK,
                fontWeight: 700,
                fontSize: size,
                color: h ? '#140a02' : INK,
                background: h ? ACCENT : 'transparent',
                borderRadius: 6,
                padding: h ? '2px 10px' : '2px 0',
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

export const Segments: React.FC<{done: number; total: number}> = ({done, total}) => (
  <div style={{position: 'absolute', right: 34, top: 32, display: 'flex', gap: 5}}>
    {Array.from({length: total}).map((_, i) => (
      <div
        key={i}
        style={{width: 15, height: 13, background: i < done ? ACCENT : 'rgba(255,255,255,.18)'}}
      />
    ))}
  </div>
);

export const Source: React.FC<{text: string}> = ({text}) => (
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

export const Fine: React.FC<{text: string}> = ({text}) => (
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

/** What each scene puts on top of its stage. */
export type Over = {
  source: string;
  fine: string;
  hot: string[];
  chips: {x: number; y: number; text: string; hot?: boolean; at: number}[];
  /** The closing scene types a comment instead of showing a caption. */
  cta?: boolean;
};

export const OVERLAYS: Record<SceneId, Over> = {
  hook: {
    source: 'AI · LOCAL',
    fine: 'SIMPLIFIED',
    hot: ['own'],
    chips: [
      {x: 92, y: 300, text: 'YOUR LAPTOP', at: 16},
      {x: 640, y: 250, text: 'A MODEL, RUNNING HERE', hot: true, at: 44},
    ],
  },
  nogpu: {
    source: 'AI · THE PROBLEM',
    fine: 'TYPICAL WORK LAPTOP',
    hot: ['GPU.'],
    chips: [
      {x: 92, y: 290, text: '8–16 GB RAM', at: 12},
      {x: 620, y: 600, text: 'NO DEDICATED GPU', hot: true, at: 34},
    ],
  },
  still: {
    source: 'AI · STILL WORKS',
    fine: 'BIGGER MODEL NEEDS A GPU',
    hot: ['works.', 'powerful.'],
    chips: [
      {x: 86, y: 270, text: 'SMALL MODEL · 3B', at: 14},
      {x: 640, y: 540, text: 'WITH A GPU · 27B', hot: true, at: 86},
    ],
  },
  three: {
    source: 'AI · THE RECIPE',
    fine: 'SIMPLIFIED',
    hot: ['three'],
    chips: [
      {x: 110, y: 690, text: '1 · YOUR LAPTOP', at: 14},
      {x: 430, y: 420, text: '2 · FREE TIERS', at: 34},
      {x: 680, y: 240, text: '3 · FREE GPU', hot: true, at: 54},
    ],
  },
  local: {
    source: 'AI · OLLAMA',
    fine: 'NOTHING LEAVES THE MACHINE',
    hot: ['Ollama.'],
    chips: [
      {x: 92, y: 260, text: 'llama3.2:3b', at: 16},
      {x: 620, y: 600, text: 'PRIVATE', hot: true, at: 50},
    ],
  },
  tiers: {
    source: 'AI · FREE TIERS',
    fine: 'LIMITS AND DATA TERMS VARY',
    hot: ['Free'],
    chips: [
      {x: 90, y: 250, text: 'FREE TIER', hot: true, at: 20},
      {x: 650, y: 330, text: 'DAILY LIMIT', at: 62},
    ],
  },
  gpu: {
    source: 'AI · KAGGLE',
    fine: 'FREE TIER · WEEKLY QUOTA',
    hot: ['two'],
    chips: [
      {x: 640, y: 280, text: '2 × TESLA T4', hot: true, at: 18},
      {x: 100, y: 700, text: 'HOURS PER WEEK', at: 50},
    ],
  },
  route: {
    source: 'AI · THE ROUTER',
    fine: 'SIMPLIFIED',
    hot: ['router,'],
    chips: [
      {x: 400, y: 330, text: 'OMNIROUTE', hot: true, at: 10},
      {x: 760, y: 190, text: 'FREE TIERS', at: 50},
      {x: 700, y: 630, text: 'FREE GPU', at: 62},
      {x: 80, y: 660, text: 'YOUR LAPTOP', at: 74},
    ],
  },
  chat: {
    source: 'AI · OPEN WEBUI',
    fine: 'ONE PAGE, EVERY MODEL',
    hot: ['one'],
    chips: [
      {x: 110, y: 250, text: 'OPEN WEBUI', hot: true, at: 12},
      {x: 700, y: 230, text: 'THE ROUTER', at: 36},
    ],
  },
  cta: {
    source: 'AI · LOCAL',
    fine: 'SCRIPTS + GUIDE',
    hot: ['ai-local'],
    chips: [],
    cta: true,
  },
};

/** The closing card: a comment box that types the keyword. */
export const CallToAction: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - 4, fps, config: {damping: 15}});
  const typed = 'ai-local'.slice(0, Math.max(0, Math.floor((frame - 40) / 3)));
  const caret = Math.floor(frame / 9) % 2 === 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 86,
        textAlign: 'center',
        opacity: Math.min(1, p * 1.4),
        transform: `translateY(${(1 - p) * 26}px)`,
      }}
    >
      <div style={{fontFamily: GROTESK, fontWeight: 700, fontSize: 62, color: INK}}>
        Want the scripts?
      </div>
      <div
        style={{
          marginTop: 22,
          display: 'inline-block',
          padding: '16px 28px',
          borderRadius: '18px 18px 18px 5px',
          background: 'rgba(8,12,20,.95)',
          border: `2px solid ${ACCENT}`,
          fontFamily: MONO,
          fontSize: 46,
          fontWeight: 700,
          color: INK,
          letterSpacing: 1,
          minWidth: 300,
        }}
      >
        {typed}
        <span style={{color: ACCENT}}>{caret ? '▌' : '\u00A0'}</span>
      </div>
      <div
        style={{
          marginTop: 18,
          fontFamily: MONO,
          fontSize: 24,
          letterSpacing: 3,
          color: 'rgba(238,242,251,.6)',
        }}
      >
        COMMENT BELOW · I WILL SHARE THE GUIDE
      </div>
    </div>
  );
};
