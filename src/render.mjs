// Renders synth recipes to WAV with node-web-audio-api.
// Usage: node src/render.mjs [outDir] [id ...]   (no ids = all recipes)
import { OfflineAudioContext } from 'node-web-audio-api';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createKit, n } from './kit.mjs';
import { synthRecipes } from './synth-recipes.mjs';
import { SR, trim, level, wav16 } from './finish.mjs';

const [outDir = 'out/synth', ...ids] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });

const list = ids.length ? synthRecipes.filter((r) => ids.includes(r.id)) : synthRecipes;
for (const r of list) {
  const ctx = new OfflineAudioContext(1, SR * 4, SR);
  const seed = [...r.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 2147483647, 7);
  r.play(createKit(ctx, ctx.destination, seed), n);
  const out = await ctx.startRendering();
  const y = level(trim(out.getChannelData(0).slice(), { floorDb: 60, preMs: 1 }), { fadeOutMs: 5 });
  writeFileSync(join(outDir, `${r.id}.wav`), wav16(y));
  console.log(`${r.id}\t${(y.length / SR).toFixed(2)}s`);
}
