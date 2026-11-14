import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {
  BG, CARD, CORAL, FPS, Face, Gpu, INK, Laptop, MINT, SKY, SOFT, SUN, Shadow, Star, Title, FONT,
  blinking, bob, bounce, exit, squash,
} from './kit';
import {Badge, Cloud, Cube, Pill, Router, Terminal, VO_DELAY, Window, at} from './cast';
import {Narration} from './Narration';

/** Scene lengths in seconds: voice delay + clip + about half a second. */
export const SCENES = [
  {id: 'hook', s: 4.3}, {id: 'nogpu', s: 4.2}, {id: 'still', s: 5.9}, {id: 'three', s: 2.4},
  {id: 'local', s: 4.5}, {id: 'tiers', s: 5.8}, {id: 'gpu', s: 4.2}, {id: 'route', s: 5.3},
  {id: 'chat', s: 4.3}, {id: 'flow', s: 6.6}, {id: 'which', s: 8.0}, {id: 'cta', s: 4.4},
].map((x) => ({...x, dur: Math.round(x.s * FPS)}));

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const pop = (f: number, d: number, out = 1, st = 200, dm = 10) => {
  const p = bounce(f, d, st, dm);
  const q = squash(p);
  return {p, sx: q.sx * out, sy: q.sy * out, show: f >= d};
};

/* ---------- 0 · YOUR OWN AI ---------- */
const Hook: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exit(f, dur);
  const rise = bounce(f, 4, 120, 11);
  const {sx, sy} = squash(rise);
  const light = interpolate(f, [16, 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const face = bounce(f, 24, 220, 10);
  const y = 640 + (1 - rise) * 900 + (f > 30 ? bob(f, 7) : 0);
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
      <Narration id="hook" delay={VO_DELAY} />
    </AbsoluteFill>
  );
};
/* ---------- 1 · NO BIG GPU ---------- */
const NoGpu: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exit(f, dur);
  const g = pop(f, 6, out, 170, 9);
  const STAMP = at('nogpu', 'No');
  const stamp = bounce(f, STAMP, 260, 13);
  const hit = f >= STAMP + 4;
  const shake = hit ? Math.sin((f - STAMP) * 2.2) * 26 * Math.max(0, 1 - (f - STAMP) / 18) : 0;
  const grey = interpolate(f, [STAMP + 4, STAMP + 14], [1, 0.45], clamp);
  const qs = [{x: 250, y: 620, d: 30}, {x: 830, y: 700, d: 40}, {x: 300, y: 1230, d: 50}];
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        {qs.map((q, i) => {
          const p = bounce(f, q.d, 200, 9);
          return f >= q.d ? (
            <text key={i} x={q.x} y={q.y + bob(f, 10, 40, i * 13)} textAnchor="middle" fontFamily={FONT} fontWeight={800}
              fontSize={90 * Math.max(0, p) * out} fill={[SKY, CORAL, MINT][i]} opacity={hit ? 0.3 : 1}>?</text>
          ) : null;
        })}
        <g transform={`translate(${540 + shake}, ${930 + (g.show ? bob(f, 6) : 0)})`} opacity={grey} style={{filter: `grayscale(${1 - grey})`}}>
          <g transform={`scale(${2.6 * g.sx}, ${2.6 * g.sy}) translate(-120, -110)`}>
            <Gpu spin={hit ? 0 : f * 9} mood={hit ? 'sad' : 'happy'} />
          </g>
        </g>
        {f >= STAMP ? (
          <g transform={`translate(540, 930) scale(${(2.4 - 1.4 * Math.min(stamp, 1.2)) * out})`} opacity={Math.min(1, stamp * 2)}>
            <circle r={300} fill="none" stroke={CORAL} strokeWidth={30} />
            <line x1={-212} y1={-212} x2={212} y2={212} stroke={CORAL} strokeWidth={30} strokeLinecap="round" />
          </g>
        ) : null}
      </svg>
      <Title frame={f} text="NO BIG GPU?" sub="most laptops don't have one" delay={2} out={out} />
      <Narration id="nogpu" delay={VO_DELAY} />
    </AbsoluteFill>
  );
};

