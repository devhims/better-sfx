---
name: better-sfx
description: Sound effects for apps, websites, games and videos from Better SFX, a free library by video2ctx. Use when the user wants to add, find or swap a sound effect, including UI sounds (click, hover, toggle, notification, message, success, error), a matching sound set for a whole app, or SFX for a video edit (whoosh, transition, typing, pop, paper and object foley). Also use when they ask to make an interaction feel more satisfying with sound, even if they never name Better SFX.
license: MIT for the skill (see LICENSE). Downloaded sounds use the Better SFX License, https://sfx.video2ctx.dev/license/
compatibility: Node.js 18+ and network access to sfx.video2ctx.dev.
metadata:
  author: video2ctx
  version: '1.0.0'
---

# Better SFX

Better SFX is a library of short, trimmed, loudness-matched sound effects. Every sound is free for personal and commercial use with no credit required. The one rule: the sounds ship inside something the user made, never on their own as a sound pack.

`scripts/sfx.mjs` searches the catalog and downloads files. Run it from this skill's folder; it prints JSON to stdout.

## Steps

1. **Name each moment.** For every sound needed, write one line: the moment it plays (button press, modal open, a cut at 0:12), the feeling in the user's own words (soft, glassy, retro), and the medium (app code or video edit). Done when every sound has its line.
2. **Search.** Run `node scripts/sfx.mjs search <feeling> <moment>`, for example `search soft glassy success`. When an app needs three or more UI sounds, run `node scripts/sfx.mjs sets` and take every sound from one set (glass, wood, soft, retro or mechanical), so they share one voice. Done when each moment has a chosen id. When the choice is a matter of taste, show the user two or three candidates with their `page` links so they can listen, and wait for a pick.
3. **Download.** Run `node scripts/sfx.mjs get <id...> --dir <folder>`. Use the project's static folder (`public/sounds` in Next.js, Vite and most web apps) and the default M4A for web code. Use `--format wav` for video edits and game engines. Done when every chosen file is on disk at the printed path.
4. **Wire up.** For web and app code, read [references/web.md](references/web.md). For a video edit, read [references/video.md](references/video.md). For a game engine or native app, import the WAV the way the project already loads audio. Done when each moment plays its sound.
5. **Report.** List each sound with the moment it plays, its file path and its page link, then state the license once in one line.

## Script reference

| Command             | Use                                                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `search <words...>` | Ranked matches. Filters: `--category`, `--set`, `--source code\|recording`, `--max-duration <s>`, `--limit <n>` (default 8) |
| `sets`              | The five matching sets and the id for each action                                                                           |
| `categories`        | Every category with its count                                                                                               |
| `get <id...>`       | Downloads into `--dir` (default `sounds`). `--format m4a\|wav\|both`, `--force` replaces existing files                     |

Each result carries `id`, `name`, `category`, `duration` in seconds, `description`, `tags`, `page`, `wav` and `m4a`. Set sounds also carry `set` and `action`; their ids read `<set>-<action>`, such as `wood-success`.

## When a command fails

The output has `"ok": false` and an `error`. A `network: true` error usually means the sandbox blocked the request: retry the same command once with the environment's network permission. If it still fails, tell the user that sfx.video2ctx.dev was unreachable and link them to [the library](https://sfx.video2ctx.dev) to download by hand. `--catalog <path-or-url>` points the script at another copy of `catalog.json`.
