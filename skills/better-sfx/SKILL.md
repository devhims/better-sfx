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

Better SFX is a library of short, trimmed, loudness-matched sound effects. Every sound is free for personal and commercial use with no credit required. The sounds ship inside something the user made, never on their own as a sound pack. The license also prohibits registering the sounds, or work made mainly of them, with Content ID or other rights-management systems.

`scripts/sfx.mjs` searches the catalog and downloads files. The commands below run from this skill's folder and print JSON to stdout. Pass an **absolute project path** to `--dir`, since relative paths resolve from the shell's working directory, not the user's project. Alternatively, stay in the project and invoke the script by its absolute path.

## Steps

1. **Name each moment.** For every sound needed, write one line: the moment it plays (button press, modal open, a cut at 0:12), the feeling in the user's own words (soft, glassy, retro), and the medium (app code or video edit). Done when every sound has its line.
2. **Search.** Run `node scripts/sfx.mjs search <feeling> <moment>`, for example `search soft glassy success`. When an app needs three or more UI sounds, run `node scripts/sfx.mjs sets` and prefer one set (glass, wood, soft, retro or mechanical), unless the user requests a mix. If they want to choose, show two or three candidates with their `page` links and wait for a pick. Otherwise choose the closest fit and continue. Search matches words in each sound's name, tags and description, and translates about 60 common feeling words ("dreamy", "punchy", "cozy", "premium") into the catalog's own words; the output lists those under `expanded`. A word it knows neither way ("nautical") can return `"count": 0`. When it does, run `node scripts/sfx.mjs categories`, pick the category that fits the moment, list it with `node scripts/sfx.mjs search --category <category> --limit 50`, and choose by reading the descriptions. Done when each moment has a chosen id.
3. **Download.** Run `node scripts/sfx.mjs get <id...> --dir /absolute/path/to/project/public/sounds`. Use the project's static folder (`public/sounds` in Next.js, Vite and most web apps) and the default M4A for web code. Use `--format wav` for video edits and game engines. Done when every chosen file is on disk at the printed path.
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

The output has `"ok": false` and an `error`. `network: true` means a remote request failed, which can be a sandbox restriction, timeout or server error. If the environment blocks network access, retry once with its network permission. If it still fails, report the error and link to [the library](https://sfx.video2ctx.dev) for a manual download. `--catalog <path-or-url>` points the script at another copy of `catalog.json`.
