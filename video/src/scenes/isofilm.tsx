import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  ACCENT,
  ChatCard,
  EmptySlot,
  Gpu,
  IsoFloor,
  IsoRoute,
  Laptop,
  ModelCube,
  Rack,
  Router,
  iso,
} from '../design/iso';
import {SceneId} from '../config';

/**
 * The ten scenes, as isometric stages.
 *
 * A scene returns the SVG contents of the stage. Props arrive on springs,
 * routes draw themselves and packets run along them, so the picture is always
 * assembling rather than sitting still.
 */

/** Spring 0..1 after `delay` frames. */
const useIn = (delay: number, damping = 16) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping}});
};

/** Drops a prop in from above and settles it. */
const Enter: React.FC<{delay: number; from?: number; children: React.ReactNode}> = ({
  delay,
  from = 150,
  children,
}) => {
  const p = useIn(delay);
  return (
    <g opacity={Math.min(1, p * 1.5)} transform={`translate(0 ${(1 - p) * -from})`}>
      {children}
    </g>
  );
};

/** Linear ramp helper. */
const ramp = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/* ------------------------------------------------------------------ 1 */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <IsoFloor drift={f * 0.5} />
      <Enter delay={2}>
        <Laptop x={-75} y={-50} />
      </Enter>
      <Enter delay={34}>
        <ModelCube x={-20} y={-150} lift={60 + Math.sin(f / 12) * 6} hot />
      </Enter>
    </>
  );
};

/* ------------------------------------------------------------------ 2 */
const NoGpu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <IsoFloor drift={f * 0.5} />
      <Enter delay={0}>
        <Laptop x={-150} y={-80} />
      </Enter>
      <g opacity={ramp(f, 26, 40)}>
        <EmptySlot x={40} y={60} />
      </g>
    </>
  );
};

/* ------------------------------------------------------------------ 3 */
const Still: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <IsoFloor drift={f * 0.5} />
      <Enter delay={0}>
        <Laptop x={-190} y={-60} />
      </Enter>
      <Enter delay={20}>
        <ModelCube x={-140} y={-160} lift={56 + Math.sin(f / 11) * 5} hot />
      </Enter>
      {/* the bigger model turns up once a GPU is in the picture */}
      <Enter delay={76}>
        <Gpu x={60} y={40} spin={f} />
      </Enter>
      <Enter delay={94}>
        <ModelCube x={110} y={-40} lift={70 + Math.sin(f / 9) * 7} hot />
      </Enter>
    </>
  );
};

/* ------------------------------------------------------------------ 4 */
const Three: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <IsoFloor drift={f * 0.5} />
      <Enter delay={6}>
        <Laptop x={-230} y={120} />
      </Enter>
      <Enter delay={26}>
        <Rack x={-30} y={-30} lit label="FREE TIER" />
      </Enter>
      <Enter delay={46}>
        <Gpu x={100} y={-190} spin={f} />
      </Enter>
    </>
  );
};

/* ------------------------------------------------------------------ 5 */
const Local: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <IsoFloor drift={f * 0.5} />
      <Enter delay={0}>
        <Laptop x={-150} y={-70} />
      </Enter>
      <Enter delay={30}>
        <ModelCube x={-100} y={-180} lift={64 + Math.sin(f / 10) * 6} hot />
      </Enter>
      {/* the answer comes back out of the machine, not from the network */}
      <IsoRoute
        from={[-100, -150, 70]}
        to={[-60, -40, 20]}
        draw={ramp(f, 70, 92)}
        packets={[((f - 70) / 60) % 1]}
        colour={ACCENT}
      />
    </>
  );
};

/* ------------------------------------------------------------------ 6 */
const Tiers: React.FC = () => {
  const f = useCurrentFrame();
  const names = ['GROQ', 'GEMINI', 'NVIDIA', 'OPENROUTER'];
  return (
    <>
      <IsoFloor drift={f * 0.5} />
      {names.map((n, i) => (
        <Enter key={n} delay={4 + i * 13}>
          <Rack
            x={-180 + i * 95}
            y={180 - i * 95}
            lit={f > 60 + i * 10}
            label={n}
          />
        </Enter>
      ))}
    </>
  );
};

/* ------------------------------------------------------------------ 7 */
const Gpus: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <IsoFloor drift={f * 0.5} />
      <Enter delay={2}>
        <Gpu x={-130} y={-70} spin={f * 1.4} />
      </Enter>
      <Enter delay={24}>
        <Gpu x={-40} y={60} spin={f * 1.7} />
      </Enter>
      <Enter delay={52}>
        <ModelCube x={10} y={-120} lift={60 + Math.sin(f / 9) * 8} hot />
      </Enter>
    </>
  );
};

/* ------------------------------------------------------------------ 8 */
const Route: React.FC = () => {
  const f = useCurrentFrame();
  const P = (t: number) => ((f - 54) / 46 + t) % 1;
  return (
    <>
      <IsoFloor drift={f * 0.5} />
      <Enter delay={0}>
        <Router x={-65} y={-45} pulse={f} />
      </Enter>
      <Enter delay={18}>
        <Rack x={210} y={-230} lit label="FREE TIER" />
      </Enter>
      <Enter delay={30}>
        <Gpu x={120} y={150} spin={f} />
      </Enter>
      <Enter delay={42}>
        <Laptop x={-330} y={110} />
      </Enter>
      {/* routes out of the router, drawn in turn, then carrying packets */}
      <IsoRoute from={[0, 0, 34]} to={[240, -200, 40]} draw={ramp(f, 48, 62)} packets={f > 62 ? [P(0)] : []} />
      <IsoRoute from={[0, 0, 34]} to={[170, 180, 22]} draw={ramp(f, 58, 72)} packets={f > 72 ? [P(0.33)] : []} />
      <IsoRoute from={[0, 0, 34]} to={[-250, 150, 20]} draw={ramp(f, 68, 82)} packets={f > 82 ? [P(0.66)] : []} dash />
    </>
  );
};

/* ------------------------------------------------------------------ 9 */
const Chat: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <IsoFloor drift={f * 0.5} />
      <Enter delay={14}>
        <Router x={60} y={-240} pulse={f} />
      </Enter>
      <IsoRoute
        from={[120, -200, 34]}
        to={[-40, 20, 60]}
        draw={ramp(f, 34, 52)}
        packets={f > 52 ? [((f - 52) / 40) % 1] : []}
        colour={ACCENT}
      />
      <g opacity={Math.min(1, useIn(4) * 1.4)} transform="translate(-230 -60)">
        <ChatCard x={0} y={0} scale={1.45} />
      </g>
    </>
  );
};

/* ----------------------------------------------------------------- 10 */
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <IsoFloor drift={f * 0.5} />
      <Enter delay={0}>
        <Laptop x={-230} y={60} />
      </Enter>
      <Enter delay={16}>
        <Rack x={40} y={-110} lit label="FREE TIER" />
      </Enter>
      <Enter delay={28}>
        <Gpu x={-60} y={-220} spin={f} />
      </Enter>
      <Enter delay={40}>
        <Router x={130} y={60} pulse={f} />
      </Enter>
    </>
  );
};

export const ISO_SCENES: Record<SceneId, React.FC> = {
  hook: Hook,
  nogpu: NoGpu,
  still: Still,
  three: Three,
  local: Local,
  tiers: Tiers,
  gpu: Gpus,
  route: Route,
  chat: Chat,
  cta: Cta,
};
