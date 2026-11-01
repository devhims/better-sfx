// Reports quiet stretches in built sounds: lead-in, tail, and gaps inside.
// Usage: node src/audit-gaps.mjs [id ...]   (no ids = every Seed Audio sound)
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const SR = 48000;
const HOP = Math.floor(SR * 0.005);
const QUIET_DB = 30; // quieter than peak - 30 dB counts as silence
const MIN_GAP_MS = 60;

const catalog = JSON.parse(readFileSync('dist/catalog.json', 'utf8'));
const ids = process.argv.slice(2);
const list = catalog.filter((s) => (ids.length ? ids.includes(s.id) : s.source === 'seed-audio'));

export function audit(path) {
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', path, '-ac', '1', '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
  const y = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
  const e = [];
  for (let i = 0; i < y.length; i += HOP) {
    let p = 0;
    for (let j = i; j < Math.min(y.length, i + HOP); j++) p = Math.max(p, Math.abs(y[j]));
    e.push(20 * Math.log10(p + 1e-12));
  }
  const peak = Math.max(...e);
  const loud = e.map((v) => v > peak - QUIET_DB);
  const first = loud.indexOf(true);
  const last = loud.lastIndexOf(true);
  const gaps = [];
  let run = 0;
  for (let i = first; i <= last; i++) {
    if (!loud[i]) run++;
    else {
      if (run * 5 >= MIN_GAP_MS) gaps.push({ at: ((i - run) * 5) / 1000, ms: run * 5 });
      run = 0;
    }
  }
  return { dur: y.length / SR, lead: first * 5, tail: (e.length - 1 - last) * 5, gaps, quietShare: loud.filter((v) => !v).length / e.length };
}

const pad = (s, w) => String(s).padEnd(w);
console.log(pad('id', 18), pad('dur', 6), pad('lead', 6), pad('tail', 6), pad('quiet', 6), 'gaps inside (start s / length ms)');
for (const s of list) {
  const r = audit(`dist/${s.files.wav}`);
  console.log(pad(s.id, 18), pad(r.dur.toFixed(2), 6), pad(r.lead, 6), pad(r.tail, 6), pad(Math.round(r.quietShare * 100) + '%', 6),
    r.gaps.map((g) => `${g.at.toFixed(2)}/${g.ms}`).join('  '));
}
