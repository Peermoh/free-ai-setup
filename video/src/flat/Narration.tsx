import React from 'react';
import {useCurrentFrame} from 'remotion';
import WORDS from './words.json';
import {CORAL, FONT, FPS, MINT, SKY, SUN, bounce} from './kit';

type Word = {w: string; s: number; e: number};
const COLOURS = [SUN, SKY, CORAL, MINT];

/** Split at punctuation, then into balanced chunks of at most 4 words. */
const chunk = (words: Word[]): Word[][] => {
  const clauses: Word[][] = [[]];
  words.forEach((w) => {
    clauses[clauses.length - 1].push(w);
    if (/[,.!?]$/.test(w.w)) clauses.push([]);
  });
  const out: Word[][] = [];
  clauses.filter((c) => c.length).forEach((c) => {
    const k = Math.ceil(c.length / 4);
    let i = 0;
    for (let j = 0; j < k; j++) {
      const size = Math.floor((c.length - i) / (k - j));
      out.push(c.slice(i, i + size));
      i += size;
    }
  });
  return out;
};

/**
 * The spoken words, in capitals, appearing as they are said. The word being
 * spoken pops and takes a colour; words already said stay white.
 */
export const Narration: React.FC<{id: keyof typeof WORDS; delay: number; top?: number}> = ({id, delay, top = 1400}) => {
  const f = useCurrentFrame();
  const t = (f - delay) / FPS;
  const chunks = chunk(WORDS[id] as Word[]);
  const idx = chunks.findIndex((c, i) => {
    const next = chunks[i + 1];
    return t >= c[0].s - 0.05 && (next ? t < next[0].s - 0.05 : t < c[c.length - 1].e + 0.8);
  });
  if (idx < 0) return null;
  const words = chunks[idx];
  return (
    <div style={{position: 'absolute', top, left: 50, right: 50, display: 'flex', justifyContent: 'center',
      flexWrap: 'wrap', gap: '0 34px', fontFamily: FONT, fontWeight: 800, fontSize: 70, lineHeight: 1.2}}>
      {words.map((w, i) => {
        const start = delay + Math.round(w.s * FPS);
        if (f < start - 1) return <span key={i} style={{opacity: 0}}>{clean(w.w)}</span>;
        const p = bounce(f, start - 1, 260, 11);
        const speaking = t >= w.s && t < Math.max(w.e, w.s + 0.18) + 0.08;
        const colour = COLOURS[(idx + i) % COLOURS.length];
        return (
          <span key={i} style={{display: 'inline-block', color: speaking ? colour : '#ffffff',
            transform: `translateY(${(1 - p) * 40}px) scale(${(speaking ? 1.12 : 1) * Math.max(0, p)})`,
            textShadow: speaking ? `0 0 24px ${colour}aa, 0 6px 0 #00000088` : '0 6px 0 #00000088'}}>
            {clean(w.w)}
          </span>
        );
      })}
    </div>
  );
};

const clean = (w: string) => w.replace(/[,.!?]/g, '').toUpperCase();
