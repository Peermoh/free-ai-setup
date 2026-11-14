import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/space-grotesk/700.css';
import {useScale} from '../layout';
import {Shot} from '../components/Shot';

/**
 * Theme option 4 — "Wireframe": cinematic title-sequence look.
 *
 * Everything here is CSS 3D and SVG: a perspective grid that scrolls forever,
 * wireframe solids that rotate, outlined type, a violet bloom, and HUD
 * telemetry in the corners. No 3D engine, no image assets.
 *
 * The camera drifts constantly on title frames, and SETTLES whenever a
 * screenshot is on screen, because moving text cannot be read at phone size.
 */

const MONO = '"JetBrains Mono", monospace';
const GROTESK = '"Space Grotesk", sans-serif';
const INK = '#ece9ff';

/** Endless perspective floor. */
const Grid: React.FC<{speed?: number}> = ({speed = 1}) => {
  const frame = useCurrentFrame();
  const s = useScale();
  const drift = (frame * 1.6 * speed) % 120;
  return (
    <AbsoluteFill style={{perspective: `${620 * s}px`, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: '-60%',
          right: '-60%',
          top: '52%',
          height: '110%',
          transform: 'rotateX(74deg)',
          transformOrigin: 'top center',
          backgroundImage:
            `repeating-linear-gradient(0deg, rgba(190,170,255,.42) 0 1.5px, transparent 1.5px ${120 * s}px),` +
            `repeating-linear-gradient(90deg, rgba(190,170,255,.30) 0 1.5px, transparent 1.5px ${120 * s}px)`,
          backgroundPosition: `0 ${drift * s}px`,
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,.95) 0%, transparent 62%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, rgba(0,0,0,.95) 0%, transparent 62%)',
        }}
      />
    </AbsoluteFill>
  );
};

/** A rotating wireframe cube built from six bordered faces. */
const Cube: React.FC<{size: number; x: number; y: number; spin: number; op?: number}> = ({
  size,
  x,
  y,
  spin,
  op = 1,
}) => {
  const s = useScale();
  const d = (size / 2) * s;
  const faces: React.CSSProperties[] = [
    {transform: `translateZ(${d}px)`},
    {transform: `rotateY(180deg) translateZ(${d}px)`},
    {transform: `rotateY(90deg) translateZ(${d}px)`},
    {transform: `rotateY(-90deg) translateZ(${d}px)`},
    {transform: `rotateX(90deg) translateZ(${d}px)`},
    {transform: `rotateX(-90deg) translateZ(${d}px)`},
  ];
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: size * s,
        height: size * s,
        marginLeft: (x - size / 2) * s,
        marginTop: (y - size / 2) * s,
        transformStyle: 'preserve-3d',
        transform: `rotateX(${spin * 0.6}deg) rotateY(${spin}deg)`,
        opacity: op,
      }}
    >
      {faces.map((f, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            border: `${1.4 * s}px solid rgba(236,233,255,.52)`,
            ...f,
          }}
        />
      ))}
    </div>
  );
};

/** The flat "square with an X" plate from the reference. */
const Plate: React.FC<{size: number; x: number; y: number; rot: number}> = ({
  size,
  x,
  y,
  rot,
}) => {
  const s = useScale();
  return (
    <svg
      width={size * s}
      height={size * s}
      viewBox="0 0 100 100"
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        marginLeft: (x - size / 2) * s,
        marginTop: (y - size / 2) * s,
        transform: `rotate(${rot}deg)`,
        opacity: 0.65,
      }}
    >
      <g fill="none" stroke="rgba(236,233,255,.75)" strokeWidth="0.9">
        <rect x="4" y="4" width="92" height="92" />
        <path d="M4 4 L96 96 M96 4 L4 96" />
      </g>
    </svg>
  );
};

/** Corner telemetry — cheap, and does most of the "designed" work. */
const Hud: React.FC<{lines: [string, string, string, string]}> = ({lines}) => {
  const s = useScale();
  const base: React.CSSProperties = {
    position: 'absolute',
    fontFamily: MONO,
    fontSize: 15 * s,
    letterSpacing: 1.2,
    color: 'rgba(236,233,255,.5)',
    whiteSpace: 'pre',
  };
  return (
    <>
      <div style={{...base, left: 34 * s, top: 30 * s}}>{lines[0]}</div>
      <div style={{...base, right: 34 * s, top: 30 * s, textAlign: 'right'}}>{lines[1]}</div>
      <div style={{...base, left: 34 * s, bottom: 28 * s}}>{lines[2]}</div>
      <div style={{...base, right: 34 * s, bottom: 28 * s, textAlign: 'right'}}>{lines[3]}</div>
    </>
  );
};

