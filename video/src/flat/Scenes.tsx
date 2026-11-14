import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/sora/600.css';
import '@fontsource/sora/800.css';
import '@fontsource/jetbrains-mono/500.css';
import {SHOTS, ShotId} from '../shots';

/*
 * Flat 2D look, dark background. One frame per beat: frame N = beat N.
 * Every object is drawn around its own origin, then placed with a transform,
 * so the same drawing can be the hero of one scene and small in the next.
 */
export const BG = '#14163a';
const CARD = '#22255a';
const INK = '#ffffff';
const SOFT = '#aab0e6';
const SKY = '#4cc9f0';
const CORAL = '#ff6b6b';
const SUN = '#ffc93c';
const MINT = '#2ec4a0';
const FONT = 'Sora, sans-serif';
const MONO = '"JetBrains Mono", monospace';

const at = (x: number, y: number, s = 1) => `translate(${x}, ${y}) scale(${s})`;

const Shadow: React.FC<{y: number; w: number}> = ({y, w}) => (
  <ellipse cx={0} cy={y} rx={w / 2} ry={w / 12} fill="#000" opacity={0.22} />
);

/* ---------- icons, drawn in a 240 x 210 box ---------- */
const ModelCube = () => (
  <g>
    <polygon points="120,30 190,70 120,110 50,70" fill="#8fe3fa" />
    <polygon points="50,70 120,110 120,190 50,150" fill={SKY} />
    <polygon points="190,70 120,110 120,190 190,150" fill="#2a9fc4" />
    <circle cx="120" cy="70" r="12" fill="#fff" />
  </g>
);
const Cloud = () => (
  <g>
    <circle cx="80" cy="120" r="42" fill={CORAL} />
    <circle cx="135" cy="95" r="56" fill={CORAL} />
    <circle cx="180" cy="128" r="36" fill={CORAL} />
    <rect x="60" y="118" width="150" height="46" rx="23" fill={CORAL} />
    <rect x="86" y="128" width="96" height="30" rx="15" fill="#fff" />
    <text x="134" y="150" textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={20} fill={CORAL}>FREE</text>
  </g>
);
const Fan: React.FC<{cx: number}> = ({cx}) => (
  <g>
    <circle cx={cx} cy={110} r={34} fill="#2b2b2b" />
    {[0, 72, 144, 216, 288].map((a) => (
      <ellipse key={a} cx={cx} cy={92} rx={9} ry={17} fill="#5a5a5a" transform={`rotate(${a} ${cx} 110)`} />
    ))}
    <circle cx={cx} cy={110} r={8} fill={SUN} />
  </g>
);
const Gpu = () => (
  <g>
    <rect x="20" y="62" width="200" height="96" rx="16" fill={SUN} />
    <Fan cx={80} />
    <Fan cx={160} />
    {[40, 62, 84, 106, 128, 150, 172].map((x) => (
      <rect key={x} x={x} y="160" width="12" height="16" rx="2" fill="#d99e00" />
    ))}
  </g>
);
const Star: React.FC<{x: number; y: number; r: number; c: string}> = ({x, y, r, c}) => (
  <path
    d={`M${x},${y - r} Q${x},${y} ${x + r},${y} Q${x},${y} ${x},${y + r} Q${x},${y} ${x - r},${y} Q${x},${y} ${x},${y - r} Z`}
    fill={c}
  />
);

/* ---------- objects, origin at top-centre ---------- */
const Card: React.FC<{color: string; label: string; children: React.ReactNode}> = ({color, label, children}) => (
  <g>
    <Shadow y={312} w={250} />
    <rect x={-140} y={0} width={280} height={300} rx={36} fill={CARD} />
    <rect x={-140} y={0} width={280} height={18} rx={9} fill={color} />
    <g transform="translate(-120, 30)">{children}</g>
    <text x={0} y={272} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill={INK}>{label}</text>
  </g>
);

