// Builds dist/: every sound as WAV and M4A, plus catalog.json with waveform peaks.
// Usage: node src/build.mjs
import { OfflineAudioContext } from 'node-web-audio-api';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createKit, n } from './kit.mjs';
import { synthRecipes, foleySynth } from './synth-recipes.mjs';
import { setRecipes } from './set-recipes.mjs';
import { seedPrompts } from './seed-prompts.mjs';
import { SR, trim, trimEvent, closeGaps, level, wav16 } from './finish.mjs';

/** @typedef {import('../types/sfx.js').SynthRecipe} SynthRecipe */
/** @typedef {import('../types/sfx.js').SeedPrompt} SeedPrompt */
/** @typedef {import('../types/sfx.js').CatalogEntry} CatalogEntry */

const DIST = 'dist';
mkdirSync(`${DIST}/sounds`, { recursive: true });

// macOS ffmpeg builds have Apple's AAC encoder, which sounds better at low
// bitrates. Other platforms use ffmpeg's own AAC encoder.
const AAC = execFileSync('ffmpeg', ['-hide_banner', '-encoders'], { encoding: 'utf8' }).includes(' aac_at ') ? 'aac_at' : 'aac';

/** @param {SynthRecipe} r @returns {Promise<Float32Array>} */
async function renderSynth(r) {
  const ctx = new OfflineAudioContext(1, SR * 4, SR);
  const seed = [...r.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 2147483647, 7);
  r.play(createKit(ctx, ctx.destination, seed), n);
  const out = await ctx.startRendering();
  return level(trim(out.getChannelData(0).slice(), { floorDb: 60, preMs: 1 }), { fadeOutMs: 5, rmsDb: -18 + (r.levelDb ?? 0) });
}

/** @param {SeedPrompt} p @returns {Float32Array} */
function finishSeed(p) {
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', `recordings/${p.id}.flac`, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
  const y = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4).slice();
  const maxS = p.maxS ?? (p.mode === 'single' ? 0.6 : 2);
  // Single hits keep one event. Gestures keep every part less than 600 ms
  // apart, so a two-stroke eraser rub stays whole, but a second take after a
  // long pause is dropped. Rhythmic sounds use their own spacing.
  let t = trimEvent(y, {
    splitMs: p.mode === 'single' ? 60 : 150,
    joinMs: p.rhythmMs ?? (p.mode === 'single' ? 60 : 600),
    tailMs: p.ring ? 300 : 120,
  });
  // Rhythmic sounds keep their gaps; everything else gets them shortened.
  if (!p.rhythmMs) t = closeGaps(t);
  // preRollS: start at most this long before the loudest moment, so a long
  // quiet build-up (a drawer sliding) does not read as silence.
  if (p.preRollS) {
    let top = 0;
    for (let i = 1; i < t.length; i++) if (Math.abs(t[i]) > Math.abs(t[top])) top = i;
    const start = Math.max(0, top - Math.floor(SR * p.preRollS));
    if (start > 0) {
      t = t.slice(start);
      const fi = Math.floor(SR * 0.02);
      for (let i = 0; i < fi; i++) t[i] *= i / fi;
    }
  }
  const capped = t.length > Math.floor(SR * maxS);
  if (capped) t = t.slice(0, Math.floor(SR * maxS));
  return level(t, { fadeOutMs: capped ? 80 : 30, rmsDb: -18 + (p.levelDb ?? 0) });
}

// 48 bars of peak level, 0 to 1, for drawing waveforms without decoding audio.
/** @param {Float32Array} y @param {number} [bars] @returns {number[]} */
function peaks(y, bars = 48) {
  const step = y.length / bars;
  let max = 0;
  /** @type {number[]} */
  const out = [];
  for (let b = 0; b < bars; b++) {
    let p = 0;
    for (let i = Math.floor(b * step); i < Math.floor((b + 1) * step); i++) p = Math.max(p, Math.abs(y[i]));
    out.push(p);
    max = Math.max(max, p);
  }
  return out.map((p) => Math.round((p / max) * 100) / 100);
}

/** @type {CatalogEntry[]} */
const catalog = [];
/** @type {Array<{ kind: 'synth', item: SynthRecipe } | { kind: 'seed', item: SeedPrompt }>} */
const all = [
  ...synthRecipes.map((item) => ({ kind: /** @type {const} */ ('synth'), item })),
  ...setRecipes.map((item) => ({ kind: /** @type {const} */ ('synth'), item })),
  ...seedPrompts.map((item) => ({ kind: /** @type {const} */ ('seed'), item })),
  ...foleySynth.map((item) => ({ kind: /** @type {const} */ ('synth'), item })),
];
for (const job of all) {
  const { item } = job;
  const y = job.kind === 'synth' ? await renderSynth(job.item) : finishSeed(job.item);
  const wav = `${DIST}/sounds/${item.id}.wav`;
  writeFileSync(wav, wav16(y));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', wav, '-c:a', AAC, '-b:a', '128k', `${DIST}/sounds/${item.id}.m4a`]);
  // Every published field is named here, so the type check can hold
  // catalog.json to the CatalogEntry format in the skill's catalog.d.ts.
  catalog.push({
    id: item.id,
    name: item.name,
    category: item.category,
    ...(job.kind === 'synth' && job.item.set ? { set: job.item.set, action: job.item.action } : {}),
    tags: item.tags,
    description: item.description,
    source: item.source,
    ...(job.kind === 'seed' ? { prompt: job.item.prompt } : {}),
    duration: Math.round((y.length / SR) * 1000) / 1000,
    peaks: peaks(y),
    files: { wav: `sounds/${item.id}.wav`, m4a: `sounds/${item.id}.m4a` },
    // Set sounds are built from shared style code, so play.toString() alone
    // would not run. They get no snippet until the site bundles the styles.
    ...(job.kind === 'synth' && !job.item.generated ? { code: job.item.play.toString() } : {}),
  });
  console.log(`${item.id.padEnd(20)} ${job.kind.padEnd(6)} ${(y.length / SR).toFixed(2)}s`);
}

writeFileSync(`${DIST}/catalog.json`, JSON.stringify(catalog, null, 1));
console.log(`\n${catalog.length} sounds`);
await import('./site.mjs');
