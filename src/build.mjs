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

const DIST = 'dist';
mkdirSync(`${DIST}/sounds`, { recursive: true });

async function renderSynth(r) {
  const ctx = new OfflineAudioContext(1, SR * 4, SR);
  const seed = [...r.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 2147483647, 7);
  r.play(createKit(ctx, ctx.destination, seed), n);
  const out = await ctx.startRendering();
  return level(trim(out.getChannelData(0).slice(), { floorDb: 60, preMs: 1 }), { fadeOutMs: 5, rmsDb: -18 + (r.levelDb ?? 0) });
}

function finishSeed(p) {
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', `out/seed-raw/${p.id}.wav`, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
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
const all = [
  ...synthRecipes.map((r) => ['synth', r]),
  ...setRecipes.map((r) => ['synth', r]),
  ...seedPrompts.map((p) => ['seed', p]),
  ...foleySynth.map((r) => ['synth', r]),
];
for (const [kind, item] of all) {
  const y = kind === 'synth' ? await renderSynth(item) : finishSeed(item);
  const wav = `${DIST}/sounds/${item.id}.wav`;
  writeFileSync(wav, wav16(y));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', wav, '-c:a', 'aac_at', '-b:a', '128k', `${DIST}/sounds/${item.id}.m4a`]);
  const { play, mode, maxS, levelDb, generated, rhythmMs, ring, preRollS, ...meta } = item;
  catalog.push({
    ...meta,
    duration: Math.round((y.length / SR) * 1000) / 1000,
    peaks: peaks(y),
    files: { wav: `sounds/${item.id}.wav`, m4a: `sounds/${item.id}.m4a` },
    // Set sounds are built from shared style code, so play.toString() alone
    // would not run. They get no snippet until the site bundles the styles.
    ...(kind === 'synth' && !generated ? { code: play.toString() } : {}),
  });
  console.log(`${item.id.padEnd(20)} ${kind.padEnd(6)} ${(y.length / SR).toFixed(2)}s`);
}

writeFileSync(`${DIST}/catalog.json`, JSON.stringify(catalog, null, 1));
// Same data as a script, so dist/index.html works when opened straight from disk.
writeFileSync(`${DIST}/catalog.js`, `const CATALOG = ${JSON.stringify(catalog)};\n`);
console.log(`\n${catalog.length} sounds`);
await import('./site.mjs');
