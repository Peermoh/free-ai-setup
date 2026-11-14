import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import {Scene3D} from './Scene3D';
import {BEATS, CYAN, HUB, LAPTOP, TOWER, TOWERS, V3, WIRE, toScreen} from './world';
import {SHOTS, ShotId} from '../shots';

const GROTESK = '"Space Grotesk", sans-serif';
const MONO = '"JetBrains Mono", monospace';

/** A real screenshot, cropped in CSS (no layout scaling: frame is 1080 wide). */
const Shot: React.FC<{id: ShotId; width: number}> = ({id, width}) => {
  const s = SHOTS[id];
  const k = width / s.crop.w;
  return (
    <div style={{width, height: s.crop.h * k, overflow: 'hidden', position: 'relative',
      border: `2px solid ${CYAN}`, borderRadius: 14, boxShadow: `0 0 40px ${CYAN}55`}}>
      <Img
        src={staticFile(s.file)}
        style={{position: 'absolute', width: s.nw * k, left: -s.crop.x * k, top: -s.crop.y * k,
          filter: 'light' in s && s.light ? 'invert(1) hue-rotate(180deg) brightness(0.92) contrast(1.08)' : undefined}}
      />
    </div>
  );
};

const Tag: React.FC<{p: V3; b: number; text: string; color?: string; dy?: number; dx?: number}> = ({p, b, text, color = WIRE, dy = 0, dx = 0}) => {
  const {width, height} = useVideoConfig();
  const {x, y} = toScreen(p, BEATS[b], width, height);
  return (
    <div style={{position: 'absolute', left: x + dx, top: y + dy, transform: 'translate(-50%, -50%)',
      fontFamily: MONO, fontWeight: 700, fontSize: 34, color, letterSpacing: 2, whiteSpace: 'nowrap',
      padding: '6px 14px', background: '#081426cc', border: `2px solid ${color}`, borderRadius: 8}}>
      {text}
    </div>
  );
};

const Title: React.FC<{b: number}> = ({b}) => {
  const beat = BEATS[b];
  if (!beat.text) return null;
  return (
    <div style={{position: 'absolute', top: 230, left: 60, right: 60, textAlign: 'center'}}>
      <div style={{fontFamily: GROTESK, fontWeight: 700, fontSize: 104, lineHeight: 1, color: '#fff',
        letterSpacing: -1, textShadow: `0 0 30px ${CYAN}88`}}>
        {beat.text}
      </div>
      {beat.sub ? (
        <div style={{marginTop: 22, fontFamily: MONO, fontWeight: 500, fontSize: 40, color: CYAN}}>
          {beat.sub}
        </div>
      ) : null}
    </div>
  );
};

/** Evidence panel, kept above the bottom ~18% of the frame. */
const Evidence: React.FC<{children: React.ReactNode; label: string}> = ({children, label}) => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 380, display: 'flex',
    flexDirection: 'column', alignItems: 'center', gap: 14}}>
    {children}
    <div style={{fontFamily: MONO, fontSize: 28, color: '#9fb6d4'}}>{label}</div>
  </div>
);

const Terminal: React.FC<{lines: string[]; width?: number}> = ({lines, width = 900}) => (
  <div style={{width, background: '#050c18', border: `2px solid ${CYAN}`, borderRadius: 14,
    padding: '26px 32px', fontFamily: MONO, fontSize: 38, color: '#d6f5ff', lineHeight: 1.5,
    boxShadow: `0 0 40px ${CYAN}55`}}>
    {lines.map((l, i) => (
      <div key={i} style={{color: l.startsWith('>') ? '#4ade80' : undefined}}>{l}</div>
    ))}
  </div>
);

export const Keyframes: React.FC = () => {
  const b = Math.min(useCurrentFrame(), BEATS.length - 1);
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#081426'}}>
      <ThreeCanvas orthographic flat width={width} height={height} camera={{position: [30, 30, 30], zoom: 60, near: 0.1, far: 500}}>
        <Scene3D b={b} />
      </ThreeCanvas>
      <AbsoluteFill>
        <Title b={b} />
        {b === 1 ? <Tag p={[3.4, -6.4, -3.4]} b={b} text="NO GPU" color="#ff5d6c" dy={-90} /> : null}
        {b === 2 ? <Tag p={[0, -4.6, 0]} b={b} text="MODEL" color="#4ade80" dy={-190} /> : null}
        {b === 3 ? ['LOCAL', 'FREE TIERS', 'GPU'].map((t, i) => (
          <Tag key={t} p={TOWERS[i]} b={b} text={t} color={TOWER[i]} dy={170} />
        )) : null}
        {b === 5 ? (
          <div style={{position: 'absolute', top: 470, left: 0, right: 0, display: 'flex',
            justifyContent: 'center', flexWrap: 'wrap', gap: 16, padding: '0 80px'}}>
            {['GROQ', 'GEMINI', 'NVIDIA', 'OPENROUTER'].map((p) => (
              <div key={p} style={{fontFamily: MONO, fontWeight: 700, fontSize: 34, color: TOWER[1],
                border: `2px solid ${TOWER[1]}`, borderRadius: 40, padding: '8px 24px', background: '#081426cc'}}>{p}</div>
            ))}
          </div>
        ) : null}
        {b === 4 ? <Evidence label="on your laptop"><Terminal lines={['> ollama run llama3.2:3b', 'model ready, running locally']} /></Evidence> : null}
        {b === 5 ? <Evidence label={SHOTS.providerMenu.label}><Shot id="providerTop" width={980} /></Evidence> : null}
        {b === 6 ? <Evidence label={SHOTS.gpus.label}><Shot id="gpus" width={940} /></Evidence> : null}
        {b >= 7 && b <= 8 ? <Tag p={HUB} b={b} text="OMNIROUTE" color={CYAN} dx={290} dy={20} /> : null}
        {b === 8 ? <Tag p={LAPTOP} b={b} text="OPEN WEBUI" color={CYAN} dx={290} dy={-40} /> : null}
        {b === 9 ? (
          <div style={{position: 'absolute', top: 260, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
            <Terminal width={960} lines={['Want the scripts and the guide?', '> COMMENT "AI-LOCAL" TO EXECUTE']} />
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
