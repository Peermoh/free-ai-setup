import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/space-grotesk/700.css';
import {useScale} from '../layout';
import {Shot} from '../components/Shot';
import {
  AMBER,
  Atmosphere,
  DesignFrame,
  Floor,
  GROTESK,
  Hud,
  INK,
  Links,
  MONO,
  Node,
  P3,
  project,
  VIOLET,
} from './constellation-lib';

/**
 * Theme option 5 — "Constellation".
 *
 * The depth, drift and restraint of the reference clip, but the geometry is
 * the subject itself: providers are planes at different distances, the lines
 * between them are the routes, and a request travels through depth rather
 * than across the screen. Every moving object carries meaning.
 *
 * Frames: 15 title · 45 constellation · 75 fallback · 105 screenshot
 */

/** Where each provider sits in space. Shared by several frames. */
const ROUTER: P3 = {x: 0, y: 40, z: 40};
const PROVIDERS: {p: P3; label: string; sub: string}[] = [
  {p: {x: -300, y: -210, z: 420}, label: 'Groq', sub: 'free tier'},
  {p: {x: 300, y: -250, z: 500}, label: 'Gemini', sub: 'free tier'},
  {p: {x: -420, y: 90, z: 760}, label: 'NVIDIA', sub: 'free trial'},
  {p: {x: 430, y: 60, z: 820}, label: 'OpenRouter', sub: 'free + paid'},
  {p: {x: -250, y: 330, z: 1150}, label: 'Kaggle', sub: 'borrowed GPU'},
  {p: {x: 270, y: 350, z: 1250}, label: 'your laptop', sub: 'private, last'},
];

const Caption: React.FC<{children: React.ReactNode}> = ({children}) => {
  const s = useScale();
  return (
    <div
      style={{
        position: 'absolute',
        left: '6%',
        right: '6%',
        bottom: 70 * s,
        textAlign: 'center',
        fontFamily: GROTESK,
        fontWeight: 700,
        fontSize: 52 * s,
        lineHeight: 1.2,
        color: INK,
        textWrap: 'balance',
      }}
    >
      {children}
    </div>
  );
};

const World: React.FC<{children: React.ReactNode; settle?: boolean}> = ({
  children,
  settle,
}) => {
  const frame = useCurrentFrame();
  const amp = settle ? 0.2 : 1;
  const tx = Math.sin(frame / 90) * 14 * amp;
  const ty = Math.cos(frame / 115) * 9 * amp;
  const rot = Math.sin(frame / 160) * 0.7 * amp;
  return (
    <AbsoluteFill style={{background: '#06040e'}}>
      <Atmosphere />
      <Floor drift={(frame * 1.5 * (settle ? 0.35 : 1)) % 118} />
      <AbsoluteFill style={{transform: `translate(${tx}px,${ty}px) rotate(${rot}deg)`}}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 1 — Title: the three kinds of place, receding into depth. */
const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useScale();
  const rise = interpolate(frame, [0, 22], [24, 0], {extrapolateRight: 'clamp'});
  return (
    <World>
      <DesignFrame>
        {/* Kept out to the edges: the headline owns the middle of the frame. */}
        <Node p={{x: -430, y: -360, z: 240}} label="free tiers" sub="someone else's server" />
        <Node p={{x: 470, y: -180, z: 520}} label="your laptop" sub="slow, unlimited" />
        <Node p={{x: -300, y: 430, z: 760}} label="a borrowed GPU" sub="hours per week" />
      </DesignFrame>

      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center', transform: `translateY(${rise * s}px)`}}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 18 * s,
              letterSpacing: 5.5,
              color: '#c3a4ff',
              marginBottom: 18 * s,
            }}
          >
            [ 01 — WHERE A MODEL RUNS ]
          </div>
          <div
            style={{
              fontFamily: GROTESK,
              fontWeight: 700,
              fontSize: 124 * s,
              lineHeight: 0.92,
              letterSpacing: -4 * s,
              color: 'transparent',
              WebkitTextStroke: `${2 * s}px ${INK}`,
            }}
          >
            THREE
          </div>
          <div
            style={{
              fontFamily: GROTESK,
              fontWeight: 700,
              fontSize: 124 * s,
              lineHeight: 0.92,
              letterSpacing: -4 * s,
              color: INK,
            }}
          >
            PLACES
          </div>
        </div>
      </AbsoluteFill>
      <Hud tl="SEQ 01 / 10" tr="FREE-AI-SETUP" bl="depth: 3 tiers" br="camera: drift" />
    </World>
  );
};

