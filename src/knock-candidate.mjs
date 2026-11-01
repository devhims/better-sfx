// Audition helper for the door knock: renders a Web Audio knock and finishes
// the Seed candidates in out/candidates/, all with the library's loudness.
// Usage: node src/knock-candidate.mjs
import { OfflineAudioContext } from 'node-web-audio-api';
import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { createKit } from './kit.mjs';
import { SR, trimEvent, level, wav16 } from './finish.mjs';

// One knuckle rap on a door has three parts:
// 1. the knuckle contact, a 2 to 4 ms click with energy around 2 to 4 kHz;
// 2. a "tok" from the wood surface, a short resonant band around 700 to 900 Hz;
// 3. the door panel ringing, a few low modes from 90 to 400 Hz that die in
//    about 0.1 s. This low boom is what makes it read as a door, not a desk.
export function knock(k, t, g = 1) {
  k.noise({ t, d: 0.004, g: 0.35 * g, filter: { type: 'bandpass', f: 3000, q: 0.8 } });
  k.noise({ t, d: 0.03, g: 0.5 * g, filter: { type: 'bandpass', f: 800, q: 3 } });
  for (const [f, gg, d] of [[95, 0.55, 0.14], [168, 0.45, 0.11], [262, 0.3, 0.08], [405, 0.18, 0.05]]) {
    k.tone({ f: f * 1.04, to: f, glide: 0.02, t, a: 0.001, d, g: gg * g });
  }
}

// The common "knock, knock, knock": three raps 0.17 s apart, the last a
// little softer, with tiny timing drift so it does not sound like a machine.
export function playKnock(k) {
  k.space({ decay: 0.35, mix: 0.12, tone: 3000 });
  [[0.01, 1], [0.18, 0.92], [0.355, 0.8]].forEach(([t, g]) => knock(k, t + (k.rand() - 0.5) * 0.008, g));
}

const ctx = new OfflineAudioContext(1, SR * 2, SR);
playKnock(createKit(ctx, ctx.destination, 4242));
const synth = (await ctx.startRendering()).getChannelData(0).slice();
writeFileSync('out/candidates/knock-webaudio-final.wav', wav16(level(trimEvent(synth, { splitMs: 150, joinMs: 400, tailMs: 120 }), { fadeOutMs: 30 })));
console.log('knock-webaudio-final');

for (const id of ['knock-seed-a', 'knock-seed-b']) {
  const path = `out/candidates/${id}.wav`;
  if (!existsSync(path)) continue;
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', path, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
  const y = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4).slice();
  let t = trimEvent(y, { splitMs: 150, joinMs: 400, tailMs: 120 });
  if (t.length > SR * 2) t = t.slice(0, SR * 2);
  writeFileSync(`out/candidates/${id}-final.wav`, wav16(level(t, { fadeOutMs: 30 })));
  console.log(`${id}-final`);
}
