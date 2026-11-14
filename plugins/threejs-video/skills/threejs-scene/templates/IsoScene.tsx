/**
 * Isometric 9:16 data-flow scene, rendered with @remotion/three.
 *
 * Three sources across the top, a hub in the middle, a laptop at the bottom,
 * with packets flowing down bezier curves. Everything is driven by
 * useCurrentFrame(); there is no useFrame() and no running clock, because
 * Remotion renders frames out of order and anything time-based flickers.
 *
 * Copy into a Remotion project, then change NODES, colours and timings.
 */
import React, {useLayoutEffect, useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {ease, enter, float, row} from './scene-utils';

const BG = '#0d1117';
const WIRE = '#ffffff';
const FLOW = '#4bd8ff';

const TOP = 6.5;
const HUB = 0;
const BOTTOM = -7;

/** Sources across the top: a flat row, so they spread sideways only. */
const SOURCES = [
  {pos: row(2.6, TOP), colour: '#22d3ee', at: 10},
  {pos: row(0, TOP + 0.4), colour: '#e879f9', at: 22},
  {pos: row(-2.6, TOP), colour: '#facc15', at: 34},
];

/** Camera: frame-driven zoom and target, nothing else moves it. */
const CameraRig: React.FC<{zoom: number; targetY: number}> = ({zoom, targetY}) => {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.position.set(20, 20 + targetY, 20);
    camera.lookAt(0, targetY, 0);
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
  }, [camera, zoom, targetY]);
  return null;
};

/** A box with bright edges over a dark fill that hides the edges behind it. */
const WireBox: React.FC<{size: [number, number, number]; colour?: string}> = ({
  size,
  colour = WIRE,
}) => {
  const geo = useMemo(() => new THREE.BoxGeometry(...size), [size]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);
  return (
    <group>
      <mesh geometry={geo}>
        <meshBasicMaterial color={BG} transparent opacity={0.9} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={colour} />
      </lineSegments>
    </group>
  );
};

/** Packets moving along a curve. `t` is the flow position, 0..1 and repeating. */
const Packets: React.FC<{curve: THREE.CubicBezierCurve3; t: number; n?: number; colour: string}> = ({
  curve,
  t,
  n = 6,
  colour,
}) => (
  <>
    {Array.from({length: n}).map((_, i) => {
      const u = (t + i / n) % 1;
      const p = curve.getPointAt(u);
      return (
        <mesh key={i} position={p} scale={0.7 + Math.sin(u * Math.PI) * 0.6}>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshBasicMaterial color={colour} />
        </mesh>
      );
    })}
  </>
);

export const IsoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps, durationInFrames} = useVideoConfig();

  // Curves from each source down into the hub, and from the hub to the laptop.
  const curves = useMemo(
    () =>
      SOURCES.map(
        (s) =>
          new THREE.CubicBezierCurve3(
            new THREE.Vector3(s.pos[0], s.pos[1] - 2.4, s.pos[2]),
            new THREE.Vector3(s.pos[0] * 0.7, s.pos[1] - 5, s.pos[2] * 0.7),
            new THREE.Vector3(s.pos[0] * 0.2, HUB + 3, s.pos[2] * 0.2),
            new THREE.Vector3(0, HUB + 0.6, 0)
          )
      ),
    []
  );
  const out = useMemo(
    () =>
      new THREE.CubicBezierCurve3(
        new THREE.Vector3(0, HUB - 0.6, 0),
        new THREE.Vector3(0, HUB - 3, 0),
        new THREE.Vector3(0, BOTTOM + 3.6, 0),
        new THREE.Vector3(0, BOTTOM + 1.1, 0)
      ),
    []
  );

  // Camera: a slow push in, then a pull back for the close.
  const zoom =
    58 + ease(frame, 0, durationInFrames * 0.6) * 12 - ease(frame, durationInFrames * 0.85, durationInFrames) * 10;

  // Entrances. The laptop starts with a negative delay: it is already arriving
  // at frame 0, so the scene never opens on an empty frame.
  const laptopIn = enter(frame, fps, -8);
  const hubIn = enter(frame, fps, 48);
  const flowOn = ease(frame, 60, 80);
  const flowT = frame / fps / 4.5;

  return (
    <AbsoluteFill style={{background: BG}}>
      <ThreeCanvas
        width={width}
        height={height}
        orthographic
        flat
        camera={{zoom: 58, position: [20, 20, 20]}}
      >
        <color attach="background" args={[BG]} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[8, 16, 10]} intensity={1.1} />
        <CameraRig zoom={zoom} targetY={-0.5} />

        <gridHelper args={[60, 60, '#1b3354', '#14273f']} position={[0, BOTTOM - 1.5, 0]} />

        {SOURCES.map((s, i) => {
          const p = enter(frame, fps, s.at);
          return (
            <group
              key={i}
              position={[s.pos[0], s.pos[1] + float(frame, fps, i * 1.4), s.pos[2]]}
              scale={[1, Math.max(0.001, p), 1]}
              visible={p > 0.02}
            >
              <WireBox size={[2.2, 4.4, 2.2]} colour={s.colour} />
            </group>
          );
        })}

        <group
          position={[0, HUB + float(frame, fps, 2.1, 0.1), 0]}
          scale={Math.max(0.001, hubIn)}
          visible={hubIn > 0.02}
          rotation={[0, frame / fps * 0.25, 0]}
        >
          <WireBox size={[3.2, 0.9, 3.2]} colour={FLOW} />
        </group>

        <group
          position={[0, BOTTOM + float(frame, fps, 0.6, 0.12), 0]}
          scale={Math.max(0.001, laptopIn)}
          visible={laptopIn > 0.02}
        >
          <WireBox size={[5, 0.35, 3.4]} />
          <group position={[0, 1.6, -1.6]} rotation={[-0.25, 0, 0]}>
            <WireBox size={[5, 3.2, 0.2]} />
          </group>
        </group>

        {flowOn > 0
          ? curves.map((c, i) => (
              <Packets key={i} curve={c} t={flowT + i * 0.2} colour={SOURCES[i].colour} />
            ))
          : null}
        {flowOn > 0 ? <Packets curve={out} t={flowT} colour={FLOW} /> : null}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
