// Shared post-processing: trim, loudness match, fades, 16-bit mono WAV.
export const SR = 48000;

/** @param {number} x @returns {number} */
const db = (x) => 20 * Math.log10(x + 1e-12);

// 5 ms peak envelope in dB.
/** @param {Float32Array} y @param {number} [hop] @returns {{ e: number[], hop: number }} */
function envelope(y, hop = Math.floor(SR * 0.005)) {
  /** @type {number[]} */
  const e = [];
  for (let i = 0; i < y.length; i += hop) {
    let p = 0;
    for (let j = i; j < Math.min(y.length, i + hop); j++) p = Math.max(p, Math.abs(y[j]));
    e.push(db(p));
  }
  return { e, hop };
}

// mode 'all': keep everything between the first and last sound above the floor.
// mode 'single': keep only the loudest event, from its onset until it decays.
// mode 'gesture': like 'all', but stops at the first 250 ms gap, so a stray
// second take in a generated file is dropped.
// maxS caps the length; the caller should use a longer fade when capped.
/**
 * @param {Float32Array} y
 * @param {{ mode?: 'all' | 'single' | 'gesture', floorDb?: number, preMs?: number, maxS?: number }} [opts]
 * @returns {Float32Array}
 */
export function trim(y, { mode = 'all', floorDb = 40, preMs = 3, maxS = Infinity } = {}) {
  const { e, hop } = envelope(y);
  const peak = Math.max(...e);
  // Generated files carry a noise floor; end a sound 6 dB above it.
  const floor = [...e].filter((v) => v > -100).sort((p, q) => p - q)[Math.floor(e.length * 0.2)] ?? -120;
  const tail = Math.max(peak - 45, floor + 6);
  const thr = peak - floorDb;
  let a, b;
  if (mode === 'single') {
    const top = e.indexOf(peak);
    a = top;
    // Walk back to the onset: the last frame quieter than peak - 30 dB.
    while (a > 0 && e[a - 1] > peak - 30) a--;
    b = top;
    // Walk forward until 30 ms in a row sit under the tail level.
    let quiet = 0;
    while (b < e.length - 1 && quiet < 6) { b++; quiet = e[b] < tail ? quiet + 1 : 0; }
    b -= quiet;
  } else if (mode === 'gesture') {
    a = e.findIndex((v) => v > Math.max(thr, tail));
    b = a;
    let quiet = 0;
    while (b < e.length - 1 && quiet < 90) { b++; quiet = e[b] < tail ? quiet + 1 : 0; }
    b -= quiet;
  } else {
    a = e.findIndex((v) => v > thr);
    b = e.length - 1 - [...e].reverse().findIndex((v) => v > thr);
  }
  const s = Math.max(0, a * hop - Math.floor((SR * preMs) / 1000));
  const end = Math.min(y.length, (b + 1) * hop, s + Math.floor(SR * maxS));
  return y.slice(s, end);
}

// Loudest 50 ms RMS window to -18 dBFS, peak capped at -1 dBFS, then fades.
/**
 * @param {Float32Array} y
 * @param {{ rmsDb?: number, peakDb?: number, fadeInMs?: number, fadeOutMs?: number }} [opts]
 * @returns {Float32Array}
 */
export function level(y, { rmsDb = -18, peakDb = -1, fadeInMs = 1, fadeOutMs = 8 } = {}) {
  const w = Math.floor(SR * 0.05);
  let best = 0;
  for (let i = 0; i < y.length; i += Math.floor(w / 4)) {
    let acc = 0;
    for (let j = i; j < Math.min(y.length, i + w); j++) acc += y[j] * y[j];
    best = Math.max(best, Math.sqrt(acc / w));
  }
  let peak = 0;
  for (const v of y) peak = Math.max(peak, Math.abs(v));
  const gain = Math.min(10 ** (rmsDb / 20) / best, 10 ** (peakDb / 20) / peak);
  const fi = Math.floor((SR * fadeInMs) / 1000);
  const fo = Math.min(Math.floor((SR * fadeOutMs) / 1000), y.length);
  const out = new Float32Array(y.length);
  for (let i = 0; i < y.length; i++) {
    let v = y[i] * gain;
    if (i < fi) v *= i / fi;
    const left = y.length - i;
    if (left < fo) v *= left / fo;
    out[i] = v;
  }
  return out;
}

/** @param {Float32Array} y mono samples at SR @returns {Buffer} 16-bit PCM WAV */
export function wav16(y) {
  const buf = Buffer.alloc(44 + y.length * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + y.length * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(y.length * 2, 40);
  y.forEach((v, i) => buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 2));
  return buf;
}


