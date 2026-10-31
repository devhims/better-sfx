// Builds dist/: every sound as WAV and M4A, plus catalog.json with waveform peaks.
// Usage: node src/build.mjs
import { OfflineAudioContext } from 'node-web-audio-api';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createKit, n } from './kit.mjs';
import { synthRecipes } from './synth-recipes.mjs';
import { seedPrompts } from './seed-prompts.mjs';
import { SR, trim, level, wav16 } from './finish.mjs';

const DIST = 'dist';
mkdirSync(`${DIST}/sounds`, { recursive: true });

async function renderSynth(r) {
  const ctx = new OfflineAudioContext(1, SR * 4, SR);
  const seed = [...r.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 2147483647, 7);
  r.play(createKit(ctx, ctx.destination, seed), n);
  const out = await ctx.startRendering();
  return level(trim(out.getChannelData(0).slice(), { floorDb: 60, preMs: 1 }), { fadeOutMs: 5 });
}

function finishSeed(p) {
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', `out/seed-raw/${p.id}.wav`, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
  const y = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4).slice();
  const maxS = p.maxS ?? (p.mode === 'single' ? 0.6 : 2);
  const t = trim(y, { mode: p.mode === 'all' ? 'gesture' : p.mode, maxS });
  const capped = t.length >= Math.floor(SR * maxS) - 1;
  return level(t, { fadeOutMs: capped ? 80 : p.mode === 'single' ? 15 : 25 });
}

// 48 bars of peak level, 0 to 1, for drawing waveforms without decoding audio.
function peaks(y, bars = 48) {
  const step = y.length / bars;
  let max = 0;
  const out = [];
  for (let b = 0; b < bars; b++) {
    let p = 0;
    for (let i = Math.floor(b * step); i < Math.floor((b + 1) * step); i++) p = Math.max(p, Math.abs(y[i]));
    out.push(p);
    max = Math.max(max, p);
  }
  return out.map((p) => Math.round((p / max) * 100) / 100);
}

const catalog = [];
const all = [...synthRecipes.map((r) => ['synth', r]), ...seedPrompts.map((p) => ['seed', p])];
for (const [kind, item] of all) {
  const y = kind === 'synth' ? await renderSynth(item) : finishSeed(item);
  const wav = `${DIST}/sounds/${item.id}.wav`;
  writeFileSync(wav, wav16(y));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', wav, '-c:a', 'aac_at', '-b:a', '128k', `${DIST}/sounds/${item.id}.m4a`]);
  const { play, mode, maxS, ...meta } = item;
  catalog.push({
    ...meta,
    duration: Math.round((y.length / SR) * 1000) / 1000,
    peaks: peaks(y),
    files: { wav: `sounds/${item.id}.wav`, m4a: `sounds/${item.id}.m4a` },
    ...(kind === 'synth' ? { code: play.toString() } : {}),
  });
  console.log(`${item.id.padEnd(20)} ${kind.padEnd(6)} ${(y.length / SR).toFixed(2)}s`);
}

writeFileSync(`${DIST}/catalog.json`, JSON.stringify(catalog, null, 1));
// Same data as a script, so dist/index.html works when opened straight from disk.
writeFileSync(`${DIST}/catalog.js`, `const CATALOG = ${JSON.stringify(catalog)};\n`);
console.log(`\n${catalog.length} sounds`);
