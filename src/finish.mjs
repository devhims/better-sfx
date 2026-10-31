// Shared post-processing: trim, loudness match, fades, 16-bit mono WAV.
export const SR = 48000;

const db = (x) => 20 * Math.log10(x + 1e-12);

// 5 ms peak envelope in dB.
function envelope(y, hop = Math.floor(SR * 0.005)) {
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

export function wav16(y) {
  const buf = Buffer.alloc(44 + y.length * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + y.length * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(y.length * 2, 40);
  y.forEach((v, i) => buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 2));
  return buf;
}
