import React, {useLayoutEffect, useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import {Line} from '@react-three/drei';
import * as THREE from 'three';
import {
  BEATS,
  BG,
  CUBE,
  CYAN,
  GREEN,
  HUB,
  LAPTOP,
  RED,
  SLOT,
  TOWER,
  TOWERS,
  V3,
  WIRE,
} from './world';

/** Edge pairs of a geometry, for screen-space lines (WebGL lines are 1 px). */
const edgePairs = (geo: THREE.BufferGeometry): V3[] => {
  const a = new THREE.EdgesGeometry(geo).attributes.position.array;
  const out: V3[] = [];
  for (let i = 0; i < a.length; i += 3) out.push([a[i], a[i + 1], a[i + 2]]);
  return out;
};

/** Bright edges over a dark fill that hides the edges behind. */
const Wire: React.FC<{
  geo: THREE.BufferGeometry;
  color?: string;
  width?: number;
  fill?: boolean;
  dashed?: boolean;
  opacity?: number;
}> = ({geo, color = WIRE, width = 2.2, fill = true, dashed = false, opacity = 1}) => {
  const pts = useMemo(() => edgePairs(geo), [geo]);
  return (
    <group>
      {fill ? (
        <mesh geometry={geo}>
          <meshBasicMaterial color={BG} transparent opacity={0.94} />
        </mesh>
      ) : null}
      <Line
        points={pts}
        segments
        color={color}
        lineWidth={width}
        dashed={dashed}
        dashSize={0.28}
        gapSize={0.2}
        transparent
        opacity={opacity}
      />
    </group>
  );
};

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

/** Camera: placed on the (1,1,1) diagonal from the beat's target. */
const CameraRig: React.FC<{b: number}> = ({b}) => {
  const camera = useThree((s) => s.camera);
  const beat = BEATS[b];
  useLayoutEffect(() => {
    const [x, y, z] = beat.target;
    camera.position.set(x + 30, y + 30, z + 30);
    camera.lookAt(x, y, z);
    camera.zoom = beat.zoom;
    camera.updateProjectionMatrix();
  }, [camera, beat]);
  return null;
};

const Laptop: React.FC<{b: number}> = ({b}) => {
  const base = useMemo(() => box(5.2, 0.34, 3.6), []);
  const lid = useMemo(() => box(5.2, 3.4, 0.2), []);
  const chat = b >= 8;
  return (
    <group position={LAPTOP}>
      <Wire geo={base} width={b === 0 ? 3 : 2.2} />
      <group position={[0, 1.75, -1.75]} rotation={[-0.22, 0, 0]}>
        <Wire geo={lid} width={b === 0 ? 3 : 2.2} />
        {/* the screen */}
        <mesh position={[0, 0, 0.12]}>
          <planeGeometry args={[4.7, 2.9]} />
          <meshBasicMaterial color={chat ? '#0e2a44' : CYAN} transparent opacity={chat ? 0.95 : 0.35} />
        </mesh>
        {chat ? (
          // a chat page: question on the right, a streamed reply on the left
          <group position={[0, 0, 0.14]}>
            <mesh position={[0.9, 0.8, 0]}>
              <planeGeometry args={[2.2, 0.36]} />
              <meshBasicMaterial color={CYAN} />
            </mesh>
            {[0.05, -0.45, -0.95].map((y, i) => (
              <mesh key={i} position={[-0.6 - i * 0.15, y, 0]}>
                <planeGeometry args={[3.0 - i * 0.5, 0.26]} />
                <meshBasicMaterial color="#cfe6ff" transparent opacity={0.85} />
              </mesh>
            ))}
          </group>
        ) : null}
      </group>
    </group>
  );
};

/** Where a GPU would go: crossed out in beat 2, filled in beat 3. */
const Slot: React.FC<{b: number}> = ({b}) => {
  const pad = useMemo(() => box(3.2, 0.06, 1.6), []);
  const card = useMemo(() => box(3.2, 0.42, 1.6), []);
  if (b !== 1 && b !== 2) return null;
  const [x, y, z] = SLOT;
  return (
    <group position={[x, y, z]}>
      {b === 1 ? (
        <>
          <Wire geo={pad} color={RED} dashed fill={false} width={2.6} />
          <Line points={[[-1.6, 0.05, -0.8], [1.6, 0.05, 0.8]]} color={RED} lineWidth={3.2} />
          <Line points={[[1.6, 0.05, -0.8], [-1.6, 0.05, 0.8]]} color={RED} lineWidth={3.2} />
        </>
      ) : (
        <group position={[0, 0.25, 0]}>
          <Wire geo={card} color={GREEN} width={2.6} />
          {[-0.75, 0.75].map((dx) => (
            <mesh key={dx} position={[dx, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.36, 0.48, 24]} />
              <meshBasicMaterial color={GREEN} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

/** The model, before it moves up into the first tower. */
const Cube: React.FC<{b: number}> = ({b}) => {
  const big = useMemo(() => box(1.6, 1.6, 1.6), []);
  if (b !== 2) return null;
  return (
    <group position={CUBE} rotation={[0, 0.5, 0]}>
      <Wire geo={big} color={GREEN} width={2.8} />
      <mesh>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshBasicMaterial color={GREEN} transparent opacity={0.35} />
      </mesh>
    </group>
  );
};

const Tower: React.FC<{i: number; b: number}> = ({i, b}) => {
  const body = useMemo(() => box(2.0, 4.2, 2.0), []);
  const foot = useMemo(() => box(2.0, 0.05, 2.0), []);
  const gpuCard = useMemo(() => box(0.18, 0.5, 1.7), []);
  const built = b >= 4 + i;
  const placeholder = b >= 3 && !built;
  const focus = b === 4 + i;
  const c = TOWER[i];
  if (!built && !placeholder) return null;
  return (
    <group position={TOWERS[i]}>
      {placeholder ? (
        <group position={[0, -2.1, 0]}>
          <Wire geo={foot} color={WIRE} dashed fill={false} width={2.4} opacity={0.75} />
        </group>
      ) : (
        <>
          <Wire geo={body} width={focus ? 3 : 2.2} />
          {/* lit strip in the tower's own colour */}
          <mesh position={[0, 1.45, 1.02]}>
            <planeGeometry args={[1.5, 0.4]} />
            <meshBasicMaterial color={c} />
          </mesh>
          {/* rack lines */}
          {[0.7, 0.25, -0.2, -0.65, -1.1, -1.55].map((y) => (
            <Line key={y} points={[[-0.75, y, 1.02], [0.75, y, 1.02]]} color={c} lineWidth={1.4} transparent opacity={0.6} />
          ))}
          {/* tower 1 carries the model that came up from the laptop */}
          {i === 0 ? (
            <mesh position={[0, 2.75, 0]} rotation={[0, 0.5, 0]}>
              <boxGeometry args={[0.8, 0.8, 0.8]} />
              <meshBasicMaterial color={c} transparent opacity={0.6} />
            </mesh>
          ) : null}
          {/* tower 3 gets two GPU cards */}
          {i === 2 && b >= 6
            ? [0.45, -0.25].map((y, k) => (
                <group key={k} position={[1.55, y, 0]}>
                  <Wire geo={gpuCard} color={c} width={2.2} />
                </group>
              ))
            : null}
        </>
      )}
    </group>
  );
};

const Hub: React.FC<{b: number}> = ({b}) => {
  const hex = useMemo(() => new THREE.CylinderGeometry(2.0, 2.0, 0.8, 6), []);
  if (b < 7) return null;
  return (
    <group position={HUB} rotation={[0, 0.26, 0]}>
      <Wire geo={hex} width={b === 7 ? 3.2 : 2.4} />
      <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 6]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.75} />
      </mesh>
    </group>
  );
};

/** Data lines and packets: towers into the hub, the hub into the laptop. */
const Flow: React.FC<{b: number}> = ({b}) => {
  const curves = useMemo(
    () =>
      TOWERS.map(
        (t) =>
          new THREE.CubicBezierCurve3(
            new THREE.Vector3(t[0], t[1] - 2.2, t[2]),
            new THREE.Vector3(t[0] * 0.8, t[1] - 4.4, t[2] * 0.8),
            new THREE.Vector3(t[0] * 0.2, HUB[1] + 2.6, t[2] * 0.2),
            new THREE.Vector3(HUB[0], HUB[1] + 0.5, HUB[2])
          )
      ),
    []
  );
  const down = useMemo(
    () =>
      new THREE.CubicBezierCurve3(
        new THREE.Vector3(HUB[0], HUB[1] - 0.5, HUB[2]),
        new THREE.Vector3(0, HUB[1] - 2.6, 0),
        new THREE.Vector3(0, LAPTOP[1] + 4.6, 0),
        new THREE.Vector3(0, LAPTOP[1] + 2.0, 0)
      ),
    []
  );
  if (b < 7) return null;
  const lines = b >= 8 ? [...curves, down] : curves;
  return (
    <>
      {lines.map((c, i) => (
        <group key={i}>
          <Line points={c.getPoints(48)} color={CYAN} lineWidth={3.4} />
          {[0.22, 0.52, 0.82].map((u) => {
            const p = c.getPointAt((u + i * 0.11) % 1);
            return (
              <mesh key={u} position={p}>
                <sphereGeometry args={[0.2, 14, 14]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            );
          })}
        </group>
      ))}
    </>
  );
};

export const Scene3D: React.FC<{b: number}> = ({b}) => (
  <>
    <color attach="background" args={[BG]} />
    <CameraRig b={b} />
    <gridHelper args={[80, 80, '#1d4772', '#122b48']} position={[0, LAPTOP[1] - 0.6, 0]} />
    {b >= 4 && b <= 6 ? null : <Laptop b={b} />}
    <Slot b={b} />
    <Cube b={b} />
    {[0, 1, 2].map((i) => (
      <Tower key={i} i={i} b={b} />
    ))}
    <Hub b={b} />
    <Flow b={b} />
  </>
);
