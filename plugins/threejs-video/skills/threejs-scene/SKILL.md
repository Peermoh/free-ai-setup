---
name: threejs-scene
description: Build animated Three.js scenes for a Remotion video — isometric camera, vertical 9:16 layout, wireframe or low-poly props, data flowing between nodes, UI panels. Use when writing or changing 3D scene code in a Remotion project, or when a 3D render flickers, crops, or looks static.
---

# Three.js scenes for Remotion

Open Remotion Studio (`npx remotion studio`) **before** changing scene code and
keep it running, so the person can watch motion and steer it. Motion cannot be
judged from a still frame; they can see it, you cannot.

## Non-negotiable rules

Read `references/remotion-3d-rules.md` before writing any 3D code. In short:

1. Wrap 3D in `<ThreeCanvas>` from `@remotion/three`, with `width` and `height`.
2. Animate **only** from `useCurrentFrame()`. Never `useFrame()` from
   `@react-three/fiber`, never a running clock, never a playing GSAP timeline —
   frames render out of order and anything time-based flickers.
3. Any `<Sequence>` inside `<ThreeCanvas>` takes `layout="none"`.

## Pick the reference you need

| Task | Read |
|---|---|
| Laying objects out in a tall frame, safe areas, where text may go | `references/layout-9x16.md` |
| Isometric camera, why things go off-screen, positioning a row | `references/isometric-camera.md` |
| Entrances, pacing, camera moves, avoiding a looped feel | `references/motion.md` |
| Labels, captions, UI panels, screenshots over 3D | `references/captions-and-ui.md` |

## Templates

- `templates/IsoScene.tsx` — a working isometric 9:16 scene: three sources
  across the top, a hub in the middle, a laptop at the bottom, packets flowing
  along bezier curves, all driven by the frame. Start here.
- `templates/scene-utils.ts` — `row()`, `ease()`, `enter()`: the small helpers
  every scene ends up needing.

Copy a template into the project and adapt it; do not import from the plugin.