/* ---------- 2 · IT STILL WORKS: a power gauge ---------- */
const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const P = (a: number) => `${cx + r * Math.cos((a * Math.PI) / 180)},${cy - r * Math.sin((a * Math.PI) / 180)}`;
  return `M${P(a0)} A${r},${r} 0 0 1 ${P(a1)}`;
};
const Still: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exit(f, dur);
  const g = pop(f, 4, out, 160, 11);
  const works = at('still', 'works');
  const gpuIn = at('still', 'GPU');
  const boost = at('still', 'seriously');
  const n1 = bounce(f, works - 6, 120, 8);
  const n2 = bounce(f, boost - 4, 140, 7);
  const theta = 172 - 60 * n1 - 98 * n2; // degrees: 180 = left, 0 = right
  const gp = pop(f, gpuIn, out, 220, 10);
  const cx = 540, cy = 900;
  const glow = interpolate(f, [boost, boost + 10], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <g transform={`translate(${cx}, ${cy}) scale(${g.sx}, ${g.sy}) translate(${-cx}, ${-cy})`}>
          <circle cx={cx} cy={cy} r={360} fill={MINT} opacity={0.12 * glow} />
          <path d={arc(cx, cy, 300, 180, 120)} stroke={SKY} strokeWidth={54} fill="none" strokeLinecap="round" />
          <path d={arc(cx, cy, 300, 116, 64)} stroke={SUN} strokeWidth={54} fill="none" />
          <path d={arc(cx, cy, 300, 60, 0)} stroke={MINT} strokeWidth={54} fill="none" strokeLinecap="round" />
          <text x={cx - 250} y={cy + 70} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={SOFT}>OK</text>
          <text x={cx + 230} y={cy + 70} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={glow > 0.5 ? MINT : SOFT}>MAX</text>
          <g transform={`rotate(${180 - theta} ${cx} ${cy})`}>
            <polygon points={`${cx - 240},${cy} ${cx},${cy - 18} ${cx},${cy + 18}`} fill={INK} />
          </g>
          <circle cx={cx} cy={cy} r={34} fill={INK} />
          <rect x={cx - 330} y={cy + 100} width={660} height={170} rx={44} fill={CARD} />
          <Face x={cx} y={cy + 175} s={1.1} blink={blinking(f, [60, 140])} mood={f > boost ? 'wow' : 'happy'} ink={INK} />
          {f > works ? <text x={cx} y={cy - 70} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={f > boost ? MINT : SUN}>{f > boost ? 'POWERFUL' : 'WORKS'}</text> : null}
        </g>
        {gp.show ? (
          <g>
            <path d={`M540,${cy + 270} L540,1150`} stroke={SUN} strokeWidth={10} strokeDasharray="4 18" strokeLinecap="round" opacity={out} />
            <g transform={`translate(540, 1230) scale(${gp.sx}, ${gp.sy}) translate(-120, -110)`}><Gpu spin={f * 10} /></g>
          </g>
        ) : null}
        {f > boost ? [0, 1, 2, 3].map((i) => {
          const p = bounce(f, boost + i * 3, 200, 9);
          return <Star key={i} x={[230, 860, 180, 900][i]} y={[620, 640, 1000, 980][i]} r={30 * Math.max(0, p) * out} c={[SUN, MINT, SKY, CORAL][i]} rot={f * 2} />;
        }) : null}
      </svg>
      <Title frame={f} text="IT STILL WORKS" sub="and a GPU makes it powerful" delay={2} out={out} />
      <Narration id="still" delay={VO_DELAY} />
    </AbsoluteFill>
  );
};

/* ---------- 3 · THREE THINGS ---------- */
const Three: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exit(f, dur, 7);
  const rows = [
    {c: SKY, n: '1', name: 'LOCAL MODEL', icon: <Cube />},
    {c: CORAL, n: '2', name: 'FREE TIERS', icon: <Cloud />},
    {c: SUN, n: '3', name: 'FREE GPU', icon: <Gpu spin={f * 8} />},
  ];
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        {rows.map((r, i) => {
          const p = bounce(f, 3 + i * 5, 190, 12);
          const y = 480 + i * 270;
          const num = bounce(f, at('three', 'three') - 6 + i * 4, 260, 9);
          return (
            <g key={r.n} transform={`translate(${(1 - p) * 1100}, 0)`} opacity={out}>
              <rect x={90} y={y} width={900} height={230} rx={40} fill={CARD} />
              <rect x={90} y={y} width={20} height={230} rx={10} fill={r.c} />
              <g transform={`translate(140, ${y + 18}) scale(0.9)`}>{r.icon}</g>
              <g transform={`translate(470, ${y + 115}) scale(${Math.max(0, num)})`}>
                <circle r={46} fill={r.c} />
                <text y={17} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={48} fill="#000">{r.n}</text>
              </g>
              <text x={545} y={y + 133} fontFamily={FONT} fontWeight={800} fontSize={50} fill={INK}>{r.name}</text>
            </g>
          );
        })}
      </svg>
      <Title frame={f} text="THREE THINGS" delay={0} out={out} />
      <Narration id="three" delay={VO_DELAY} />
    </AbsoluteFill>
  );
};

