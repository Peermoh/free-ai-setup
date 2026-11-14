# Animated explainer video

A 46-second animated explainer for the `free-ai-setup` project, built with
[Remotion](https://remotion.dev) (videos as React components).

Made for LinkedIn: it autoplays **muted**, so every word is burned into the
frame as a caption. `captions/captions.srt` carries the same text for
accessibility.

## Commands

```bash
npm install
npm run studio            # preview and scrub in the browser
npm run render            # 1080x1920 portrait -> out/portrait.mp4
npm run captions          # rewrite captions/captions.srt
npm run voiceover         # regenerate public/vo/*.mp3 from the scene table
```

On a machine without Chrome on the PATH, add
`--browser-executable=/path/to/chromium` to a render command.

## Where things live

| Path | What |
| --- | --- |
| `src/scenes.json` | The storyboard: scene id, start, duration, caption. **Single source of truth** — the burned-in captions and the `.srt` both come from here |
| `src/config.ts` | Colours, font, repo URL, author name, provider and tier tables |
| `src/Root.tsx` | Registers the `LinkedInSquare` and `Landscape` compositions |
| `src/Video.tsx` | Puts the scenes in sequence and draws each caption |
| `src/scenes/film.tsx` | All ten scenes |
| `src/design/world.tsx` | The 3D world: perspective projection, nodes, links, floor, atmosphere |
| `src/design/type.tsx` | Type treatments: outline, fill, marked, underlined, frames, rulers, tags |
| `src/shots.ts` | Each screenshot's crop, and whether it needs the light-theme fix |
| `src/components/Shot.tsx` | Crops, frames and (where needed) inverts a screenshot |
| `src/preview/` | Theme studies. Not part of the film |

To change wording or timing, edit `src/scenes.json` and re-run the renders and
`npm run captions`. Nothing else needs touching.

## Rules this video follows

- **No company logos.** Provider names are plain text on plain cards.
- **No "unlimited" or "free forever".** Free tiers have limits and change.
- **Nothing private goes to the cloud** — the privacy scene says so explicitly.
- **No real keys, tokens, IP addresses or tunnel addresses** anywhere.
- The provider tiers in the scripts scene are the **real labels** printed by
  `scripts/add-provider.ps1` (`FREE`, `FREE TRIAL`, `FREE + PAID`, `CHECK`),
  not a simplified set.
- Every number shown was measured on the owner's own setup.
- Screenshots are real captures of the running setup. Provider logos appear
  only where they are genuinely part of a captured screen; none are drawn.
- Light-theme captures are inverted into the palette rather than pasted in as
  white panels. The flag lives per screenshot in `src/shots.ts`.
- The camera drifts constantly, and nearly stops on any scene carrying a
  screenshot, because text that moves cannot be read at phone size.
