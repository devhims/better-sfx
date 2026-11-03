---
name: better-sfx
description: Sound effects for apps, websites, games and videos from Better SFX, a free library by video2ctx. Use when the user wants to add, find or swap a sound effect, including UI sounds (click, hover, toggle, notification, message, success, error), a matching sound set for a whole app, or SFX for a video edit (whoosh, transition, typing, pop, paper and object foley). Also use when they ask to make an interaction feel more satisfying with sound, even if they never name Better SFX.
license: MIT for the skill (see LICENSE). Downloaded sounds use the Better SFX License, https://sfx.video2ctx.dev/license/
metadata:
  author: video2ctx
  version: '1.1.0'
---

# Better SFX

Start with the event the listener should recognize. If no category plausibly covers it, stop at the index and report that Better SFX has no known match.

Open the most relevant guide. Among sounds that fit the event, choose by mood and duration. If none fits, check another guide only if its category also covers the event. Otherwise report the missing sound and stop before downloading. For several UI cues in one app, start with one matching set.

## Categories

| Moment | Guide |
| --- | --- |
| Press a button, hover, focus, or select | [Clicks](references/categories/clicks.md) |
| Flip a switch, check a box, drag a stepped slider, or lock | [Toggles](references/categories/toggles.md) |
| Draw attention to a reminder or alert | [Notifications](references/categories/notifications.md) |
| Confirm a payment, reward, or completed task | [Success](references/categories/success.md) |
| Reject input, warn, or signal failure | [Errors](references/categories/errors.md) |
| Open or dismiss a panel, swipe, zoom, or cut between shots | [Transitions](references/categories/transitions.md) |
| Add a bubble, pop, or like reaction | [Pops](references/categories/pops.md) |
| Send or receive a chat message | [Messages](references/categories/messages.md) |
| Mark progress, processing, a countdown, or a timer | [Progress](references/categories/progress.md) |
| Power up, connect a device, or cue an AI action | [System](references/categories/system.md) |
| Type or handle desk tools | [Keyboard and desk](references/categories/keyboard.md) |
| Turn a page, tear paper, or open an envelope | [Paper](references/categories/paper.md) |
| Door knocks, cameras, light switches, glass and mug taps, coins, cash registers, keys, zippers, bubble wrap, corks, and water drops | [Object foley](references/categories/objects.md) |
| Cut, archive, pin, draw, attach, file, or delete | [App actions](references/categories/app-actions.md) |

**Matching sets.** Choose one voice for a family of UI cues: [bright, airy glass](references/categories/glass-set.md), [warm, dry wood](references/categories/wood-set.md), [soft, gentle tones](references/categories/soft-set.md), [retro 8-bit tones](references/categories/retro-set.md), or [metallic, mechanical sounds](references/categories/mechanical-set.md).

## Use the chosen sound

1. If the user wants to choose, offer two or three candidates with preview links of the form `https://sfx.video2ctx.dev/sound/<id>/` and wait for their pick. Otherwise proceed with the closest fit.
2. Downloads use Node.js 18+ and network access to `sfx.video2ctx.dev`. From the skill folder, run `node scripts/sfx.mjs get <id...> --dir /absolute/path/to/project/sounds`. Use the project's static asset directory for web audio. M4A is the default. Add `--format wav` for video or game engines. For a local catalog, pass `--catalog /absolute/path/to/catalog.json`.
3. If the user asked only for files, go straight to reporting the download. To wire up web playback, read [web integration](references/web.md). To place cues in a video, read [video integration](references/video.md). In a native app or game, use the project's existing audio loader.
4. Report the cue, file path, and preview link for each sound. Include the [sound license](https://sfx.video2ctx.dev/license/) once. Personal and commercial projects may include the sounds without attribution. Standalone redistribution is prohibited. The sounds and works made mainly from them cannot be registered with Content ID or other rights-management systems.

If the download reports `network: true` and the environment restricts network access, retry once with network permission. If it still fails, report the error and offer the chosen preview page for manual download.