/* ---------- 4 · 1 · OLLAMA: the model cube ---------- */
const Local: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exit(f, dur);
  const drop = at('local', 'One');
  const p = bounce(f, drop, 150, 8);
  const {sx, sy} = squash(p);
  const y = 470 + (1 - Math.min(p, 1)) * -700 + (f > drop + 20 ? bob(f, 8) : 0);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <circle cx={540} cy={690} r={250} fill={SKY} opacity={0.12 * Math.min(1, Math.max(0, p)) * out} />
        {f >= drop ? (
          <g transform={`translate(540, ${y}) scale(${2 * sx * out}, ${2 * sy * out}) translate(-120, 0)`}>
            <Cube blink={blinking(f, [90])} />
          </g>
        ) : null}
      </svg>
      <Title frame={f} text="1 · OLLAMA" sub="a model on your machine" delay={2} out={out} />
      <div style={{opacity: out}}>
        <Terminal frame={f} start={at('local', 'running')} top={960} lines={['> ollama run llama3.2:3b', 'ready on your machine']} />
        <Pill text="stays on your laptop" color={MINT} frame={f} at={at('local', 'Ollama')} top={1250} />
      </div>
      <Narration id="local" delay={VO_DELAY} />
    </AbsoluteFill>
  );
};

/* ---------- 5 · 2 · FREE TIERS: the cloud ---------- */
const Tiers: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exit(f, dur);
  const c = pop(f, at('tiers', 'Two'), out, 170, 9);
  const names = ['Groq', 'Gemini', 'NVIDIA', 'OpenRouter'];
  const colours = [CORAL, SKY, MINT, SUN];
  const times = names.map((n) => at('tiers', n));
  const shown = times.filter((t) => f >= t).length;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        {c.show ? (
          <g transform={`translate(540, ${610 + bob(f, 6)}) scale(${1.6 * c.sx}, ${1.6 * c.sy}) translate(-130, -120)`}>
            <Cloud blink={blinking(f, [100])} mood={shown >= 2 ? 'wow' : 'happy'} />
          </g>
        ) : null}
      </svg>
      <Title frame={f} text="2 · FREE TIERS" sub="hosted models, free to start" delay={2} out={out} />
      <div style={{position: 'absolute', top: 790, left: 30, right: 30, display: 'flex', justifyContent: 'center', gap: 16, opacity: out}}>
        {names.map((n, i) => {
          const p = bounce(f, times[i], 260, 9);
          return (
            <div key={n} style={{fontFamily: FONT, fontWeight: 800, fontSize: 34, color: i === 0 ? '#fff' : '#000', background: colours[i],
              borderRadius: 50, padding: '12px 24px', opacity: f >= times[i] ? 1 : 0,
              transform: `scale(${Math.max(0, p)}) rotate(${Math.sin(p * 9) * (1 - Math.min(p, 1)) * 30}deg)`}}>{n.toUpperCase()}</div>
          );
        })}
      </div>
      <div style={{opacity: out}}>
        <Window frame={f} start={times[0] - 4} id="providerTop" top={930} mark={shown > 0 ? [0.2 + (shown - 1) * 0.2, 0.2] : null} />
      </div>
      <Narration id="tiers" delay={VO_DELAY} />
    </AbsoluteFill>
  );
};

