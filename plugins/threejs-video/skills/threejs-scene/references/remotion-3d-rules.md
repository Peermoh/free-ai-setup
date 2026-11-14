# Remotion 3D rules

These come from Remotion's own 3D guidance and are not optional.

## Setup

```bash
npx remotion add @remotion/three
npm i @react-three/fiber three
```

Keep `@remotion/three` on the same version as `remotion`.

## ThreeCanvas

```tsx
import {ThreeCanvas} from '@remotion/three';
const {width, height} = useVideoConfig();

<ThreeCanvas width={width} height={height} orthographic camera={{zoom: 40, position: [20, 20, 20]}}>
  <ambientLight intensity={0.6} />
  <directionalLight position={[8, 16, 10]} intensity={1.2} />
  {/* scene */}
</ThreeCanvas>
```

## Colour

React Three Fiber applies ACES filmic tone mapping by default. It turns pure
white grey and mutes saturated accents — wireframes come out dim. For a crisp
schematic or flat-colour look, pass `flat` to `<ThreeCanvas>`. Keep tone
mapping only for lit, realistic materials.

## Line width

WebGL draws lines one pixel wide whatever `linewidth` says, so
`lineBasicMaterial` wireframes stay thin. For thick or glowing edges use
`<Line>` from `@react-three/drei` (screen-space lines), or add bloom.

## Animation

```tsx
const frame = useCurrentFrame();
<mesh rotation={[0, frame * 0.02, 0]} />
```

Forbidden, because each causes flicker or a non-deterministic render:
- `useFrame()` from `@react-three/fiber`
- `Date.now()`, `performance.now()`, `requestAnimationFrame`
- a GSAP timeline that is *played*. GSAP is only safe if the timeline is
  created paused and seeked with `tl.time(frame / fps)` every frame — and at
  that point plain `interpolate()` is simpler.
- shaders, animated textures or models that advance on their own

## Camera

Change the camera from frame-driven code using `useThree()`:

```tsx
const camera = useThree((s) => s.camera);
useLayoutEffect(() => {
  camera.position.set(...);
  camera.lookAt(0, targetY, 0);
  camera.zoom = zoom;
  camera.updateProjectionMatrix();
}, [camera, frame]);
```

## Post-processing

Bloom (`@react-three/postprocessing`) is allowed but is the single biggest
render-time cost. Add it last, and only if the look needs it.
