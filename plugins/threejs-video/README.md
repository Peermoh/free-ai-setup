# threejs-video

A Claude Code plugin for making animated Three.js explainer videos with
Remotion — vertical 9:16 Shorts and Reels in particular.

## What is in it

| Piece | Kind | What it does |
|---|---|---|
| `video-brief` | skill | Script → scene-by-scene brief → timed scene table. Use first. |
| `threejs-scene` | skill | Rules and templates for Three.js inside Remotion: `ThreeCanvas`, frame-driven animation, isometric camera, 9:16 layout, labels and panels. |
| `video-review` | skill | Render frame strips per scene and check them against hard rules. |
| `storyboarder` | agent | Runs the brief step on its own. |
| `frame-reviewer` | agent | Runs the review step on its own and reports faults. |

## Install

From any project:

```bash
claude plugin marketplace add Peermoh/free-ai-setup
claude plugin install threejs-video@free-ai-setup
```

Or enable it for everyone working in a project, in `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "free-ai-setup": {"source": {"source": "github", "repo": "Peermoh/free-ai-setup"}}
  },
  "enabledPlugins": {"threejs-video@free-ai-setup": true}
}
```

Pairs well with Remotion's own plugin (`remotion@remotion`).

## Workflow

1. `video-brief` (or the `storyboarder` agent) — agree the scenes before code.
2. Open Remotion Studio and keep it open.
3. `threejs-scene` — start from `templates/IsoScene.tsx`.
4. `video-review` (or the `frame-reviewer` agent) — before sending a render.
5. Watch it in Studio. Neither agent can judge whether motion feels right.

## Dependencies in the video project

```bash
npx remotion add @remotion/three
npm i @react-three/fiber three
```
