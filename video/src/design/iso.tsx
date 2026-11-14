import React from 'react';

/**
 * Isometric props drawn as SVG polygons.
 *
 * CSS 3D turned out to be the wrong tool here: nested rotations compound and
 * a prop silently collapses. In isometric SVG every corner is computed, so a
 * shape is either right or obviously wrong, and flat fills are exactly the
 * look we want anyway.
 *
 * Space: x runs right-and-down, y runs left-and-down, z is up.
 */

export const ACCENT = '#ff7a1a';
export const INK = '#eef2fb';

export const iso = (x: number, y: number, z: number): [number, number] => [
  (x - y) * 0.866,
  (x + y) * 0.5 - z,
];

const pts = (ps: [number, number][]) => ps.map((p) => p.join(',')).join(' ');

export type Shades = {top: string; left: string; right: string};

/** Default shading for a cool grey object lit from above. */
export const GREY: Shades = {top: '#c9d4e6', left: '#8c99b0', right: '#5f6b81'};
export const DARK: Shades = {top: '#3b4860', left: '#232e42', right: '#17202f'};
export const HOT: Shades = {top: '#ffb264', left: ACCENT, right: '#c85c0d'};

/** A cuboid with its origin at the near-bottom corner. */
export const IsoBox: React.FC<{
  x?: number;
  y?: number;
  z?: number;
  w: number;
  d: number;
  h: number;
  shades?: Shades;
  /** Drawn on the left (front-right) face, in that face's own space. */
  leftFace?: (p: {w: number; h: number}) => React.ReactNode;
  topFace?: (p: {w: number; d: number}) => React.ReactNode;
}> = ({x = 0, y = 0, z = 0, w, d, h, shades = GREY, leftFace, topFace}) => {
  const P = (ax: number, ay: number, az: number) => iso(x + ax, y + ay, z + az);
  return (
    <g>
      {/* top */}
      <polygon
        points={pts([P(0, 0, h), P(w, 0, h), P(w, d, h), P(0, d, h)])}
        fill={shades.top}
      />
      {/* front-right face (y = d) */}
      <polygon
        points={pts([P(0, d, h), P(w, d, h), P(w, d, 0), P(0, d, 0)])}
        fill={shades.left}
      />
      {/*
        With +x going right-and-down and +y left-and-down, the near corner is
        (w, d). So the two visible vertical faces are y = d and x = w; the
        x = 0 face points away from the camera and must not be drawn, or it
        paints a wedge over the top.
      */}
      <polygon
        points={pts([P(w, 0, h), P(w, d, h), P(w, d, 0), P(w, 0, 0)])}
        fill={shades.right}
      />
      {/* face decoration, placed with a matrix that maps the face's own
          rectangle onto the isometric parallelogram */}
      {leftFace ? (
        <g
          /*
           * Maps the face's own rectangle onto its isometric parallelogram:
           * local +x follows the box's +x direction (0.866, 0.5), and local
           * +y runs DOWN the face, which is -z, i.e. (0, +1) on screen.
           */
          transform={`matrix(0.866,0.5,0,1,${P(0, d, h)[0]},${P(0, d, h)[1]})`}
        >
          {leftFace({w, h})}
        </g>
      ) : null}
      {topFace ? (
        <g transform={`matrix(0.866,0.5,-0.866,0.5,${P(0, 0, h)[0]},${P(0, 0, h)[1]})`}>
          {topFace({w, d})}
        </g>
      ) : null}
    </g>
  );
};

/** Soft shadow blob on the floor. */
export const IsoShadow: React.FC<{x?: number; y?: number; w: number; d: number}> = ({
  x = 0,
  y = 0,
  w,
  d,
}) => {
  const c = iso(x + w / 2, y + d / 2, 0);
  return (
    <ellipse
      cx={c[0]}
      cy={c[1]}
      rx={w * 0.78}
      ry={w * 0.34}
      fill="rgba(0,0,0,.55)"
      style={{filter: 'blur(9px)'}}
    />
  );
};

