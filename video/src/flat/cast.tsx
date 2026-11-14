import React from 'react';
import {Img, staticFile} from 'remotion';
import {CARD, CORAL, FONT, Face, Gpu, INK, MINT, Mood, SKY, SOFT, SUN, Shadow, bounce} from './kit';
import {SHOTS, ShotId} from '../shots';
import WORDS from './words.json';

export const VO_DELAY = 8;
/** Frame (within a scene) at which a word starts being spoken. */
export const at = (id: keyof typeof WORDS, word: string, nth = 0) => {
  const norm = (s: string) => s.replace(/[,.!?]/g, '').toLowerCase();
  const hits = (WORDS[id] as {w: string; s: number}[]).filter((w) => norm(w.w) === norm(word));
  const w = hits[nth] ?? hits[0];
  if (!w) throw new Error(`word "${word}" not in ${id}`);
  return VO_DELAY + Math.round(w.s * 30);
};

/* ---------------- characters (SVG) ---------------- */
/** Model cube, 240 x 210 box, with a face on its front. */
export const Cube: React.FC<{blink?: boolean; mood?: Mood}> = ({blink, mood = 'happy'}) => (
  <g>
    <polygon points="120,30 190,70 120,110 50,70" fill="#8fe3fa" />
    <polygon points="50,70 120,110 120,190 50,150" fill={SKY} />
    <polygon points="190,70 120,110 120,190 190,150" fill="#2a9fc4" />
    <Face x={92} y={128} s={0.42} blink={blink} mood={mood} />
  </g>
);

export const Cloud: React.FC<{blink?: boolean; mood?: Mood}> = ({blink, mood = 'happy'}) => (
  <g>
    <circle cx="80" cy="120" r="42" fill={CORAL} />
    <circle cx="135" cy="95" r="56" fill={CORAL} />
    <circle cx="180" cy="128" r="36" fill={CORAL} />
    <rect x="60" y="118" width="150" height="46" rx="23" fill={CORAL} />
    <Face x={132} y={118} s={0.55} blink={blink} mood={mood} ink="#5a1020" />
  </g>
);

export const Router: React.FC<{blink?: boolean; lights?: number}> = ({blink, lights = 0}) => (
  <g>
    <Shadow y={150} w={420} />
    {[-80, 0, 80].map((x, i) => (
      <g key={x}>
        <rect x={x - 5} y={-42} width={10} height={60} rx={5} fill={SOFT} />
        <circle cx={x} cy={-48} r={13} fill={[SKY, CORAL, SUN][i]} />
      </g>
    ))}
    <rect x={-200} y={0} width={400} height={140} rx={40} fill={MINT} />
    <rect x={-200} y={100} width={400} height={40} rx={20} fill="#21a586" />
    <Face x={0} y={52} s={0.7} blink={blink} ink="#0b3d31" />
    {[-150, -120, -90].map((x, i) => (
      <circle key={x} cx={x} cy={120} r={7} fill={Math.floor(lights) % 3 === i ? '#ffffff' : '#7fe0c6'} />
    ))}
  </g>
);

/** Small source icon on a coloured disc, for maps. */
export const Badge: React.FC<{kind: 'cube' | 'cloud' | 'gpu'}> = ({kind}) => {
  const c = {cube: SKY, cloud: CORAL, gpu: SUN}[kind];
  return (
    <g>
      <circle r={86} fill={CARD} />
      <circle r={86} fill="none" stroke={c} strokeWidth={8} />
      <g transform="scale(0.55) translate(-120, -112)">
        {kind === 'cube' ? <Cube /> : kind === 'cloud' ? <Cloud /> : <Gpu />}
      </g>
    </g>
  );
};

/* ---------------- HTML pieces ---------------- */
export const Pill: React.FC<{text: string; color: string; frame: number; at: number; top: number; dark?: boolean}> = ({
  text, color, frame, at: start, top, dark = true,
}) => {
  const p = bounce(frame, start, 240, 10);
  if (frame < start) return null;
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 40, color: dark ? '#000' : '#fff', background: color,
        borderRadius: 60, padding: '14px 36px', transform: `scale(${Math.max(0, p)}) rotate(${(1 - p) * -8}deg)`}}>
        {text.toUpperCase()}
      </div>
    </div>
  );
};

const Bar: React.FC<{title?: string}> = ({title}) => (
  <div style={{background: '#2a2a31', borderRadius: '22px 22px 0 0', height: 52, display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 22}}>
    {[CORAL, SUN, MINT].map((c) => <div key={c} style={{width: 18, height: 18, borderRadius: 9, background: c}} />)}
    {title ? <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 26, letterSpacing: 1, color: SOFT, marginLeft: 14}}>{title.toUpperCase()}</div> : null}
  </div>
);

/** Terminal that types its lines out, one character every frame. */
export const Terminal: React.FC<{frame: number; start: number; top: number; lines: string[]}> = ({frame, start, top, lines}) => {
  const p = bounce(frame, start - 6, 200, 14);
  let budget = Math.max(0, frame - start) * 1.2;
  return (
    <div style={{position: 'absolute', top, left: 70, right: 70, opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 120}px)`}}>
      <Bar />
      <div style={{background: '#0b0b0e', borderRadius: '0 0 22px 22px', padding: '26px 34px', fontFamily: '"JetBrains Mono", monospace', fontSize: 40, lineHeight: 1.55, minHeight: 130}}>
        {lines.map((l, i) => {
          const n = Math.min(l.length, Math.floor(budget));
          budget -= l.length + 8;
          const typing = n < l.length && n >= 0;
          return (
            <div key={i} style={{color: l.startsWith('>') ? MINT : '#e6e8ff', minHeight: 62}}>
              {l.slice(0, Math.max(0, n))}
              {typing && Math.floor(frame / 8) % 2 === 0 ? <span style={{color: INK}}>▌</span> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** A real screenshot in a flat window that slides up. `mark` highlights a row of the crop (0-1 from top, height 0-1). */
export const Window: React.FC<{frame: number; start: number; id: ShotId; top: number; width?: number; title?: string; mark?: [number, number] | null}> = ({
  frame, start, id, top, width = 940, title, mark,
}) => {
  const s = SHOTS[id];
  const k = width / s.crop.w;
  const h = s.crop.h * k;
  const p = bounce(frame, start, 170, 13);
  if (frame < start) return null;
  const light = 'light' in s && s.light;
  return (
    <div style={{position: 'absolute', top, left: (1080 - width) / 2, width, opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 200}px) scale(${0.9 + 0.1 * p})`}}>
      <Bar title={title ?? s.label} />
      <div style={{width, height: h, overflow: 'hidden', position: 'relative', borderRadius: '0 0 22px 22px', background: '#0c0c0c'}}>
        <Img src={staticFile(s.file)} style={{position: 'absolute', width: s.nw * k, left: -s.crop.x * k, top: -s.crop.y * k,
          filter: light ? 'invert(1) hue-rotate(180deg) brightness(0.92) contrast(1.08)' : undefined}} />
        {mark ? <div style={{position: 'absolute', left: 0, right: 0, top: mark[0] * h, height: mark[1] * h,
          background: `${SUN}33`, borderLeft: `8px solid ${SUN}`}} /> : null}
      </div>
    </div>
  );
};