type ScreenKind = 'chat' | 'spark' | 'cube' | 'blank';
const Laptop: React.FC<{screen: ScreenKind}> = ({screen}) => (
  <g>
    <Shadow y={350} w={700} />
    <rect x={-280} y={0} width={560} height={330} rx={26} fill="#2d2f4f" />
    <rect x={-258} y={22} width={516} height={286} rx={14} fill="#f4f5ff" />
    {screen === 'chat' ? (
      <g>
        <rect x={0} y={50} width={230} height={52} rx={26} fill={SKY} />
        <rect x={26} y={70} width={150} height={12} rx={6} fill="#fff" />
        <rect x={-230} y={122} width={320} height={150} rx={26} fill="#fff" stroke="#dfe3f5" strokeWidth={3} />
        {[260, 230, 250, 150].map((w, i) => (
          <rect key={i} x={-204} y={148 + i * 30} width={w} height={12} rx={6} fill="#c3c8e4" />
        ))}
      </g>
    ) : null}
    {screen === 'spark' ? (
      <g>
        <Star x={0} y={165} r={80} c={MINT} />
        <Star x={110} y={90} r={34} c={SUN} />
        <Star x={-120} y={230} r={26} c={SKY} />
      </g>
    ) : null}
    {screen === 'cube' ? <g transform="translate(-120, 50) scale(1.05)"><ModelCube /></g> : null}
    <polygon points="-340,332 340,332 300,370 -300,370" fill="#44476e" />
  </g>
);

const Router: React.FC = () => (
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
    <text x={0} y={72} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill="#fff">OmniRoute</text>
    {[-140, -110, -80].map((x) => (
      <circle key={x} cx={x} cy={120} r={7} fill="#c8fff0" />
    ))}
  </g>
);

const Link: React.FC<{d: string; color: string}> = ({d, color}) => (
  <path d={d} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" strokeDasharray="2 26" />
);

/** The full setup, laid out for y 500..1610. */
const Setup: React.FC = () => (
  <g>
    <Link d="M230,830 C230,920 450,900 480,990" color={SKY} />
    <Link d="M540,830 L540,940" color={CORAL} />
    <Link d="M850,830 C850,920 630,900 600,990" color={SUN} />
    <Link d="M540,1160 L540,1230" color={MINT} />
    <g transform={at(230, 500)}><Card color={SKY} label="OLLAMA"><ModelCube /></Card></g>
    <g transform={at(540, 500)}><Card color={CORAL} label="FREE TIERS"><Cloud /></Card></g>
    <g transform={at(850, 500)}><Card color={SUN} label="KAGGLE GPU"><Gpu /></Card></g>
    <g transform={at(540, 1000)}><Router /></g>
    <g transform={at(540, 1240)}><Laptop screen="chat" /></g>
  </g>
);

/* ---------- HTML pieces ---------- */
const Title: React.FC<{text: string; sub?: string}> = ({text, sub}) => (
  <div style={{position: 'absolute', top: 220, left: 50, right: 50, textAlign: 'center'}}>
    <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 96, color: INK, lineHeight: 1.05}}>{text}</div>
    {sub ? <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 42, color: SOFT, marginTop: 18}}>{sub}</div> : null}
  </div>
);

const Pill: React.FC<{text: string; color: string; dark?: boolean}> = ({text, color, dark}) => (
  <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 38, color: dark ? '#14163a' : '#fff', background: color,
    borderRadius: 60, padding: '14px 34px', whiteSpace: 'nowrap'}}>{text}</div>
);

const Row: React.FC<{top: number; children: React.ReactNode}> = ({top, children}) => (
  <div style={{position: 'absolute', top, left: 40, right: 40, display: 'flex', justifyContent: 'center',
    flexWrap: 'wrap', gap: 20}}>{children}</div>
);

/** A real screenshot inside a flat app window. */
const Window: React.FC<{id: ShotId; top: number; width?: number; caption?: string}> = ({id, top, width = 940, caption}) => {
  const s = SHOTS[id];
  const k = width / s.crop.w;
  const light = 'light' in s && s.light;
  return (
    <div style={{position: 'absolute', top, left: (1080 - width) / 2, width}}>
      <div style={{background: '#2d2f4f', borderRadius: '22px 22px 0 0', height: 52, display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 22}}>
        {[CORAL, SUN, MINT].map((c) => <div key={c} style={{width: 18, height: 18, borderRadius: 9, background: c}} />)}
        <div style={{fontFamily: MONO, fontSize: 26, color: SOFT, marginLeft: 14}}>{caption ?? s.label}</div>
      </div>
      <div style={{width, height: s.crop.h * k, overflow: 'hidden', position: 'relative', borderRadius: '0 0 22px 22px', background: '#0c0c0c'}}>
        <Img src={staticFile(s.file)} style={{position: 'absolute', width: s.nw * k, left: -s.crop.x * k, top: -s.crop.y * k,
          filter: light ? 'invert(1) hue-rotate(180deg) brightness(0.92) contrast(1.08)' : undefined}} />
      </div>
    </div>
  );
};

