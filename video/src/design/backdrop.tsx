import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

/**
 * A different, moving background per explanation.
 *
 * Each variant gives the scene its own colour and its own kind of motion, so
 * the film does not sit on one static field the whole way through. All of it
 * is gradients and transforms: no blur filters over the full frame, because
 * those dominate render time.
 */

export type BackdropId =
  | 'open'
  | 'cool'
  | 'surge'
  | 'three'
  | 'local'
  | 'tiers'
  | 'gpu'
  | 'route'
  | 'chat'
  | 'cta';

type Spec = {
  base: string;
  a: string; // primary glow
  b: string; // secondary glow
  motion: 'grid' | 'streaks' | 'rings' | 'bands' | 'rise';
  speed: number;
};

const SPECS: Record<BackdropId, Spec> = {
  open:  {base: '#06040e', a: 'rgba(126,71,255,.52)', b: 'rgba(214,79,255,.30)', motion: 'rise',    speed: 1},
  cool:  {base: '#05080f', a: 'rgba(42,120,255,.42)', b: 'rgba(40,200,220,.24)', motion: 'streaks', speed: .8},
  surge: {base: '#0a0410', a: 'rgba(255,120,40,.40)', b: 'rgba(180,60,255,.34)', motion: 'rings',   speed: 1.4},
  three: {base: '#06050f', a: 'rgba(120,80,255,.38)', b: 'rgba(60,200,160,.24)', motion: 'bands',   speed: 1},
  local: {base: '#040b08', a: 'rgba(40,200,120,.36)', b: 'rgba(90,120,255,.22)', motion: 'grid',    speed: 2.2},
  tiers: {base: '#070512', a: 'rgba(150,80,255,.42)', b: 'rgba(255,140,60,.22)', motion: 'rise',    speed: 1.3},
  gpu:   {base: '#03090d', a: 'rgba(40,220,160,.38)', b: 'rgba(60,160,255,.28)', motion: 'streaks', speed: 1.6},
  route: {base: '#0a0608', a: 'rgba(255,150,50,.38)', b: 'rgba(150,80,255,.30)', motion: 'rings',   speed: 1},
  chat:  {base: '#06050f', a: 'rgba(130,90,255,.44)', b: 'rgba(70,170,255,.24)', motion: 'bands',   speed: .9},
  cta:   {base: '#08040f', a: 'rgba(160,90,255,.58)', b: 'rgba(230,90,255,.34)', motion: 'rings',   speed: 1.8},
};

/** Perspective grid rushing toward the viewer. */
const Grid: React.FC<{frame: number; speed: number; tint: string}> = ({frame, speed, tint}) => (
  <AbsoluteFill style={{perspective: 620, overflow: 'hidden'}}>
    <div
      style={{
        position: 'absolute',
        left: '-60%',
        right: '-60%',
        top: '55%',
        height: '110%',
        transform: 'rotateX(76deg)',
        transformOrigin: 'top center',
        backgroundImage:
          `repeating-linear-gradient(0deg, ${tint} 0 1.4px, transparent 1.4px 110px),` +
          `repeating-linear-gradient(90deg, ${tint} 0 1.4px, transparent 1.4px 110px)`,
        backgroundPosition: `0 ${(frame * 2.6 * speed) % 110}px`,
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,.92) 0%, transparent 58%)',
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,.92) 0%, transparent 58%)',
      }}
    />
  </AbsoluteFill>
);

/** Diagonal light streaks sweeping across. */
const Streaks: React.FC<{frame: number; speed: number; tint: string}> = ({
  frame,
  speed,
  tint,
}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <div
      style={{
        position: 'absolute',
        inset: '-40%',
        transform: `rotate(-22deg) translateX(${((frame * 3.2 * speed) % 420) - 210}px)`,
        backgroundImage: `repeating-linear-gradient(90deg, ${tint} 0 2px, transparent 2px 210px)`,
        opacity: 0.5,
      }}
    />
  </AbsoluteFill>
);

