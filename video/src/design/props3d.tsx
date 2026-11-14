import React from 'react';
import {useCurrentFrame} from 'remotion';

/**
 * Flat-shaded 3D props, built from CSS boxes.
 *
 * The look: simple objects standing on a floor, lit from above-left, each
 * face a flat tone — no textures, no reflections. That is what makes a
 * CSS-3D version read as deliberate illustration rather than as a failed
 * attempt at a render.
 *
 * Authored in the 1080 design square.
 */

export const INK = '#eef2fb';
export const ACCENT = '#ff7a1a';
export const BG0 = '#070c16';
export const BG1 = '#0c1626';

/** Face tones for a light-grey object lit from the upper left. */
const TOP = '#dfe6f2';
const FRONT = '#b9c4d6';
const SIDE = '#8e9aae';
const DARK = '#5d687c';

type BoxProps = {
  w: number;
  h: number;
  d: number;
  /** Colour of the face that points at the camera. */
  front?: string;
  top?: string;
  side?: string;
  /** Content drawn on the front face. */
  face?: React.ReactNode;
};

/** One cuboid, shown three-quarters on. */
export const Box3D: React.FC<BoxProps> = ({
  w,
  h,
  d,
  front = FRONT,
  top = TOP,
  side = SIDE,
  face,
}) => (
  <div style={{position: 'relative', width: w, height: h, transformStyle: 'preserve-3d'}}>
    {/* front */}
    <div
      style={{
        position: 'absolute',
        width: w,
        height: h,
        background: front,
        transform: `translateZ(${d / 2}px)`,
        overflow: 'hidden',
      }}
    >
      {face}
    </div>
    {/* right side */}
    <div
      style={{
        position: 'absolute',
        width: d,
        height: h,
        left: w,
        background: side,
        transformOrigin: 'left center',
        transform: `rotateY(90deg) translateX(${-d / 2}px)`,
      }}
    />
    {/* top */}
    <div
      style={{
        position: 'absolute',
        width: w,
        height: d,
        top: 0,
        background: top,
        transformOrigin: 'center top',
        transform: `rotateX(-90deg) translateZ(${-d / 2}px)`,
      }}
    />
  </div>
);

/** Soft ellipse on the floor, so an object looks planted. */
export const Shadow: React.FC<{w: number; opacity?: number}> = ({w, opacity = 0.5}) => (
  <div
    style={{
      position: 'absolute',
      left: '50%',
      bottom: -14,
      width: w,
      height: w * 0.22,
      marginLeft: -w / 2,
      borderRadius: '50%',
      background: `radial-gradient(closest-side, rgba(0,0,0,${opacity}) 0%, transparent 72%)`,
      filter: 'blur(2px)',
    }}
  />
);

/**
 * Places a prop in the scene: three-quarter rotation, scaled for depth,
 * with its shadow.
 */
export const Prop: React.FC<{
  x: number;
  y: number;
  scale?: number;
  spin?: number;
  tilt?: number;
  shadow?: number;
  children: React.ReactNode;
}> = ({x, y, scale = 1, spin = -28, tilt = 8, shadow, children}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `scale(${scale})`,
      transformStyle: 'preserve-3d',
    }}
  >
    {shadow ? <Shadow w={shadow} /> : null}
    <div style={{transformStyle: 'preserve-3d', transform: `rotateX(${tilt}deg) rotateY(${spin}deg)`}}>
      {children}
    </div>
  </div>
);

/* ------------------------------------------------------------- the props */

/** A laptop: wedge base plus a screen tilted back. */
export const Laptop: React.FC<{accent?: boolean; screen?: React.ReactNode}> = ({
  accent,
  screen,
}) => (
  <div style={{transformStyle: 'preserve-3d'}}>
    <div
      style={{
        transformStyle: 'preserve-3d',
        transform: 'rotateX(-72deg) translateY(-6px)',
        transformOrigin: 'center bottom',
      }}
    >
      <Box3D
        w={260}
        h={170}
        d={10}
        front={accent ? '#1b2436' : '#243049'}
        top={TOP}
        side={SIDE}
        face={
          <div style={{position: 'absolute', inset: 10, background: '#0a1020', overflow: 'hidden'}}>
            {screen}
          </div>
        }
      />
    </div>
    <Box3D w={260} h={14} d={170} front={FRONT} top={TOP} side={SIDE} />
  </div>
);

