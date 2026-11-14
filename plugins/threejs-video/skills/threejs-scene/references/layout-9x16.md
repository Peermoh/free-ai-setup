# Layout for 9:16

A 1080×1920 frame is tall and narrow. Use the height; respect the edges.

## Zones

| Zone | Use |
|---|---|
| Top band (~0–10%) | Small source mark, progress. Platforms overlay the very top |
| Top third | Sources / inputs |
| Middle | The hub, the subject of the scene |
| Bottom third | Output / the user's device |
| Bottom band (~82–100%) | Platform UI sits here on Shorts and Reels — no essential text |

Do not cluster everything in the centre. A vertical stack (inputs → hub →
output) reads naturally in a tall frame and lets data flow downward.

## Two layers, positioned differently

- **Artwork and labels that point at artwork** live in the scene's coordinate
  space and move with the camera.
- **Chrome** — source mark, progress bar, captions, end card — belongs to the
  *frame*, not the scene. Position it against the real frame edges.

Mixing them is how a caption ends up floating mid-frame in portrait, or how
labels are pushed off-screen when the artwork is zoomed.

## Width is the constraint

The visible width in world units is `frustumHeight × (1080 / 1920) / zoom`.
At the zoom where an object appears, its projected width *plus its label* must
fit inside that. Check the widest moment, not the average one.