const World: React.FC<{children: React.ReactNode; settle?: boolean}> = ({
  children,
  settle = false,
}) => {
  const frame = useCurrentFrame();
  // The camera never stops — but it nearly stops when a screenshot is up.
  const amp = settle ? 0.18 : 1;
  const tx = Math.sin(frame / 95) * 16 * amp;
  const ty = Math.cos(frame / 120) * 10 * amp;
  const rot = Math.sin(frame / 150) * 0.8 * amp;
  const sc = 1 + Math.sin(frame / 200) * 0.012 * amp;

  return (
    <AbsoluteFill style={{background: '#07060f'}}>
      {/* violet bloom */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(52% 40% at 30% 28%, rgba(126,71,255,.50) 0%, transparent 70%),' +
            'radial-gradient(46% 36% at 78% 62%, rgba(214,79,255,.34) 0%, transparent 72%),' +
            'radial-gradient(70% 50% at 50% 108%, rgba(80,40,200,.55) 0%, transparent 70%)',
        }}
      />
      <AbsoluteFill
        style={{transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${sc})`}}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Frame A — a title card, full cinematic. */
const TitleFrame: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useScale();
  const rise = interpolate(frame, [0, 24], [26, 0], {extrapolateRight: 'clamp'});

  return (
    <World>
      <Grid />
      <Cube size={300} x={-210} y={-150} spin={frame * 0.45} />
      <Plate size={190} x={250} y={-230} rot={frame * 0.18} />
      <Cube size={150} x={300} y={120} spin={-frame * 0.3} op={0.5} />

      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center', transform: `translateY(${rise * s}px)`}}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 19 * s,
              letterSpacing: 5,
              color: '#c9a7ff',
              marginBottom: 20 * s,
            }}
          >
            [ 01 — WHERE MODELS RUN ]
          </div>
          <div
            style={{
              fontFamily: GROTESK,
              fontWeight: 700,
              fontSize: 132 * s,
              lineHeight: 0.92,
              letterSpacing: -4 * s,
              color: 'transparent',
              WebkitTextStroke: `${2.2 * s}px ${INK}`,
            }}
          >
            THREE
          </div>
          <div
            style={{
              fontFamily: GROTESK,
              fontWeight: 700,
              fontSize: 132 * s,
              lineHeight: 0.92,
              letterSpacing: -4 * s,
              color: INK,
            }}
          >
            PLACES
          </div>
          <div
            style={{
              marginTop: 24 * s,
              fontFamily: MONO,
              fontSize: 27 * s,
              color: 'rgba(236,233,255,.72)',
            }}
          >
            free tiers · your laptop · a borrowed GPU
          </div>
        </div>
      </AbsoluteFill>

      <Hud
        lines={[
          'SEQ 01 / 10',
          'FREE-AI-SETUP',
          'providers: 6  ·  local: 1',
          'camera: drift',
        ]}
      />
    </World>
  );
};

/** Frame B — the same world, but settled so a screenshot stays readable. */
const ShotFrame: React.FC = () => {
  const s = useScale();
  return (
    <World settle>
      <Grid speed={0.4} />
      <Plate size={150} x={-350} y={-290} rot={18} />
      <Cube size={130} x={360} y={-300} spin={22} op={0.4} />

      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{width: '100%', padding: `0 ${60 * s}px`, paddingBottom: 170 * s}}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 19 * s,
              letterSpacing: 5,
              color: '#c9a7ff',
              marginBottom: 12 * s,
            }}
          >
            [ 06 — THE ROUTER ]
          </div>
          <div
            style={{
              fontFamily: GROTESK,
              fontWeight: 700,
              fontSize: 62 * s,
              lineHeight: 1.0,
              letterSpacing: -2 * s,
              color: INK,
              marginBottom: 26 * s,
            }}
          >
            One front door,<br />many providers
          </div>
          <Shot id="topology" width={880} showLabel={false} />
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          left: '6%',
          right: '6%',
          bottom: 68 * s,
          textAlign: 'center',
          fontFamily: GROTESK,
          fontWeight: 700,
          fontSize: 52 * s,
          color: INK,
          textWrap: 'balance',
        }}
      >
        Every provider sits behind one router.
      </div>

      <Hud
        lines={['SEQ 06 / 10', 'OMNIROUTE', 'strategy: priority', 'camera: settled']}
      />
    </World>
  );
};

export const WireframeTheme: React.FC = () => {
  const frame = useCurrentFrame();
  return frame < 30 ? <TitleFrame /> : <ShotFrame />;
};
