# Better SFX

Free sound effects for apps, videos and AI agents. By [video2ctx](https://www.video2ctx.dev).

**[sfx.video2ctx.dev](https://sfx.video2ctx.dev)** has 161 short sounds: clicks, toggles, notifications, success and error cues, whooshes and transitions, keyboard, paper and object foley, and five matching UI sound sets. Every sound starts right on its first moment, is matched in loudness to the rest, and comes as a WAV (48 kHz, 16-bit mono) and an M4A.

## Use it from your agent

Install the Better SFX skill in Claude Code, Codex or any agent that supports skills:

```bash
npx skills add devhims/better-sfx
```

With it, your agent can search the library by what a sound should feel like, download the right files into your project and wire them up in code or a video edit. Try "add a soft, glassy success sound to the checkout button".

Agents without the skill can read [catalog.json](https://sfx.video2ctx.dev/catalog.json) or [llms.txt](https://sfx.video2ctx.dev/llms.txt).

## License

The sounds are free for personal and commercial use, with no credit required. You cannot resell or redistribute them on their own, as a sound pack or on another sound-effects site, and nobody may register them with YouTube Content ID. The full terms are in [LICENSE-SOUNDS.txt](LICENSE-SOUNDS.txt) and on [the license page](https://sfx.video2ctx.dev/license/).

The code in `src/` and `skills/` is under the [MIT License](LICENSE).

## How the sounds are made

- **121 sounds are made in code** with the Web Audio API. Each is a short recipe in [`src/synth-recipes.mjs`](src/synth-recipes.mjs) or [`src/set-recipes.mjs`](src/set-recipes.mjs), drawn with the toolkit in [`src/kit.mjs`](src/kit.mjs).
- **40 sounds are recordings** generated with Higgsfield Seed Audio 1.0 from the prompts in [`src/seed-prompts.mjs`](src/seed-prompts.mjs). The takes the build uses are in [`recordings/`](recordings/).

[`src/finish.mjs`](src/finish.mjs) cleans every sound the same way: it keeps the main event, drops faint lead-ins and stray second takes, shortens silent gaps, fades the ends and matches loudness.

## Build

Requires Node.js 22+ and ffmpeg.

```bash
npm install
npm run build    # renders every sound, writes dist/ and the website
npm run dev      # regenerates the site and serves it at http://127.0.0.1:4321
npm run check    # type check
npm run audit    # lead-in, tail and silent gaps for each recording
```

`dist/` is the website and is committed, so it can be deployed as static files without running the build.

New recordings need the [Higgsfield CLI](https://higgsfield.ai) and credits. `npm run generate` creates a take for every prompt without one, and `npm run generate -- <id>` makes a new take of one sound.

## Project layout

| Path | What it holds |
|---|---|
| `src/kit.mjs` | Web Audio toolkit: tones, filtered noise, struck materials, FM and reverb |
| `src/synth-recipes.mjs` | Standalone sounds made in code |
| `src/set-recipes.mjs` | The five matching sets: one style each, the same ten actions |
| `src/seed-prompts.mjs` | Seed Audio prompts and per-sound cleanup settings |
| `src/finish.mjs` | Trimming, gap closing, fades and loudness |
| `src/build.mjs` | Renders everything into `dist/` |
| `src/site.mjs` | Generates the website, sitemap, robots.txt and llms.txt |
| `src/license.mjs` | The sound license text, used by the site and LICENSE-SOUNDS.txt |
| `recordings/` | The Seed Audio takes the build uses, as lossless FLAC |
| `skills/better-sfx/` | The agent skill |
| `types/` | Shared types for the type check |

The download icon is [Phosphor](https://phosphoricons.com) DownloadSimple, MIT licensed.