/** A server rack: tall cabinet with a lit front strip and vent lines. */
export const Rack: React.FC<{label?: string; lit?: boolean}> = ({label, lit}) => (
  <Box3D
    w={110}
    h={250}
    d={70}
    front="#1a2334"
    top="#2b3850"
    side="#141b29"
    face={
      <>
        <div
          style={{
            height: 56,
            background: lit ? ACCENT : '#39465f',
            margin: 6,
            borderRadius: 3,
          }}
        />
        {Array.from({length: 7}).map((_, i) => (
          <div
            key={i}
            style={{
              height: 10,
              margin: '6px 8px',
              borderRadius: 2,
              background: 'rgba(255,255,255,.10)',
              borderLeft: `3px solid ${lit ? ACCENT : '#4a5873'}`,
            }}
          />
        ))}
        {label ? (
          <div
            style={{
              position: 'absolute',
              bottom: 6,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontFamily: 'ui-monospace, monospace',
              fontSize: 11,
              color: 'rgba(255,255,255,.6)',
            }}
          >
            {label}
          </div>
        ) : null}
      </>
    }
  />
);

/** A GPU card: long board with two fans. */
export const GpuCard: React.FC<{spinFrame?: number}> = ({spinFrame = 0}) => (
  <Box3D
    w={300}
    h={110}
    d={34}
    front="#18202f"
    top="#2a3448"
    side="#10161f"
    face={
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 16, padding: 14}}>
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              border: `3px solid ${ACCENT}`,
              position: 'relative',
              transform: `rotate(${spinFrame * (i ? -6 : 6)}deg)`,
            }}
          >
            {[0, 60, 120].map((a) => (
              <div
                key={a}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 2,
                  height: 30,
                  marginLeft: -1,
                  marginTop: -30,
                  background: 'rgba(255,255,255,.55)',
                  transformOrigin: 'bottom center',
                  transform: `rotate(${a}deg)`,
                }}
              />
            ))}
          </div>
        ))}
        <div style={{flex: 1, height: 52, borderRadius: 4, background: 'rgba(255,255,255,.08)'}} />
      </div>
    }
  />
);

/** The router: a small bright box with LEDs. */
export const RouterBox: React.FC = () => (
  <Box3D
    w={190}
    h={74}
    d={120}
    front="#2a1708"
    top="#4a2c10"
    side="#1d1006"
    face={
      <div style={{position: 'absolute', inset: 0, padding: 14}}>
        <div style={{height: 8, background: ACCENT, borderRadius: 4, width: '70%'}} />
        <div style={{display: 'flex', gap: 7, marginTop: 14}}>
          {Array.from({length: 6}).map((_, i) => (
            <div
              key={i}
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: i < 4 ? ACCENT : 'rgba(255,255,255,.25)',
              }}
            />
          ))}
        </div>
      </div>
    }
  />
);

/** A floating chat window. */
export const ChatPanel: React.FC = () => (
  <div
    style={{
      width: 300,
      borderRadius: 12,
      background: '#121a2b',
      border: '1.5px solid rgba(255,255,255,.14)',
      boxShadow: '0 30px 60px rgba(0,0,0,.55)',
      overflow: 'hidden',
    }}
  >
    <div style={{height: 26, background: '#1b2537', display: 'flex', alignItems: 'center', gap: 5, padding: '0 10px'}}>
      {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
        <div key={c} style={{width: 7, height: 7, borderRadius: 999, background: c}} />
      ))}
    </div>
    <div style={{padding: 14, display: 'flex', flexDirection: 'column', gap: 9}}>
      <div style={{height: 13, width: '62%', borderRadius: 7, background: 'rgba(255,255,255,.18)'}} />
      <div style={{height: 13, width: '85%', borderRadius: 7, background: ACCENT, opacity: 0.85, alignSelf: 'flex-end'}} />
      <div style={{height: 13, width: '48%', borderRadius: 7, background: 'rgba(255,255,255,.18)'}} />
      <div style={{height: 13, width: '72%', borderRadius: 7, background: 'rgba(255,255,255,.12)'}} />
    </div>
  </div>
);

/** The room the props stand in: blue-black, with a receding floor. */
export const Room: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: BG0}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(72% 52% at 50% 22%, ${BG1} 0%, ${BG0} 72%)`,
        }}
      />
      {/* floor */}
      <div style={{position: 'absolute', inset: 0, perspective: 900}}>
        <div
          style={{
            position: 'absolute',
            left: '-50%',
            right: '-50%',
            top: '62%',
            height: '80%',
            transform: 'rotateX(78deg)',
            transformOrigin: 'top center',
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(150,180,230,.16) 0 1.2px, transparent 1.2px 90px),' +
              'repeating-linear-gradient(90deg, rgba(150,180,230,.12) 0 1.2px, transparent 1.2px 90px)',
            backgroundPosition: `0 ${(frame * 0.5) % 90}px`,
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,.85) 0%, transparent 52%)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,.85) 0%, transparent 52%)',
          }}
        />
      </div>
      <div style={{position: 'absolute', inset: 0, perspective: 1500}}>{children}</div>
    </div>
  );
};
