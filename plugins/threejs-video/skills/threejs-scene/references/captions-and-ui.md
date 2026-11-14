# Captions, labels and panels

## On-screen text

Two to five words, landing on the stressed beat of the narration line. It
punctuates the voice; it does not transcribe it.

If full captions are wanted, chunk them by meaning: break after punctuation,
four to six words per chunk, and never leave a one- or two-word orphan at the
end. A fixed "every five words" split produces fragments like "you" or
"things." that say nothing.

Captions must never render an empty box before their first word lands.

## Labels on 3D objects

Canvas textures on planes that copy `camera.quaternion` every frame.
Render them with `depthTest: false` and a high `renderOrder` — they are UI, so
the artwork must never occlude them.

Wait for fonts (`document.fonts.ready`) before drawing a canvas texture, or the
fallback typeface is baked in.

## UI panels / terminals

A panel that must be read on a phone should fill most of the frame width at
the zoom it appears at. Check the text fits its own canvas — a long line is
silently clipped at the canvas edge.

## Real screenshots

Light-theme screenshots in a dark film are a flash-bang. Invert and rotate the
hue: `filter: invert(1) hue-rotate(180deg) brightness(0.92) contrast(1.08)`.
A plain `invert(1)` turns red text cyan.

Crop tight in code (keep crop numbers as data), never the whole desktop.
Check every screenshot for keys, tokens, tunnel addresses, emails and window
titles before it goes in.
