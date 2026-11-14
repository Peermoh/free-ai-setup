import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/space-grotesk/700.css';
import {
  Atmosphere,
  DesignFrame,
  Floor,
  GREEN,
  GROTESK,
  Hud,
  INK,
  MONO,
  RED,
} from './constellation-lib';
import {Fill, Framed, Marked, Measure, Outline, SideLabel, Tag, Underlined} from './type-lib';

/**
 * Theme option 5b — the Constellation world, but with the TYPE designed.
 *
 * Each headline is built from parts that look different from one another:
 * outlined and filled lines, a marked word, mono sub-lines with rules,
 * corner ticks, tick rulers and side labels. Frames: 15 / 45 / 75.
 */

const World: React.FC<{children: React.ReactNode; calm?: boolean}> = ({children, calm}) => {
  const frame = useCurrentFrame();
  const a = calm ? 0.25 : 1;
  return (
    <AbsoluteFill style={{background: '#06040e'}}>
      <Atmosphere />
      <Floor drift={(frame * 1.4) % 118} />
      <AbsoluteFill
        style={{
          transform: `translate(${Math.sin(frame / 90) * 12 * a}px,${
            Math.cos(frame / 115) * 8 * a
          }px)`,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 1 — The headline, built from four different treatments. */
const Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [0, 20], [22, 0], {extrapolateRight: 'clamp'});
  return (
    <World>
      <DesignFrame>
        <SideLabel>FREE-AI-SETUP · 2026</SideLabel>
        <SideLabel right>LEARNING NOTES</SideLabel>
        <div
          style={{
            position: 'absolute',
            left: 108,
            top: 250,
            transform: `translateY(${rise}px)`,
          }}
        >
          <Framed label="01 / WHERE A MODEL RUNS" pad={30}>
            <div style={{lineHeight: 0.96}}>
              <div>
                <Outline size={104}>WHERE DOES</Outline>
              </div>
              <div>
                <Fill size={104}>YOUR AI</Fill>
              </div>
              <div style={{marginTop: 14}}>
                <Marked size={104}>ACTUALLY</Marked> <Fill size={104}>RUN?</Fill>
              </div>
            </div>
            <div style={{marginTop: 30, display: 'flex', gap: 10}}>
              <Tag>FREE TIER</Tag>
              <Tag>LOCAL</Tag>
              <Tag>BORROWED GPU</Tag>
            </div>
            <Measure width={620} label="THREE PLACES · ONE ROUTER" />
          </Framed>
        </div>
      </DesignFrame>
      <Hud tl="SEQ 01 / 10" tr="00:00 / 01:28" bl="type: display" br="camera: drift" />
    </World>
  );
};

/** 2 — A prompt-style block, the reference's most distinctive move. */
const Prompt: React.FC = () => {
  const frame = useCurrentFrame();
  const caret = Math.floor(frame / 8) % 2 === 0;
  return (
    <World>
      <DesignFrame>
        <SideLabel>INPUT</SideLabel>
        <div style={{position: 'absolute', left: 100, top: 330, width: 900}}>
          <Framed label="THE RULE" pad={34}>
            <div style={{fontFamily: MONO, fontSize: 40, lineHeight: 1.75, color: INK}}>
              <span style={{color: 'rgba(190,165,255,.9)'}}>&gt; </span>
              Try <Underlined size={40}>the fastest</Underlined> first.
              <br />
              Out of quota? <Underlined size={40}>the next one</Underlined>.
              <br />
              <Marked size={40}>Your laptop</Marked> answers last.
              <span style={{color: '#8b5cff'}}>{caret ? '▌' : ' '}</span>
            </div>
            <Measure width={840} count={40} label="STRATEGY: PRIORITY · 5 STEPS" />
          </Framed>
        </div>
      </DesignFrame>
      <Hud tl="SEQ 07 / 10" tr="OMNIROUTE" bl="attempt 2 of 5" br="camera: drift" />
    </World>
  );
};

/** 3 — Figures, treated as objects rather than sentences. */
const Figures: React.FC = () => {
  const stats = [
    {n: '6', u: 'providers', tone: INK},
    {n: '15', u: 'models', tone: INK},
    {n: '0', u: 'paid', tone: GREEN},
  ];
  return (
    <World calm>
      <DesignFrame>
        <SideLabel>MEASURED</SideLabel>
        <div style={{position: 'absolute', left: 112, top: 300, width: 880}}>
          <div style={{display: 'flex', gap: 18, marginBottom: 34}}>
            <Tag>FREE</Tag>
            <Tag tone={GREEN}>WORKING</Tag>
            <Tag tone={RED}>QUOTA</Tag>
          </div>
          {stats.map((s) => (
            <div
              key={s.u}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 22,
                borderTop: '1.4px solid rgba(190,165,255,.3)',
                padding: '16px 0',
              }}
            >
              <div
                style={{
                  fontFamily: GROTESK,
                  fontWeight: 700,
                  fontSize: 108,
                  color: s.tone,
                  minWidth: 190,
                  letterSpacing: -4,
                }}
              >
                {s.n}
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 30,
                  letterSpacing: 3,
                  color: 'rgba(236,234,255,.6)',
                  textTransform: 'uppercase',
                }}
              >
                {s.u}
              </div>
            </div>
          ))}
          <div style={{marginTop: 26}}>
            <Outline size={64}>ONE CHAT</Outline> <Fill size={64}>PAGE.</Fill>
          </div>
        </div>
      </DesignFrame>
      <Hud tl="SEQ 09 / 10" tr="AI-SYNC" bl="all tests passed" br="camera: settled" />
    </World>
  );
};

const FRAMES = [Hero, Prompt, Figures];

export const Typography: React.FC = () => {
  const frame = useCurrentFrame();
  const F = FRAMES[Math.min(FRAMES.length - 1, Math.floor(frame / 30))];
  return <F />;
};