/* ---------- 6 · 3 · FREE GPU: a server with two cards ---------- */
const GpuScene: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exit(f, dur);
  const box = pop(f, 4, out, 170, 11);
  const in1 = bounce(f, at('gpu', 'GPU') - 4, 150, 12);
  const in2 = bounce(f, at('gpu', 'two') - 6, 150, 12);
  const both = f > at('gpu', 'two') + 4;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <g transform={`translate(540, 480) scale(${box.sx}, ${box.sy})`}>
          <Shadow y={420} w={560} />
          <rect x={-280} y={0} width={560} height={400} rx={44} fill={CARD} />
          <rect x={-280} y={0} width={560} height={22} rx={11} fill={SUN} />
          <Face x={0} y={100} s={1} blink={blinking(f, [70])} mood={both ? 'wow' : 'happy'} ink={INK} />
          <rect x={-250} y={190} width={240} height={140} rx={20} fill="#0b0b0e" />
          <rect x={10} y={190} width={240} height={140} rx={20} fill="#0b0b0e" />
          {f >= at('gpu', 'GPU') - 4 ? <g transform={`translate(${-250 + (1 - in1) * -700}, 133)`}><Gpu spin={f * 10} /></g> : null}
          {f >= at('gpu', 'two') - 6 ? <g transform={`translate(${10 + (1 - in2) * 700}, 133)`}><Gpu spin={f * 10} /></g> : null}
        </g>
      </svg>
      <Title frame={f} text="3 · FREE GPU" sub="kaggle gives you two" delay={2} out={out} />
      <div style={{opacity: out}}>
        <Pill text="2 × Tesla T4" color={SUN} frame={f} at={at('gpu', 'two') + 2} top={925} />
        <Window frame={f} start={at('gpu', 'Kaggle')} id="gpusTight" top={1040} title="nvidia-smi on kaggle" />
      </div>
      <Narration id="gpu" delay={VO_DELAY} />
    </AbsoluteFill>
  );
};

