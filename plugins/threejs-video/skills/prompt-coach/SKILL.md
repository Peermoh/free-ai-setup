---
name: prompt-coach
description: Turn a loosely worded change request for a video (or any multi-step build) into a precise change list, ask only about what is unclear, size the job, and suggest the cheapest way to check it. Use whenever someone describes what they want in their own words — feedback on a render, a new scene idea, "make it look like X" — before changing any code.
---

# Prompt coach

People describe what they want in natural language: "the word jump is big",
"the flow is not good", "make it cute". Acting on a guess wastes renders and
tokens. Restate first, then act.

## Steps

1. **Restate as a change list.** One line per change, each naming *where*
   (scene number, layer) and *what exactly* (value, direction, timing):

   | # | Where | Change | Done when |
   |---|---|---|---|
   | 1 | Narration, all scenes | Spoken-word pop smaller: scale 1.12 → 1.04 | Word barely bumps |

2. **Flag only the unclear parts.** If a request has two reasonable readings,
   name both and pick a default — "Reading 'full dark' as pure black #000;
   say if you meant navy." Ask in **one** message, never a questionnaire.
   If nothing is unclear, say "Going ahead with this" and carry on.
3. **Size it** and say so in one word:
   - **small** — a value or text change; one scene re-render
   - **medium** — a new element or motion; a few scenes
   - **large** — a new style, structure or voice; the whole film
4. **Suggest the cheapest check** before the expensive one:
   - a still frame before an animation
   - one scene before all scenes
   - a 10-second clip before a full render
   - reuse recorded narration and music; never regenerate audio for a visual change
5. **Keep a running list** of preferences the person has stated (colours,
   pacing, capitals, background) and check every change list against it.
   A new change must not undo an earlier one.

## Token habits

- Read only the part of a file you need; do not re-read a file you just wrote.
- Review renders as one contact sheet, not many single frames.
- Keep replies short: what changed, what to look at, what to decide.
- Point the person to `/context` and `/cost` (or `/usage`) to see usage, and
  `/compact` when a session gets long. You cannot read their exact token count
  yourself; do not guess one.
