import React from 'react';
import {AbsoluteFill} from 'remotion';
import '@fontsource/sora/600.css';
import '@fontsource/sora/800.css';

/** One still to agree the flat-illustration look before building scenes. */
type Theme = {bg: string; card: string; ink: string; soft: string; screen: string; shadow: string};
const THEMES: Record<'dark' | 'light', Theme> = {
  dark: {bg: '#14163a', card: '#22255a', ink: '#ffffff', soft: '#aab0e6', screen: '#f4f5ff', shadow: '#000000'},
  light: {bg: '#fbf3e6', card: '#ffffff', ink: '#1d1b3a', soft: '#6b6a8c', screen: '#eef1ff', shadow: '#3a2a10'},
};
const SKY = '#4cc9f0';
const CORAL = '#ff6b6b';
const SUN = '#ffc93c';
const MINT = '#2ec4a0';
const FONT = 'Sora, sans-serif';

const Shadow: React.FC<{x: number; y: number; w: number; t: Theme}> = ({x, y, w, t}) => (
  <ellipse cx={x} cy={y} rx={w / 2} ry={w / 12} fill={t.shadow} opacity={0.18} />
);

const Card: React.FC<{cx: number; y: number; color: string; label: string; t: Theme; children: React.ReactNode}> = ({cx, y, color, label, t, children}) => (
  <g>
    <Shadow x={cx} y={y + 312} w={250} t={t} />
    <rect x={cx - 140} y={y} width={280} height={300} rx={36} fill={t.card} />
    <rect x={cx - 140} y={y} width={280} height={18} rx={9} fill={color} />
    <g transform={`translate(${cx - 120}, ${y + 30})`}>{children}</g>
    <text x={cx} y={y + 272} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={32} fill={t.ink}>{label}</text>
  </g>
);

/* Icons drawn in a 240 x 210 box. */
const ModelCube = () => (
  <g>
    <polygon points="120,30 190,70 120,110 50,70" fill="#8fe3fa" />
    <polygon points="50,70 120,110 120,190 50,150" fill={SKY} />
    <polygon points="190,70 120,110 120,190 190,150" fill="#2a9fc4" />
    <circle cx="120" cy="70" r="12" fill="#ffffff" />
  </g>
);
const Cloud = () => (
  <g>
    <circle cx="80" cy="120" r="42" fill={CORAL} />
    <circle cx="135" cy="95" r="56" fill={CORAL} />
    <circle cx="180" cy="128" r="36" fill={CORAL} />
    <rect x="60" y="118" width="150" height="46" rx="23" fill={CORAL} />
    <rect x="86" y="128" width="96" height="30" rx="15" fill="#ffffff" />
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

const Router: React.FC<{t: Theme}> = ({t}) => (
  <g>
    <Shadow x={540} y={1150} w={420} t={t} />
    {[460, 540, 620].map((x, i) => (
      <g key={x}>
        <rect x={x - 5} y={958} width={10} height={60} rx={5} fill={t.soft} />
        <circle cx={x} cy={952} r={13} fill={[SKY, CORAL, SUN][i]} />
      </g>
    ))}
    <rect x={340} y={1000} width={400} height={140} rx={40} fill={MINT} />
    <rect x={340} y={1100} width={400} height={40} rx={20} fill="#21a586" />
    <text x={540} y={1072} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill="#ffffff">OmniRoute</text>
    {[400, 430, 460].map((x) => (
      <circle key={x} cx={x} cy={1120} r={7} fill="#c8fff0" />
    ))}
  </g>
);

const Laptop: React.FC<{t: Theme}> = ({t}) => (
  <g>
    <Shadow x={540} y={1585} w={700} t={t} />
    <rect x={260} y={1240} width={560} height={330} rx={26} fill="#2d2f4f" />
    <rect x={282} y={1262} width={516} height={286} rx={14} fill={t.screen} />
    {/* chat page: question, then a reply */}
    <rect x={540} y={1290} width={230} height={52} rx={26} fill={SKY} />
    <rect x={566} y={1310} width={150} height={12} rx={6} fill="#ffffff" />
    <rect x={310} y={1362} width={320} height={150} rx={26} fill="#ffffff" stroke="#dfe3f5" strokeWidth={3} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={336} y={1388 + i * 30} width={[260, 230, 250, 150][i]} height={12} rx={6} fill="#c3c8e4" />
    ))}
    <polygon points="200,1572 880,1572 840,1610 240,1610" fill="#44476e" />
  </g>
);

const Link: React.FC<{d: string; color: string}> = ({d, color}) => (
  <path d={d} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" strokeDasharray="2 26" />
);

export const StyleSample: React.FC<{theme: 'dark' | 'light'}> = ({theme}) => {
  const t = THEMES[theme];
  return (
    <AbsoluteFill style={{background: t.bg}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {/* soft background blobs for depth */}
        <circle cx={950} cy={560} r={260} fill={SKY} opacity={0.07} />
        <circle cx={100} cy={1300} r={300} fill={CORAL} opacity={0.06} />

        <text x={540} y={300} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={92} fill={t.ink}>ONE CHAT PAGE</text>
        <text x={540} y={370} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={40} fill={t.soft}>for everything you set up</text>

        <Link d="M230,830 C230,920 450,900 480,990" color={SKY} />
        <Link d="M540,830 L540,940" color={CORAL} />
        <Link d="M850,830 C850,920 630,900 600,990" color={SUN} />
        <Link d="M540,1160 L540,1230" color={MINT} />

        <Card cx={230} y={500} color={SKY} label="OLLAMA" t={t}><ModelCube /></Card>
        <Card cx={540} y={500} color={CORAL} label="FREE TIERS" t={t}><Cloud /></Card>
        <Card cx={850} y={500} color={SUN} label="KAGGLE GPU" t={t}><Gpu /></Card>
        <Router t={t} />
        <Laptop t={t} />
      </svg>
    </AbsoluteFill>
  );
};
