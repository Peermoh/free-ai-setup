# Isometric camera

An orthographic camera on the `(1, 1, 1)` diagonal, looking at the origin.

## The projection — learn this, it explains every "off-screen" bug

For a camera at `(d, d, d)`:

- **screen-x ∝ (x − z) × 0.866**
- moving `x` and `z` *together* does not move an object sideways at all
- world `y` maps to screen up

So `x = 7, z = −7` is not "7 units out": it projects to about **12 units**
sideways, which can be wider than the whole 9:16 frame.

## A flat row across the frame

Place items at `(t, y, −t)`. On screen the gap between neighbours is
`2 × t × 0.866`. Use `row(t, y)` from `templates/scene-utils.ts`.

Horizontally centred means `x = z`. A panel at `z = 6` is not centred — it is
shoved left.

## Checklist before rendering

- Widest row: `2 × max|t| × 0.866 + objectWidth` ≤ visible width at that zoom
- Labels: same check, with the label's width
- Anything billboarded (labels, panels): copy `camera.quaternion` every frame
- Objects that have not "arrived" yet: hide them (`visible={false}`), do not
  scale them to `0.001` — a near-zero scale still renders a visible sliver
