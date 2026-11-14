---
name: video-review
description: Check an animated Remotion video for layout and timing faults by rendering strips of frames per scene and testing them against hard rules. Use after building or changing scenes and before sending a render to anyone — for cropping, overlapping labels, unreadable text, blank frames at cuts, or a scene that has stopped moving.
---

# Video review

A single still per scene hides most faults: it is taken from the middle,
where things look settled. Faults live at the **edges of scenes** and in
**motion**. Review strips, not stills.

## 1. Make the strips

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/video-review/scripts/frame-strip.mjs \
  --comp <CompositionId> --scenes src/scenes.json --out out/review
```

For every scene this renders the first frame, the last frame and evenly spaced
frames between, and writes one contact sheet per scene plus `out/review/index.png`.

## 2. Check the hard rules

For each scene, against its strip:

- [ ] **Not blank at the cut.** The first frame shows the scene's hero, not an
      empty stage.
- [ ] **Inside the frame.** No object, label or panel is cut off at an edge.
- [ ] **Clear of the platform bands.** Nothing essential in the top ~10% or the
      bottom ~18% of a 9:16 frame.
- [ ] **No collisions.** Labels do not overlap each other or the object they
      name; panels do not sit on top of what they describe.
- [ ] **Readable on a phone.** Body text at least ~40 px tall in a 1080-wide
      frame; panels meant to be read fill most of the width.
- [ ] **It moves.** Consecutive frames in the strip differ. Three identical
      frames in a row is a dead stretch.
- [ ] **Not a loop.** The hero and its entrance differ from the scene before.
- [ ] **Text matches voice.** The on-screen words belong to this scene's line.

## 3. Report

List failures by scene and rule, with the frame number. Fix, re-run the strip
for the affected scene only, and confirm.

## What this cannot check

Whether the motion *feels* right — easing, rhythm, whether a camera move is
too fast. Only someone watching in Remotion Studio can judge that. Say so, and
ask them to watch the scene rather than claiming it is good.