// Event-based trim for generated recordings.
// 1. Frames quieter than peak - 30 dB count as silence.
// 2. Silence of splitMs or longer splits the file into events.
// 3. Events less than joinMs apart form one cluster, and the cluster with
//    the most energy is kept, so faint lead-ins and stray extra takes are
//    dropped. A larger joinMs keeps gaps that belong to the sound, such as
//    the pause between two knocks.
// 4. The tail may run on below the silence line while the sound is still
//    decaying, for at most tailMs, so rings are not cut dead.
/**
 * @param {Float32Array} y
 * @param {{ splitMs?: number, joinMs?: number, tailMs?: number, preMs?: number }} [opts]
 * @returns {Float32Array}
 */
export function trimEvent(y, { splitMs = 150, joinMs, tailMs = 120, preMs = 3 } = {}) {
  const { e, hop } = envelope(y);
  const frameMs = (hop / SR) * 1000;
  const peak = Math.max(...e);
  const floor = [...e].filter((v) => v > -100).sort((p, q) => p - q)[Math.floor(e.length * 0.2)] ?? -120;
  const loud = e.map((v) => v > peak - 30);

  // Group loud frames into events.
  /** @typedef {{ a: number, b: number, energy: number }} Span frames a to b */
  /** @type {Span[]} */
  const events = [];
  const split = Math.ceil(splitMs / frameMs);
  /** @type {Span | null} */
  let cur = null;
  let quiet = 0;
  e.forEach((v, i) => {
    if (loud[i]) {
      if (!cur || quiet >= split) { cur = { a: i, b: i, energy: 0 }; events.push(cur); }
      cur.b = i;
      quiet = 0;
    } else if (cur) quiet++;
    if (cur) cur.energy += 10 ** (v / 10);
  });

  // Join events closer than joinMs into one cluster, then keep the cluster
  // with the most energy.
  const join = Math.ceil((joinMs ?? splitMs) / frameMs);
  /** @type {Span[]} */
  const clusters = [];
  for (const ev of events) {
    const last = clusters.at(-1);
    if (last && ev.a - last.b - 1 <= join) { last.b = ev.b; last.energy += ev.energy; }
    else clusters.push({ ...ev });
  }
  const { a: a0, b: b0 } = clusters.reduce((m, c) => (c.energy > m.energy ? c : m));
  let a = a0, b = b0;

  // Let the decay run on while it stays above peak - 50 dB and the noise floor.
  const ringFloor = Math.max(peak - 50, floor + 6);
  const maxTail = Math.ceil(tailMs / frameMs);
  let t = 0;
  while (t < maxTail && b + 1 < e.length && e[b + 1] > ringFloor && !loud[b + 1]) { b++; t++; }

  const s = Math.max(0, a * hop - Math.floor((SR * preMs) / 1000));
  return y.slice(s, Math.min(y.length, (b + 1) * hop));
}


// Shortens every silence inside a sound to at most keepMs, crossfading the
// two sides over 10 ms so the cut does not click. Silence means quieter
// than peak - 30 dB, as in trimEvent.
/**
 * @param {Float32Array} y
 * @param {{ keepMs?: number, minMs?: number }} [opts]
 * @returns {Float32Array}
 */
export function closeGaps(y, { keepMs = 40, minMs = 60 } = {}) {
  const { e, hop } = envelope(y);
  const peak = Math.max(...e);
  const loud = e.map((v) => v > peak - 30);
  const first = loud.indexOf(true);
  const last = loud.lastIndexOf(true);
  /** @type {number[][]} [start, end) sample ranges to remove */
  const cuts = [];
  let run = 0;
  for (let i = first; i <= last; i++) {
    if (!loud[i]) { run++; continue; }
    if (run * hop >= (SR * minMs) / 1000) {
      const gapStart = (i - run) * hop;
      const gapEnd = i * hop;
      const keep = Math.floor((SR * keepMs) / 1000);
      // Keep half the allowed silence on each side of the cut.
      cuts.push([gapStart + keep / 2, gapEnd - keep / 2].map(Math.floor));
    }
    run = 0;
  }
  if (!cuts.length) return y;
  const xf = Math.floor(SR * 0.01);
  /** @type {Float32Array[]} */
  const parts = [];
  let pos = 0;
  for (const [a, b] of cuts) { parts.push(y.slice(pos, a + xf)); pos = b; }
  parts.push(y.slice(pos));
  // Join the parts, overlapping xf samples at each seam with equal-power fades.
  let out = parts[0];
  for (const p of parts.slice(1)) {
    const joined = new Float32Array(out.length + p.length - xf);
    joined.set(out.subarray(0, out.length - xf));
    for (let i = 0; i < xf; i++) {
      const g = i / xf;
      joined[out.length - xf + i] = out[out.length - xf + i] * Math.cos((g * Math.PI) / 2) + p[i] * Math.sin((g * Math.PI) / 2);
    }
    joined.set(p.subarray(xf), out.length);
    out = joined;
  }
  return out;
}