/* ---------- 7 · OMNIROUTE ---------- */
const Route: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exit(f, dur);
  const srcAt = at('route', 'connect');
  const rAt = at('route', 'OmniRoute') - 4;
  const r = pop(f, rAt, out, 170, 9);
  const xs = [270, 540, 810];
  const kinds = ['cube', 'cloud', 'gpu'] as const;
  const cols = [SKY, CORAL, SUN];
  const flow = Math.max(0, f - rAt - 10);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        {xs.map((x, i) => {
          const draw = interpolate(f, [rAt + 6 + i * 3, rAt + 20 + i * 3], [0, 1], clamp);
          const d = `M${x},660 C${x},760 ${540 + (x - 540) * 0.2},760 ${540 + (x - 540) * 0.2},820`;
          return (
            <g key={i} opacity={out}>
              <path d={d} stroke={cols[i]} strokeWidth={10} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`} opacity={0.35} />
              {draw >= 1 ? <path d={d} stroke={cols[i]} strokeWidth={12} fill="none" strokeLinecap="round" strokeDasharray="2 30" strokeDashoffset={-flow * 3} /> : null}
            </g>
          );
        })}
        {xs.map((x, i) => {
          const p = pop(f, srcAt + i * 4, out, 220, 10);
          return p.show ? <g key={i} transform={`translate(${x}, ${560 + bob(f, 5, 40, i * 9)}) scale(${0.95 * p.sx}, ${0.95 * p.sy})`}><Badge kind={kinds[i]} /></g> : null;
        })}
        {r.show ? (
          <g transform={`translate(540, 880) scale(${1.4 * r.sx}, ${1.4 * r.sy})`}>
            <Router blink={blinking(f, [110])} lights={f / 6} />
          </g>
        ) : null}
      </svg>
      <Title frame={f} text="OMNIROUTE" sub="an open source router" delay={2} out={out} />
      <div style={{opacity: out}}>
        <Pill text="picks a free model" color={MINT} frame={f} at={at('route', 'router')} top={1120} />
        <Pill text="falls back if one is busy" color={SKY} frame={f} at={at('route', 'front')} top={1230} />
      </div>
      <Narration id="route" delay={VO_DELAY} />
    </AbsoluteFill>
  );
};

/* ---------- 8 · ONE CHAT PAGE: a chat window ---------- */
const Chat: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exit(f, dur);
  const w = pop(f, 3, out, 160, 12);
  const b1 = bounce(f, at('chat', 'gives'), 240, 11);
  const b2 = bounce(f, at('chat', 'one'), 200, 12);
  const b3 = bounce(f, at('chat', 'all'), 240, 11);
  const grow = interpolate(f, [at('chat', 'one'), at('chat', 'one') + 30], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <g transform={`translate(540, 830) scale(${w.sx}, ${w.sy}) translate(-430, -380)`}>
          <rect x={0} y={0} width={860} height={760} rx={44} fill="#f4f5ff" />
          <rect x={0} y={0} width={860} height={110} rx={44} fill="#2a2a31" />
          <rect x={0} y={70} width={860} height={40} fill="#2a2a31" />
          <circle cx={70} cy={55} r={34} fill={MINT} />
          <Face x={70} y={52} s={0.36} blink={blinking(f, [80])} ink="#0b3d31" />
          <text x={124} y={68} fontFamily={FONT} fontWeight={800} fontSize={36} fill={INK}>MY-FREE</text>
          <text x={300} y={66} fontFamily={FONT} fontWeight={800} fontSize={30} fill={SOFT}>▾</text>
          {f >= at('chat', 'gives') ? (
            <g transform={`translate(800, 210) scale(${Math.max(0, b1)}) translate(-800, -210)`}>
              <rect x={420} y={160} width={380} height={96} rx={48} fill={SKY} />
              <rect x={460} y={200} width={290} height={16} rx={8} fill="#fff" />
            </g>
          ) : null}
          {f >= at('chat', 'one') ? (
            <g transform={`translate(60, 300) scale(${Math.max(0, b2)}) translate(-60, -300)`}>
              <rect x={60} y={290} width={560} height={250} rx={40} fill="#fff" stroke="#dfe3f5" strokeWidth={4} />
              {[440, 380, 470, 260].map((wd, i) => (
                <rect key={i} x={100} y={330 + i * 44} width={wd * Math.min(1, Math.max(0, grow * 4 - i))} height={18} rx={9} fill="#c3c8e4" />
              ))}
              {[SKY, CORAL, SUN].map((c, i) => <circle key={c} cx={110 + i * 40} cy={515} r={13} fill={c} />)}
            </g>
          ) : null}
          {f >= at('chat', 'all') ? (
            <g transform={`translate(800, 620) scale(${Math.max(0, b3)}) translate(-800, -620)`}>
              <rect x={500} y={580} width={300} height={90} rx={45} fill={CORAL} />
              <rect x={540} y={617} width={200} height={16} rx={8} fill="#fff" />
            </g>
          ) : null}
        </g>
      </svg>
      <Title frame={f} text="ONE CHAT PAGE" sub="open webui, for all of it" delay={2} out={out} />
      <Narration id="chat" delay={VO_DELAY} />
    </AbsoluteFill>
  );
};


/* ---------- 8b · ONE QUESTION: how a request flows ---------- */
type Pt = [number, number];
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
/** Position along a list of timed hops; null before the first or after the last. */
const along = (f: number, hops: {t0: number; t1: number; a: Pt; b: Pt}[]): Pt | null => {
  for (const h of hops) {
    if (f >= h.t0 && f <= h.t1) {
      const t = (f - h.t0) / (h.t1 - h.t0);
      return lerp(h.a, h.b, t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    }
  }
  return null;
};
const Flow: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exit(f, dur);
  const CHAT: Pt = [540, 700], RT: Pt = [540, 790], RB: Pt = [540, 960];
  const xs = [270, 540, 810];
  const kinds = ['cube', 'cloud', 'gpu'] as const;
  const names = ['LOCAL', 'FREE TIER', 'KAGGLE'];
  const cols = [SKY, CORAL, SUN];
  const BY = 1150;
  const ask = at('flow', 'Ask'), omni = at('flow', 'OmniRoute'), free = at('flow', 'free');
  const busy = at('flow', 'busy'), next = at('flow', 'next'), ans = at('flow', 'answers');
  const req = along(f, [
    {t0: ask + 12, t1: omni, a: CHAT, b: RT},
    {t0: omni, t1: omni + 6, a: RT, b: RB},
    {t0: omni + 6, t1: at('flow', 'sends'), a: RB, b: RB},
    {t0: at('flow', 'sends'), t1: free + 4, a: RB, b: [540, BY - 90]},
    {t0: free + 4, t1: busy + 2, a: [540, BY - 90], b: [540, BY - 90]},
    {t0: busy + 2, t1: busy + 12, a: [540, BY - 90], b: RB},
    {t0: busy + 12, t1: next - 4, a: RB, b: RB},
    {t0: next - 4, t1: ans, a: RB, b: [810, BY - 90]},
  ]);
  const reply = along(f, [
    {t0: ans + 1, t1: ans + 9, a: [810, BY - 90], b: RB},
    {t0: ans + 9, t1: ans + 13, a: RB, b: RT},
    {t0: ans + 13, t1: ans + 19, a: RT, b: CHAT},
  ]);
  const card = pop(f, 2, out, 180, 12);
  const qb = bounce(f, ask, 240, 10);
  const rb = bounce(f, ans + 19, 240, 10);
  const r = pop(f, 6, out, 200, 10);
  const isBusy = f >= busy;
  const tag = bounce(f, busy, 260, 9);
  const shake = isBusy ? Math.sin((f - busy) * 2.4) * 14 * Math.max(0, 1 - (f - busy) / 16) : 0;
  const done = f >= ans;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <g opacity={out}>
          <path d="M540,705 L540,770" stroke={SOFT} strokeWidth={6} strokeDasharray="2 16" strokeLinecap="round" opacity={0.5} />
          {xs.map((x) => (
            <path key={x} d={`M540,965 L${x},${BY - 92}`} stroke={SOFT} strokeWidth={6} strokeDasharray="2 16" strokeLinecap="round" opacity={0.5} />
          ))}
        </g>
        {/* the chat card */}
        <g transform={`translate(540, 590) scale(${card.sx}, ${card.sy})`}>
          <rect x={-380} y={-120} width={760} height={230} rx={40} fill="#f4f5ff" />
          {f >= ask ? (
            <g transform={`translate(330, -60) scale(${Math.max(0, qb)}) translate(-330, 60)`}>
              <rect x={-20} y={-95} width={350} height={70} rx={35} fill={SKY} />
              <text x={155} y={-49} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#fff">WHAT'S A GPU?</text>
            </g>
          ) : null}
          {f >= ans + 19 ? (
            <g transform={`translate(-330, 40) scale(${Math.max(0, rb)}) translate(330, -40)`}>
              <rect x={-350} y={0} width={420} height={80} rx={34} fill="#fff" stroke="#dfe3f5" strokeWidth={4} />
              <rect x={-322} y={22} width={300} height={14} rx={7} fill="#c3c8e4" />
              <rect x={-322} y={46} width={200} height={14} rx={7} fill="#c3c8e4" />
              <circle cx={40} cy={40} r={14} fill={SUN} />
            </g>
          ) : null}
        </g>
        {r.show ? (
          <g transform={`translate(540, 820) scale(${r.sx}, ${r.sy})`}>
            <Router blink={blinking(f, [100])} lights={f >= omni ? f / 4 : 0} />
          </g>
        ) : null}
        {xs.map((x, i) => {
          const p = pop(f, 10 + i * 4, out, 220, 11);
          const mood = i === 1 && isBusy ? 'sad' : i === 2 && done ? 'wow' : 'happy';
          return p.show ? (
            <g key={x} transform={`translate(${x + (i === 1 ? shake : 0)}, ${BY}) scale(${0.95 * p.sx}, ${0.95 * p.sy})`} opacity={i === 1 && isBusy ? 0.55 : 1}>
              <Badge kind={kinds[i]} mood={mood} />
              <text y={140} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill={cols[i]}>{names[i]}</text>
            </g>
          ) : null;
        })}
        {isBusy ? (
          <g transform={`translate(640, ${BY - 95}) scale(${Math.max(0, tag) * out}) rotate(-10)`}>
            <rect x={-70} y={-30} width={140} height={60} rx={30} fill={CORAL} />
            <text y={12} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#fff">BUSY</text>
          </g>
        ) : null}
        {done ? <circle cx={810} cy={BY} r={110 + 10 * Math.sin(f / 3)} fill="none" stroke={MINT} strokeWidth={8} opacity={0.7 * out} /> : null}
        {req ? (
          <g>
            <circle cx={req[0]} cy={req[1]} r={48 + 6 * Math.sin(f / 3)} fill={SKY} opacity={0.3} />
            <circle cx={req[0]} cy={req[1]} r={28} fill={SKY} stroke="#fff" strokeWidth={5} />
          </g>
        ) : null}
        {reply ? (
          <g>
            <circle cx={reply[0]} cy={reply[1]} r={48} fill={MINT} opacity={0.3} />
            <circle cx={reply[0]} cy={reply[1]} r={28} fill={MINT} stroke="#fff" strokeWidth={5} />
          </g>
        ) : null}
      </svg>
      <Title frame={f} text="ONE QUESTION" sub="how a request flows" delay={2} out={out} />
      <Narration id="flow" delay={VO_DELAY} />
    </AbsoluteFill>
  );
};


/* ---------- 8c · WHICH MODEL? personal data stays local ---------- */
const Lock: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x}, ${y}) scale(${s})`}>
    <path d="M-16,-6 V-20 A16,16 0 0 1 16,-20 V-6" fill="none" stroke={MINT} strokeWidth={8} />
    <rect x={-26} y={-8} width={52} height={42} rx={10} fill={MINT} />
    <circle cy={12} r={6} fill="#0b3d31" />
  </g>
);
const Doc: React.FC<{blink?: boolean}> = ({blink}) => (
  <g>
    <rect x={-75} y={-95} width={150} height={190} rx={18} fill="#f4f5ff" />
    <polygon points="35,-95 75,-55 35,-55" fill="#c3c8e4" />
    <Face x={0} y={-15} s={0.5} blink={blink} />
    {[30, 52].map((y) => <rect key={y} x={-48} y={y} width={96} height={10} rx={5} fill="#c3c8e4" />)}
    <Lock x={58} y={70} s={0.9} />
  </g>
);
const Arrow: React.FC<{x0: number; x1: number; y: number; c: string; draw: number; f: number}> = ({x0, x1, y, c, draw, f}) => {
  const xe = x0 + (x1 - x0) * draw;
  return draw > 0 ? (
    <g>
      <path d={`M${x0},${y} L${xe},${y}`} stroke={c} strokeWidth={12} strokeDasharray="2 26" strokeLinecap="round" strokeDashoffset={-f * 3} />
      {draw >= 1 ? <polygon points={`${x1 + 6},${y} ${x1 - 26},${y - 22} ${x1 - 26},${y + 22}`} fill={c} /> : null}
    </g>
  ) : null;
};
const Which: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exit(f, dur);
  const w = (word: string) => at('which', word);
  const l1 = bounce(f, w('Keep'), 170, 13);
  const l2 = bounce(f, w('For') - 4, 170, 13);
  const doc = pop(f, w('data'), out, 220, 9);
  const a1 = interpolate(f, [w('machine'), w('machine') + 14], [0, 1], clamp);
  const cube = pop(f, w('local'), out, 220, 9);
  const code = pop(f, w('coding'), out, 220, 9);
  const q = pop(f, w('questions'), out, 220, 9);
  const a2 = interpolate(f, [w('use'), w('use') + 12], [0, 1], clamp);
  const cl = pop(f, w('free'), out, 220, 9);
  const gp = pop(f, w('cloud'), out, 220, 9);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <g transform={`translate(${(1 - l1) * -1100}, 0)`} opacity={out}>
          <rect x={60} y={500} width={960} height={370} rx={44} fill={CARD} />
          <rect x={60} y={500} width={20} height={370} rx={10} fill={MINT} />
          <text x={120} y={565} fontFamily={FONT} fontWeight={800} fontSize={40} fill={MINT}>PERSONAL DATA</text>
          {doc.show ? <g transform={`translate(230, 725) scale(${doc.sx}, ${doc.sy})`}><Doc blink={blinking(f, [120])} /></g> : null}
          <Arrow x0={350} x1={650} y={725} c={MINT} draw={a1} f={f} />
          {cube.show ? (
            <g transform={`translate(830, 705) scale(${cube.sx}, ${cube.sy})`}>
              <Badge kind="cube" />
              <Lock x={62} y={-58} s={0.8} />
              <text y={135} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={38} fill={SKY}>LOCAL MODEL</text>
            </g>
          ) : null}
        </g>
        <g transform={`translate(${(1 - l2) * 1100}, 0)`} opacity={out}>
          <rect x={60} y={930} width={960} height={370} rx={44} fill={CARD} />
          <rect x={60} y={930} width={20} height={370} rx={10} fill={SKY} />
          <text x={120} y={995} fontFamily={FONT} fontWeight={800} fontSize={40} fill={SKY}>GENERAL &amp; CODING</text>
          {q.show ? (
            <g transform={`translate(170, 1110) scale(${q.sx}, ${q.sy})`}>
              <rect x={-60} y={-50} width={120} height={100} rx={34} fill={SUN} />
              <text y={24} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={64} fill="#000">?</text>
            </g>
          ) : null}
          {code.show ? (
            <g transform={`translate(300, 1175) scale(${code.sx}, ${code.sy})`}>
              <rect x={-80} y={-50} width={160} height={100} rx={34} fill={SKY} />
              <text y={20} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill="#000">&lt;/&gt;</text>
            </g>
          ) : null}
          <Arrow x0={410} x1={600} y={1145} c={SKY} draw={a2} f={f} />
          {cl.show ? <g transform={`translate(720, 1135) scale(${0.75 * cl.sx}, ${0.75 * cl.sy})`}><Badge kind="cloud" /></g> : null}
          {gp.show ? <g transform={`translate(895, 1135) scale(${0.75 * gp.sx}, ${0.75 * gp.sy})`}><Badge kind="gpu" /></g> : null}
          {cl.show ? <text x={808} y={1255} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={38} fill={CORAL}>FREE CLOUD</text> : null}
        </g>
      </svg>
      <Title frame={f} text="WHICH MODEL?" sub="pick by what you ask" delay={2} out={out} />
      <Narration id="which" delay={VO_DELAY} />
    </AbsoluteFill>
  );
};

