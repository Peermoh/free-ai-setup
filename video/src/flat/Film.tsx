import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {
  BG, CORAL, FPS, Face, Gpu, Laptop, MINT, SKY, SUN, Shadow, Star, Title,
  blinking, bob, bounce, exit, squash,
} from './kit';

/** Scene lengths in frames: voice delay + clip + a beat. */
export const SCENES = [
  {id: 'hook', dur: Math.round(4.5 * FPS)},
  {id: 'nogpu', dur: Math.round(4.5 * FPS)},
];
const VO_DELAY = 8;

/* ---------- 0 · YOUR OWN AI ---------- */
const Hook: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exit(f, dur);
  const rise = bounce(f, 4, 120, 11);
  const {sx, sy} = squash(rise);
  const light = interpolate(f, [16, 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const face = bounce(f, 24, 220, 10);
  const y = 720 + (1 - rise) * 900 + (f > 30 ? bob(f, 7) : 0);
  const stars = [
    {x: 170, y: 640, r: 32, c: SUN, d: 30},
    {x: 920, y: 580, r: 24, c: SKY, d: 36},
    {x: 910, y: 1340, r: 36, c: CORAL, d: 42},
    {x: 150, y: 1300, r: 22, c: MINT, d: 48},
  ];
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        {stars.map((s, i) => {
          const p = bounce(f, s.d, 200, 9);
          const tw = 0.85 + 0.15 * Math.sin((f + i * 11) / 7);
          return (
            <g key={i} transform={`translate(${s.x}, ${s.y}) scale(${Math.max(0, p * tw * out)}) translate(${-s.x}, ${-s.y})`}>
              <Star x={s.x} y={s.y} r={s.r} c={s.c} rot={f * 1.5 + i * 20} />
            </g>
          );
        })}
        <g transform={`translate(540, ${y}) scale(${1.35 * out})`}>
          <Shadow y={350} w={700} o={rise} />
          <g transform={`translate(0, 370) scale(${sx}, ${sy}) translate(0, -370)`}>
            <Laptop light={light}>
              <g transform={`translate(0, 150) scale(${Math.max(0, face)}) translate(0, -150)`}>
                <Face x={0} y={150} s={1.5} blink={blinking(f, [70, 112])} mood="happy" />
              </g>
            </Laptop>
          </g>
        </g>
      </svg>
      <Title frame={f} text="YOUR OWN AI" sub="on the laptop you already have" delay={2} out={out} />
    </AbsoluteFill>
  );
};

/* ---------- 1 · NO BIG GPU ---------- */
const NoGpu: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exit(f, dur);
  const lap = bounce(f, 2, 170, 11);
  const gpu = bounce(f, 14, 180, 9);
  const STAMP = 78; // "No big GPU" in the voice
  const stamp = bounce(f, STAMP, 260, 13);
  const hit = f >= STAMP + 4;
  const shake = hit ? Math.sin((f - STAMP) * 2.2) * 22 * Math.max(0, 1 - (f - STAMP) / 18) : 0;
  const grey = interpolate(f, [STAMP + 4, STAMP + 14], [1, 0.45], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const g = squash(gpu);
  const lookDown: [number, number] = f > 30 ? [0, 8] : [0, 0];
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <g transform={`translate(540, ${560 + (1 - lap) * -300 + bob(f, 5)}) scale(${Math.max(0, lap) * out})`}>
          <Shadow y={350} w={700} />
          <Laptop>
            <Face x={0} y={160} s={1.4} blink={blinking(f, [50])} mood={hit ? 'wow' : 'happy'} look={lookDown} />
          </Laptop>
        </g>
        <g transform={`translate(${540 + shake}, 1250) scale(${2 * out}) scale(${g.sx}, ${g.sy}) translate(-120, -110)`}
          style={{filter: `grayscale(${1 - grey})`}} opacity={grey}>
          <Gpu spin={hit ? 0 : f * 9} mood={hit ? 'sad' : 'happy'} />
        </g>
        {f >= STAMP ? (
          <g transform={`translate(540, 1250) scale(${(2.4 - 1.4 * Math.min(stamp, 1.2)) * out})`} opacity={Math.min(1, stamp * 2)}>
            <circle cx={0} cy={0} r={230} fill="none" stroke={CORAL} strokeWidth={26} />
            <line x1={-162} y1={-162} x2={162} y2={162} stroke={CORAL} strokeWidth={26} strokeLinecap="round" />
          </g>
        ) : null}
      </svg>
      <Title frame={f} text="NO BIG GPU?" sub="most laptops don't have one" delay={2} out={out} />
    </AbsoluteFill>
  );
};

const COMPONENTS: Record<string, React.FC<{dur: number}>> = {hook: Hook, nogpu: NoGpu};

export const FLAT_TOTAL = SCENES.reduce((a, s) => a + s.dur, 0);

export const FlatFilm: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: BG}}>
      <Audio src={staticFile('music.mp3')} volume={(f) => interpolate(f, [0, 10, FLAT_TOTAL - 20, FLAT_TOTAL], [0, 0.22, 0.22, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
      {SCENES.map((s) => {
        const C = COMPONENTS[s.id];
        const el = (
          <Sequence key={s.id} from={from} durationInFrames={s.dur}>
            <C dur={s.dur} />
            <Sequence from={VO_DELAY}><Audio src={staticFile(`vo/${s.id}.mp3`)} /></Sequence>
          </Sequence>
        );
        from += s.dur;
        return el;
      })}
    </AbsoluteFill>
  );
};