/** Grid floor, in the same space as everything standing on it. */
export const IsoFloor: React.FC<{half?: number; step?: number; drift?: number}> = ({
  half = 900,
  step = 90,
  drift = 0,
}) => {
  const lines: React.ReactNode[] = [];
  const o = drift % step;
  for (let i = -half; i <= half; i += step) {
    const a = iso(i, -half + o, 0);
    const b = iso(i, half + o, 0);
    lines.push(
      <line key={`x${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="rgba(150,180,230,.13)" strokeWidth={1.2} />
    );
    const c = iso(-half, i + o, 0);
    const e = iso(half, i + o, 0);
    lines.push(
      <line key={`y${i}`} x1={c[0]} y1={c[1]} x2={e[0]} y2={e[1]} stroke="rgba(150,180,230,.10)" strokeWidth={1.2} />
    );
  }
  return <g>{lines}</g>;
};

/* ------------------------------------------------------------ the props */

/** A server rack: dark cabinet, lit strip, vent slots. */
export const Rack: React.FC<{x?: number; y?: number; lit?: boolean; label?: string}> = ({
  x = 0,
  y = 0,
  lit,
  label,
}) => (
  <g>
    <IsoShadow x={x} y={y} w={62} d={62} />
    <IsoBox
      x={x}
      y={y}
      w={62}
      d={62}
      h={170}
      shades={DARK}
      leftFace={({w, h}) => (
        <>
          <rect x={6} y={8} width={w - 12} height={26} fill={lit ? ACCENT : '#46556f'} />
          {Array.from({length: 6}).map((_, i) => (
            <rect
              key={i}
              x={8}
              y={44 + i * 18}
              width={w - 16}
              height={9}
              fill="rgba(255,255,255,.10)"
            />
          ))}
          {label ? (
            <text
              x={w / 2}
              y={h - 10}
              textAnchor="middle"
              fontFamily="monospace"
              fontSize={11}
              fill="rgba(255,255,255,.6)"
            >
              {label}
            </text>
          ) : null}
        </>
      )}
    />
  </g>
);

/** A laptop: thin base, screen leaning back. */
export const Laptop: React.FC<{x?: number; y?: number}> = ({x = 0, y = 0}) => {
  const W = 150;
  const D = 105;
  // screen corners: hinged along the far edge (y = 0), leaning back and up
  const lean = 0.42; // how far the top edge sits back in y
  const SH = 92;
  const a = iso(x, y, 0);
  const b = iso(x + W, y, 0);
  const c = iso(x + W, y - D * lean, SH);
  const dd = iso(x, y - D * lean, SH);
  return (
    <g>
      <IsoShadow x={x} y={y} w={W} d={D} />
      {/* screen back */}
      <polygon points={pts([a, b, c, dd])} fill="#30405c" />
      {/* screen glass */}
      <polygon
        points={pts([
          iso(x + 8, y - 2, 6),
          iso(x + W - 8, y - 2, 6),
          iso(x + W - 8, y - D * lean + 4, SH - 8),
          iso(x + 8, y - D * lean + 4, SH - 8),
        ])}
        fill="#0b1324"
      />
      <polygon
        points={pts([
          iso(x + 14, y - 3, 14),
          iso(x + W - 40, y - 3, 14),
          iso(x + W - 40, y - D * lean + 3, SH - 22),
          iso(x + 14, y - D * lean + 3, SH - 22),
        ])}
        fill={ACCENT}
        opacity={0.75}
      />
      {/* base */}
      <IsoBox x={x} y={y} w={W} d={D} h={8} shades={GREY} />
      {/* keyboard hint */}
      <IsoBox x={x + 16} y={y + 18} w={W - 32} d={D - 46} h={1.5} shades={{top: '#9fb0c9', left: '#8c99b0', right: '#5f6b81'}} />
    </g>
  );
};

/** A GPU card: long board, two fans. */
export const Gpu: React.FC<{x?: number; y?: number; spin?: number}> = ({
  x = 0,
  y = 0,
  spin = 0,
}) => (
  <g>
    <IsoShadow x={x} y={y} w={175} d={80} />
    <IsoBox
      x={x}
      y={y}
      w={175}
      d={80}
      h={22}
      shades={DARK}
      topFace={({w, d}) => (
        <>
          <rect x={0} y={0} width={w} height={d} fill="#222d40" />
          {[0.27, 0.72].map((f, i) => (
            <g key={i} transform={`translate(${w * f} ${d / 2})`}>
              <circle r={26} fill="#161f2e" stroke={ACCENT} strokeWidth={2.5} />
              <g transform={`rotate(${spin * (i ? -7 : 7)})`}>
                {[0, 72, 144, 216, 288].map((a) => (
                  <rect
                    key={a}
                    x={-1.4}
                    y={-24}
                    width={2.8}
                    height={20}
                    fill="rgba(255,255,255,.55)"
                    transform={`rotate(${a})`}
                  />
                ))}
              </g>
            </g>
          ))}
        </>
      )}
    />
  </g>
);

/** The router: a small bright box with LEDs on top. */
export const Router: React.FC<{x?: number; y?: number; pulse?: number}> = ({
  x = 0,
  y = 0,
  pulse = 0,
}) => (
  <g>
    <IsoShadow x={x} y={y} w={130} d={95} />
    <IsoBox
      x={x}
      y={y}
      w={130}
      d={95}
      h={34}
      shades={{top: '#3a2410', left: ACCENT, right: '#b85a10'}}
      topFace={({w, d}) => (
        <>
          <rect x={0} y={0} width={w} height={d} fill="#2a1a0c" />
          <rect x={12} y={12} width={w - 24} height={7} rx={3.5} fill={ACCENT} />
          {Array.from({length: 5}).map((_, i) => (
            <circle
              key={i}
              cx={16 + i * 17}
              cy={d - 18}
              r={5}
              fill={i <= (Math.floor(pulse / 8) % 5) ? ACCENT : 'rgba(255,255,255,.22)'}
            />
          ))}
        </>
      )}
    />
  </g>
);

/** A floating chat window, drawn flat (it is a screen, not an object). */
export const ChatCard: React.FC<{x: number; y: number; scale?: number}> = ({
  x,
  y,
  scale = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={0} y={0} width={230} height={150} rx={10} fill="#121a2b" stroke="rgba(255,255,255,.16)" />
    <rect x={0} y={0} width={230} height={26} rx={10} fill="#1b2537" />
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={14 + i * 13} cy={13} r={4} fill={['#ff5f57', '#febc2e', '#28c840'][i]} />
    ))}
    <rect x={16} y={44} width={120} height={12} rx={6} fill="rgba(255,255,255,.2)" />
    <rect x={80} y={66} width={134} height={12} rx={6} fill={ACCENT} opacity={0.85} />
    <rect x={16} y={88} width={96} height={12} rx={6} fill="rgba(255,255,255,.2)" />
    <rect x={16} y={110} width={150} height={12} rx={6} fill="rgba(255,255,255,.12)" />
  </g>
);
