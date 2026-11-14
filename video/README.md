# Animated explainer video

A 85-second animated explainer for the `free-ai-setup` project, built with
[Remotion](https://remotion.dev) (videos as React components).

Made for LinkedIn: it autoplays **muted**, so every word is burned into the
frame as a caption. `captions/captions.srt` carries the same text for
accessibility.

## Commands

```bash
npm install
npm run studio            # preview and scrub in the browser
npm run render:square     # 1080x1080 -> out/linkedin-square.mp4
npm run render:landscape  # 1920x1080 -> out/landscape.mp4
npm run captions          # rewrite captions/captions.srt
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
| `src/scenes/` | One file per storyboard scene |
| `src/components/` | `Card`, `Caption`, `Counter`, `Terminal`, `MessageBubble` |

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