const Terminal: React.FC<{top: number; lines: string[]}> = ({top, lines}) => (
  <div style={{position: 'absolute', top, left: 70, right: 70}}>
    <div style={{background: '#2d2f4f', borderRadius: '22px 22px 0 0', height: 52, display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 22}}>
      {[CORAL, SUN, MINT].map((c) => <div key={c} style={{width: 18, height: 18, borderRadius: 9, background: c}} />)}
    </div>
    <div style={{background: '#0d0e24', borderRadius: '0 0 22px 22px', padding: '26px 34px', fontFamily: MONO, fontSize: 40, lineHeight: 1.55}}>
      {lines.map((l, i) => <div key={i} style={{color: l.startsWith('>') ? MINT : '#e6e8ff'}}>{l}</div>)}
    </div>
  </div>
);

/* ---------- the ten beats ---------- */
const Beat: React.FC<{b: number}> = ({b}) => {
  switch (b) {
    case 0:
      return (
        <>
          <svg width={1080} height={1920}>
            <Star x={170} y={620} r={30} c={SUN} />
            <Star x={920} y={560} r={22} c={SKY} />
            <Star x={900} y={1330} r={34} c={CORAL} />
            <g transform={at(540, 720, 1.35)}><Laptop screen="spark" /></g>
          </svg>
          <Title text="YOUR OWN AI" sub="on the laptop you already have" />
        </>
      );
    case 1:
      return (
        <>
          <svg width={1080} height={1920}>
            <g transform={at(540, 560)}><Laptop screen="blank" /></g>
            <g opacity={0.4} transform={at(540 - 240, 1060, 2)}><Gpu /></g>
            <circle cx={540} cy={1250} r={230} fill="none" stroke={CORAL} strokeWidth={26} />
            <line x1={378} y1={1088} x2={702} y2={1412} stroke={CORAL} strokeWidth={26} strokeLinecap="round" />
          </svg>
          <Title text="NO BIG GPU?" sub="most laptops don't have one" />
        </>
      );
    case 2:
      return (
        <>
          <svg width={1080} height={1920}>
            <g transform={at(540, 540)}><Laptop screen="cube" /></g>
            <circle cx={830} cy={560} r={62} fill={MINT} />
            <path d="M800,562 L822,586 L862,538" fill="none" stroke="#fff" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={540} cy={1035} r={44} fill={SUN} />
            <path d="M540,1012 V1058 M517,1035 H563" stroke="#14163a" strokeWidth={12} strokeLinecap="round" />
            <g transform={at(540 - 180, 1095, 1.5)}><Gpu /></g>
          </svg>
          <Title text="IT STILL WORKS" sub="and a GPU makes it bigger" />
        </>
      );
    case 3:
      return (
        <>
          <svg width={1080} height={1920}>
            {[
              {y: 500, c: SKY, n: '1', name: 'Local model', icon: <ModelCube />},
              {y: 810, c: CORAL, n: '2', name: 'Free tiers', icon: <Cloud />},
              {y: 1120, c: SUN, n: '3', name: 'Free GPU', icon: <Gpu />},
            ].map((r) => (
              <g key={r.n}>
                <rect x={90} y={r.y} width={900} height={260} rx={40} fill={CARD} />
                <rect x={90} y={r.y} width={20} height={260} rx={10} fill={r.c} />
                <g transform={at(140, r.y + 25, 1.0)}>{r.icon}</g>
                <circle cx={470} cy={r.y + 130} r={46} fill={r.c} />
                <text x={470} y={r.y + 148} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={48} fill="#14163a">{r.n}</text>
                <text x={545} y={r.y + 148} fontFamily={FONT} fontWeight={800} fontSize={52} fill={INK}>{r.name}</text>
              </g>
            ))}
          </svg>
          <Title text="THREE THINGS" />
        </>
      );
    case 4:
      return (
        <>
          <svg width={1080} height={1920}>
            <circle cx={540} cy={700} r={230} fill={SKY} opacity={0.12} />
            <g transform={at(540 - 240, 500, 2)}><ModelCube /></g>
          </svg>
          <Title text="1 · OLLAMA" sub="a model on your machine" />
          <Terminal top={1000} lines={['> ollama run llama3.2:3b', 'running on this laptop']} />
          <Row top={1290}><Pill text="stays on your laptop" color={MINT} /></Row>
        </>
      );
    case 5:
      return (
        <>
          <svg width={1080} height={1920}>
            <g transform={at(540 - 216, 440, 1.8)}><Cloud /></g>
          </svg>
          <Title text="2 · FREE TIERS" sub="hosted models, free to start" />
          <Row top={790}>
            <Pill text="Groq" color={CORAL} />
            <Pill text="Gemini" color={SKY} dark />
            <Pill text="NVIDIA" color={MINT} dark />
            <Pill text="OpenRouter" color={SUN} dark />
          </Row>
          <Window id="providerTop" top={1030} width={940} />
        </>
      );
    case 6:
      return (
        <>
          <svg width={1080} height={1920}>
            <g transform={at(540 - 168, 470, 1.4)}><Gpu /></g>
            <g transform={at(540 - 168, 720, 1.4)}><Gpu /></g>
          </svg>
          <Title text="3 · FREE GPU" sub="Kaggle gives you two" />
          <Row top={1010}><Pill text="2 × Tesla T4" color={SUN} dark /></Row>
          <Window id="gpusTight" top={1130} width={940} caption="nvidia-smi on Kaggle" />
        </>
      );
    case 7:
      return (
        <>
          <svg width={1080} height={1920}>
            <Link d="M300,670 C300,740 470,730 490,800" color={SKY} />
            <Link d="M540,670 L540,790" color={CORAL} />
            <Link d="M780,670 C780,740 610,730 590,800" color={SUN} />
            <g transform={at(300, 480, 0.6)}><Card color={SKY} label="OLLAMA"><ModelCube /></Card></g>
            <g transform={at(540, 480, 0.6)}><Card color={CORAL} label="FREE TIERS"><Cloud /></Card></g>
            <g transform={at(780, 480, 0.6)}><Card color={SUN} label="KAGGLE GPU"><Gpu /></Card></g>
            <g transform={at(540, 900, 1.5)}><Router /></g>
          </svg>
          <Title text="OMNIROUTE" sub="an open source router" />
          <Row top={1210}><Pill text="picks a free model" color={MINT} dark /></Row>
          <Row top={1320}><Pill text="falls back if one is busy" color={SKY} dark /></Row>
        </>
      );
    case 8:
      return (
        <>
          <svg width={1080} height={1920}><g transform="translate(0, -40)"><Setup /></g></svg>
          <Title text="ONE CHAT PAGE" sub="Open WebUI, for all of it" />
        </>
      );
    default:
      return (
        <>
          <svg width={1080} height={1920}>
            <g transform={`translate(205, 250) scale(0.62)`}><Setup /></g>
            <rect x={140} y={1290} width={800} height={230} rx={60} fill={CORAL} />
            <polygon points="260,1510 330,1510 250,1590" fill={CORAL} />
          </svg>
          <Title text="WANT THE SCRIPTS?" sub="and the full guide" />
          <div style={{position: 'absolute', top: 1318, left: 140, width: 800, textAlign: 'center', fontFamily: FONT, color: '#fff'}}>
            <div style={{fontWeight: 600, fontSize: 44}}>Comment</div>
            <div style={{fontWeight: 800, fontSize: 92, lineHeight: 1.1}}>ai-local</div>
          </div>
        </>
      );
  }
};

export const FlatScenes: React.FC = () => {
  const b = Math.min(useCurrentFrame(), 9);
  return (
    <AbsoluteFill style={{background: BG}}>
      <AbsoluteFill><Beat b={b} /></AbsoluteFill>
    </AbsoluteFill>
  );
};
