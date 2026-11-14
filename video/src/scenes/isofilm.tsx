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
  row,
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

/**
 * Entrances.
 *
 * Every prop dropping from above made the film feel like one trick repeated,
 * so each scene now picks a different way in: from a side, growing from
 * nothing, turning as it lands, or rising from the floor.
 */
type Way = 'drop' | 'left' | 'right' | 'grow' | 'spin' | 'rise';

const Enter: React.FC<{
  delay: number;
  way?: Way;
  amount?: number;
  children: React.ReactNode;
}> = ({delay, way = 'drop', amount = 160, children}) => {
  const p = useIn(delay);
  const q = 1 - p;
  const t =
    way === 'drop'
      ? `translate(0 ${-q * amount})`
      : way === 'left'
      ? `translate(${-q * amount} 0)`
      : way === 'right'
      ? `translate(${q * amount} 0)`
      : way === 'rise'
      ? `translate(0 ${q * amount})`
      : way === 'grow'
      ? `scale(${0.3 + p * 0.7})`
      : `rotate(${q * 25}) scale(${0.55 + p * 0.45})`;
  return (
    <g opacity={Math.min(1, p * 1.5)} transform={t}>
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
      <Enter delay={2} way="grow">
        <Laptop x={-75} y={-50} />
      </Enter>
      <Enter delay={34} way="drop" amount={220}>
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
      <Enter delay={0} way="left" amount={260}>
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
      <Enter delay={0} way="rise">
        <Laptop x={-190} y={-60} />
      </Enter>
      <Enter delay={20}>
        <ModelCube x={-140} y={-160} lift={56 + Math.sin(f / 11) * 5} hot />
      </Enter>
      {/* the bigger model turns up once a GPU is in the picture */}
      <Enter delay={76} way="right" amount={300}>
        <Gpu x={60} y={40} spin={f} />
      </Enter>
      <Enter delay={94} way="grow">
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
      <Enter delay={6} way="left" amount={300}>
        <Laptop x={-230} y={120} />
      </Enter>
      <Enter delay={26} way="rise" amount={200}>
        <Rack x={-30} y={-30} lit label="FREE TIER" />
      </Enter>
      <Enter delay={46} way="right" amount={320}>
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
      <Enter delay={0} way="grow">
        <Laptop x={-150} y={-70} />
      </Enter>
      <Enter delay={30} way="spin">
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
        <Enter key={n} delay={4 + i * 13} way={i % 2 ? "left" : "right"} amount={240}>
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
      <Enter delay={2} way="left" amount={280}>
        <Gpu x={-130} y={-70} spin={f * 1.4} />
      </Enter>
      <Enter delay={24} way="right" amount={280}>
        <Gpu x={-40} y={60} spin={f * 1.7} />
      </Enter>
      <Enter delay={52} way="spin">
        <ModelCube x={10} y={-120} lift={60 + Math.sin(f / 9) * 8} hot />
      </Enter>
    </>
  );
};

/* ------------------------------------------------------------------ 8 */
/**
 * row(t, d) lands at screen (1.732 t, d): a clean horizontal row at height d.
 * That makes a top-down architecture diagram straightforward in iso space.
 */
const SRC = [row(-140, -250), row(0, -250), row(140, -250)];
const HUB = row(0, -10);
const OUT = row(0, 215);

const Route: React.FC = () => {
  const f = useCurrentFrame();
  const packet = (o: number) => ((f - 70) / 44 + o) % 1;
  return (
    <>
      <IsoFloor drift={f * 0.5} />

      {/* three sources across the top */}
      <Enter delay={2} way="left" amount={260}>
        <Laptop x={SRC[0].x - 70} y={SRC[0].y - 40} />
      </Enter>
      <Enter delay={14} way="drop" amount={240}>
        <Rack x={SRC[1].x - 30} y={SRC[1].y - 30} lit label="FREE TIER" />
      </Enter>
      <Enter delay={26} way="right" amount={260}>
        <Gpu x={SRC[2].x - 85} y={SRC[2].y - 40} spin={f} />
      </Enter>

      {/* the router under them */}
      <Enter delay={40} way="grow">
        <Router x={HUB.x - 65} y={HUB.y - 45} pulse={f} />
      </Enter>

      {/* each source wired into the router */}
      {SRC.map((p, i) => (
        <IsoRoute
          key={i}
          from={[p.x, p.y, 30]}
          to={[HUB.x, HUB.y, 40]}
          draw={ramp(f, 48 + i * 7, 64 + i * 7)}
          packets={f > 70 ? [packet(i * 0.33)] : []}
        />
      ))}

      {/* and the chat page under the router */}
      <Enter delay={74} way="rise" amount={180}>
        <g transform={`translate(${iso(OUT.x, OUT.y, 0)[0] - 115} ${iso(OUT.x, OUT.y, 0)[1] - 40})`}>
          <ChatCard x={0} y={0} scale={1.05} />
        </g>
      </Enter>
      <IsoRoute
        from={[HUB.x, HUB.y, 10]}
        to={[OUT.x, OUT.y, 40]}
        draw={ramp(f, 80, 96)}
        packets={f > 96 ? [packet(0.5)] : []}
        colour={ACCENT}
      />
    </>
  );
};

/* ------------------------------------------------------------------ 9 */
const Chat: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <IsoFloor drift={f * 0.5} />
      <Enter delay={0} way="drop" amount={200}>
        <Router x={HUB.x - 65} y={HUB.y - 300} pulse={f} />
      </Enter>
      <IsoRoute
        from={[HUB.x, HUB.y - 255, 20]}
        to={[OUT.x, OUT.y - 160, 40]}
        draw={ramp(f, 20, 40)}
        packets={f > 40 ? [((f - 40) / 36) % 1] : []}
        colour={ACCENT}
      />
      <Enter delay={10} way="grow">
        <g transform={`translate(${iso(OUT.x, OUT.y - 160, 0)[0] - 165} ${iso(OUT.x, OUT.y - 160, 0)[1] - 60})`}>
          <ChatCard x={0} y={0} scale={1.5} />
        </g>
      </Enter>
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
