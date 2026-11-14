---
name: video-brief
description: Turn a narration script into a scene-by-scene brief and a timed scene table for an animated Three.js explainer video. Use before writing any scene code, whenever someone wants to make, plan, storyboard or restructure an explainer, Short or Reel built with Three.js or Remotion.
---

# Video brief

Write the brief **before** any scene code. Most failed explainer videos fail
here: the visuals drift away from what the voice is saying, or every scene
re-uses the same object until the film reads as a loop.

## Steps

1. **Get the script.** If the user has one, use their words. Do not rewrite the
   narration unless asked; tighten it only for spoken rhythm, and show the diff.
2. **Fill the brief** from `templates/brief.md`. One block per scene.
3. **Show the brief and wait for approval.** Building before the brief is agreed
   is the most expensive mistake available.
4. **Write the scene table** to `src/scenes.json` from `templates/scenes.json`.
   Timings come from the recorded narration (see below), not from guesses.

## Rules for a good brief

- **One idea per scene, one hero object per scene.** If the same prop is the
  hero of two neighbouring scenes, change one of them.
- **Every scene names what moves.** "The router appears" is not enough. Say how:
  it draws in edge by edge, it rises from the floor, packets start flowing.
- **The words on screen are not the narration.** On-screen text is two to five
  words that punctuate the line. Captions, if any, are a separate layer.
- **Name the layout zone** for each object in a 9:16 frame: top third, middle,
  bottom third. Clustering everything in the centre wastes a tall frame.
- **The close is an action**, not a URL — e.g. "comment ai-local".

## Timing from narration

Record or generate the narration per scene first, then measure each clip:

```bash
npx remotion ffprobe public/vo/<id>.mp3 2>&1 | grep Duration
```

Scene length = voice delay (about 0.4 s) + clip length + a beat (about 0.5 s).
A long silence after the line reads as the video dragging; a cut on the last
syllable reads as rushed. Both have been mistaken for "lag".

## Hand-off

When the table exists, use the `threejs-scene` skill to build it, and the
`video-review` skill to check it.