/** 2 — The constellation: one router, every provider behind it. */
const Graph: React.FC = () => (
  <World>
    <DesignFrame>
      <Links from={ROUTER} to={PROVIDERS.map((p) => p.p)} />
      {PROVIDERS.map((n) => (
        <Node key={n.label} p={n.p} label={n.label} sub={n.sub} />
      ))}
      <Node p={ROUTER} label="the router" sub="one front door" tone="router" />
    </DesignFrame>
    <Caption>Six providers. One front door.</Caption>
    <Hud tl="SEQ 06 / 10" tr="OMNIROUTE" bl="providers: 6" br="camera: drift" />
  </World>
);

/** 3 — Fallback: first choice is out, the next one answers. */
const Fallback: React.FC = () => {
  const frame = useCurrentFrame();
  // The request travels from the router out to Gemini, through depth.
  const t = interpolate(frame % 60, [0, 55], [0, 1], {extrapolateRight: 'clamp'});
  const a = project(ROUTER);
  const b = project(PROVIDERS[1].p);
  const px = a.x + (b.x - a.x) * t;
  const py = a.y + (b.y - a.y) * t;

  return (
    <World>
      <DesignFrame>
        <Links from={ROUTER} to={PROVIDERS.map((p) => p.p)} highlight={1} dim />
        {PROVIDERS.map((n, i) => (
          <Node
            key={n.label}
            p={n.p}
            label={n.label}
            sub={n.sub}
            tone={i === 0 ? 'closed' : i === 1 ? 'open' : 'ink'}
            state={i === 0 ? 'OUT OF QUOTA' : i === 1 ? 'ANSWERED' : undefined}
          />
        ))}
        <Node p={ROUTER} label="the router" tone="router" />
        {/* the request itself */}
        <div
          style={{
            position: 'absolute',
            left: px,
            top: py,
            width: 16,
            height: 16,
            marginLeft: -8,
            marginTop: -8,
            borderRadius: 999,
            background: '#ffffff',
            boxShadow: `0 0 26px 7px ${VIOLET}`,
          }}
        />
      </DesignFrame>
      <Caption>First one is out of quota. The next answers.</Caption>
      <Hud tl="SEQ 07 / 10" tr="STRATEGY: PRIORITY" bl="attempt 2 of 5" br="camera: drift" />
    </World>
  );
};

/** 4 — A screenshot arriving as a lit window in the same space. */
const Window: React.FC = () => {
  const s = useScale();
  return (
    <World settle>
      <DesignFrame>
        <Links from={ROUTER} to={PROVIDERS.map((p) => p.p)} dim />
        {PROVIDERS.slice(2).map((n) => (
          <Node key={n.label} p={n.p} label={n.label} sub={n.sub} />
        ))}
      </DesignFrame>

      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{paddingBottom: 150 * s, textAlign: 'center'}}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 18 * s,
              letterSpacing: 5,
              color: '#c3a4ff',
              marginBottom: 16 * s,
            }}
          >
            [ 06 — THE ROUTER, FOR REAL ]
          </div>
          <div
            style={{
              boxShadow: `0 0 ${90 * s}px ${30 * s}px rgba(122,70,255,.28)`,
              borderRadius: 20 * s,
            }}
          >
            <Shot id="topology" width={860} showLabel={false} />
          </div>
        </div>
      </AbsoluteFill>
      <Caption>Not a diagram. That is the running setup.</Caption>
      <Hud tl="" tr="OMNIROUTE" bl="live" br="camera: settled" />
    </World>
  );
};

const FRAMES = [Title, Graph, Fallback, Window];

export const Constellation: React.FC = () => {
  const frame = useCurrentFrame();
  const F = FRAMES[Math.min(FRAMES.length - 1, Math.floor(frame / 30))];
  return <F />;
};