/* ---------- 9 · COMMENT AI-LOCAL ---------- */
const Cta: React.FC<{dur: number}> = () => {
  const f = useCurrentFrame();
  const bub = pop(f, at('cta', 'Comment') - 2, 1, 150, 14);
  const xs = [300, 540, 780];
  const kinds = ['cube', 'cloud', 'gpu'] as const;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        {xs.map((x, i) => {
          const p = pop(f, 2 + i * 3, 1, 220, 11);
          return (
            <g key={i}>
              <path d={`M${x},700 L540,790`} stroke={[SKY, CORAL, SUN][i]} strokeWidth={8} strokeDasharray="2 22" strokeLinecap="round" strokeDashoffset={-f * 3} />
              <g transform={`translate(${x}, ${640 + bob(f, 4, 40, i * 7)}) scale(${0.6 * p.sx}, ${0.6 * p.sy})`}><Badge kind={kinds[i]} /></g>
            </g>
          );
        })}
        <g transform={`translate(540, 820) scale(${0.6 * Math.max(0, bounce(f, 10, 220, 11))})`}><Router lights={f / 6} /></g>
        <g transform={`translate(540, ${1080}) scale(${bub.sx}, ${bub.sy})`}>
          <rect x={-400} y={-130} width={800} height={260} rx={70} fill={CORAL} />
          <polygon points="-260,120 -170,120 -290,210" fill={CORAL} />
        </g>
        {[0, 1, 2, 3, 4].map((i) => {
          const t = (f - 40 - i * 14) / 50;
          if (t < 0 || t > 1) return null;
          const x = [110, 970, 170, 920, 60][i];
          const y = 1260 - t * 420;
          return (
            <path key={i} transform={`translate(${x}, ${y}) scale(${1.6 + 0.4 * Math.sin(f / 5 + i)}) rotate(${Math.sin(f / 9 + i) * 12})`} opacity={1 - t}
              d="M0,8 C-14,-6 -22,6 -12,16 L0,26 L12,16 C22,6 14,-6 0,8 Z" fill={[CORAL, '#ff8fb1', CORAL, '#ff8fb1', CORAL][i]} />
          );
        })}
      </svg>
      <Title frame={f} text="WANT THE SCRIPTS?" sub="and the full guide" delay={2} />
      {bub.show ? (
        <div style={{position: 'absolute', top: 975, left: 140, width: 800, textAlign: 'center', fontFamily: FONT, color: '#fff'}}>
          <div style={{fontWeight: 600, fontSize: 44, letterSpacing: 3}}>COMMENT</div>
          <div style={{fontWeight: 800, fontSize: 104, lineHeight: 1.1}}>
            {'AI-LOCAL'.split('').map((ch, i) => (
              <span key={i} style={{display: 'inline-block', transform: `translateY(${Math.sin((f - i * 4) / 6) * 10}px)`}}>{ch}</span>
            ))}
          </div>
        </div>
      ) : null}
      <Narration id="cta" delay={VO_DELAY} />
    </AbsoluteFill>
  );
};

const COMPONENTS: Record<string, React.FC<{dur: number}>> = {
  hook: Hook, nogpu: NoGpu, still: Still, three: Three, local: Local,
  tiers: Tiers, gpu: GpuScene, route: Route, chat: Chat, flow: Flow, which: Which, cta: Cta,
};

export const FLAT_TOTAL = SCENES.reduce((a, s) => a + s.dur, 0);

export const FlatFilm: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: BG}}>
      <Audio src={staticFile('music.mp3')} volume={(f) => interpolate(f, [0, 10, FLAT_TOTAL - 30, FLAT_TOTAL], [0, 0.22, 0.22, 0], clamp)} />
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