/** Concentric rings pulsing outward from the centre. */
const Rings: React.FC<{frame: number; speed: number; tint: string}> = ({frame, speed, tint}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    {[0, 1, 2, 3].map((i) => {
      const t = ((frame * speed) / 60 + i * 0.25) % 1;
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 300 + t * 1500,
            height: 300 + t * 1500,
            marginLeft: -(300 + t * 1500) / 2,
            marginTop: -(300 + t * 1500) / 2,
            borderRadius: '50%',
            border: `1.6px solid ${tint}`,
            opacity: (1 - t) * 0.5,
          }}
        />
      );
    })}
  </AbsoluteFill>
);

/** Vertical colour bands sliding sideways. */
const Bands: React.FC<{frame: number; speed: number; tint: string}> = ({frame, speed, tint}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <div
      style={{
        position: 'absolute',
        inset: '-20%',
        transform: `translateX(${((frame * 1.6 * speed) % 300) - 150}px)`,
        backgroundImage: `repeating-linear-gradient(90deg, ${tint} 0 120px, transparent 120px 300px)`,
        opacity: 0.4,
      }}
    />
  </AbsoluteFill>
);

/** Slow particles rising, like dust in a beam. */
const Rise: React.FC<{frame: number; speed: number; tint: string}> = ({frame, speed, tint}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    {Array.from({length: 26}).map((_, i) => {
      const x = (i * 97) % 100;
      const cycle = 150 + (i % 7) * 40;
      const t = ((frame * speed + i * 31) % cycle) / cycle;
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${100 - t * 110}%`,
            width: i % 5 === 0 ? 4 : 2.5,
            height: i % 5 === 0 ? 4 : 2.5,
            borderRadius: 999,
            background: tint,
            opacity: Math.sin(t * Math.PI) * 0.8,
          }}
        />
      );
    })}
  </AbsoluteFill>
);

export const Backdrop: React.FC<{id: BackdropId; sceneFrame: number}> = ({id, sceneFrame}) => {
  const frame = useCurrentFrame();
  const s = SPECS[id];

  // The glows drift, so even a still scene has a moving field behind it.
  const gx = 30 + Math.sin(frame / 110) * 12;
  const gy = 26 + Math.cos(frame / 140) * 10;
  const hx = 78 + Math.cos(frame / 125) * 10;
  const hy = 68 + Math.sin(frame / 155) * 9;

  // Each scene's background fades up as the scene opens.
  const open = interpolate(sceneFrame, [0, 14], [0.5, 1], {extrapolateRight: 'clamp'});

  const tint = s.a.replace(/,[^,]+\)$/, ',.22)');

  return (
    <AbsoluteFill style={{background: s.base}}>
      <AbsoluteFill
        style={{
          opacity: open,
          background:
            `radial-gradient(52% 40% at ${gx}% ${gy}%, ${s.a} 0%, transparent 68%),` +
            `radial-gradient(48% 36% at ${hx}% ${hy}%, ${s.b} 0%, transparent 70%)`,
        }}
      />
      <AbsoluteFill style={{opacity: open}}>
        {s.motion === 'grid' ? <Grid frame={frame} speed={s.speed} tint={tint} /> : null}
        {s.motion === 'streaks' ? <Streaks frame={frame} speed={s.speed} tint={tint} /> : null}
        {s.motion === 'rings' ? <Rings frame={frame} speed={s.speed} tint={tint} /> : null}
        {s.motion === 'bands' ? <Bands frame={frame} speed={s.speed} tint={tint} /> : null}
        {s.motion === 'rise' ? <Rise frame={frame} speed={s.speed} tint={tint} /> : null}
      </AbsoluteFill>
      {/* vignette keeps the type readable whatever is moving behind it */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(74% 64% at 50% 46%, transparent 40%, rgba(0,0,0,.74) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
