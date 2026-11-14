# Motion

## The two failure modes

1. **Slideshow** — nothing moves except a slow drift. Reads as dead.
2. **Loop** — the same object arriving the same way, scene after scene.
   Reads as repetitive even when each scene is different.

## Rules

- **Something should change about once a second**: an object arrives, a label
  pops, packets start, the camera moves.
- **No blank first frame.** Springs start at zero, so the first prop of every
  scene is invisible for a beat — a stutter at every cut. Start the first
  entrance with a negative delay so it is already part-way in at frame 0.
- **Vary entrances.** Drop, rise, slide from a side, grow, draw edge-by-edge,
  spin-in. Neighbouring scenes should not share one.
- **One persistent world beats ten re-staged ones.** If the laptop is in the
  scene at minute zero, keep it there and move the camera, rather than
  rebuilding it in every scene.
- **Camera move per scene**: push, pull or pan — and nearly still while a
  screenshot or text must be read.
- **Data flow is the story.** Routes draw first, then packets travel them. Show
  the connection being made, then used.

## Floating

Every object drifts on its own sine phase so the scene breathes:
`y = base + sin(frame / fps * 0.7 + phase) * 0.15`.
Same frequency and phase for everything looks mechanical.
