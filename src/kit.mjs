// Small Web Audio toolkit shared by every synthesized sound.
// Uses only the standard Web Audio API, so the same recipes run in a browser
// AudioContext or in Node through node-web-audio-api's OfflineAudioContext.

export function createKit(ctx, destination, seed = 1) {
  let state = seed % 2147483647 || 1;
  const rand = () => (state = (state * 16807) % 2147483647) / 2147483647;

  const master = ctx.createGain();
  master.connect(destination);

  // Shared white-noise buffer, seeded so renders are reproducible.
  const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = rand() * 2 - 1;

  // Reverb send. Off until a recipe calls space().
  let verbIn = null;
  function space({ decay = 1.2, mix = 0.25, tone = 6000 } = {}) {
    const len = Math.floor(ctx.sampleRate * decay);
    const ir = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = ir.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (rand() * 2 - 1) * Math.pow(1 - i / len, 3);
    const conv = ctx.createConvolver();
    conv.buffer = ir;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = tone;
    const wet = ctx.createGain();
    wet.gain.value = mix;
    verbIn = ctx.createGain();
    verbIn.connect(conv);
    conv.connect(lp);
    lp.connect(wet);
    wet.connect(master);
  }

  // Attack, optional hold, exponential decay.
  function envelope(param, t, a, hold, d, peak) {
    param.setValueAtTime(0, t);
    param.linearRampToValueAtTime(peak, t + a);
    if (hold > 0) param.setValueAtTime(peak, t + a + hold);
    param.exponentialRampToValueAtTime(0.0001, t + a + hold + d);
    param.linearRampToValueAtTime(0, t + a + hold + d + 0.01);
    return t + a + hold + d + 0.02;
  }

  function route(node, send) {
    node.connect(master);
    if (send > 0 && verbIn) {
      const s = ctx.createGain();
      s.gain.value = send;
      node.connect(s);
      s.connect(verbIn);
    }
  }

  function filterChain(input, filter) {
    if (!filter) return input;
    const f = ctx.createBiquadFilter();
    f.type = filter.type || 'lowpass';
    f.Q.value = filter.q ?? 0.7;
    const t0 = filter.t ?? 0;
    f.frequency.setValueAtTime(filter.f, t0);
    if (filter.to) f.frequency.exponentialRampToValueAtTime(filter.to, t0 + (filter.glide ?? 0.1));
    input.connect(f);
    return f;
  }

  // One oscillator voice.
  function tone({
    f, to, glide = 0.08, t = 0, a = 0.003, hold = 0, d = 0.2, g = 0.3,
    type = 'sine', send = 0, vib = null, filter = null, detune = 0,
  }) {
    const o = ctx.createOscillator();
    o.type = type;
    o.detune.value = detune;
    o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + glide);
    if (vib) {
      const lfo = ctx.createOscillator();
      const depth = ctx.createGain();
      lfo.frequency.value = vib.rate;
      depth.gain.value = vib.depth;
      lfo.connect(depth);
      depth.connect(o.frequency);
      lfo.start(t);
      lfo.stop(t + a + hold + d + 0.05);
    }
    const amp = ctx.createGain();
    const end = envelope(amp.gain, t, a, hold, d, g);
    filterChain(o, filter && { t, ...filter }).connect(amp);
    route(amp, send);
    o.start(t);
    o.stop(end);
    return end;
  }

  // Filtered noise burst.
  function noise({ t = 0, a = 0.001, hold = 0, d = 0.05, g = 0.3, filter = { type: 'bandpass', f: 3000, q: 1 }, send = 0 }) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const amp = ctx.createGain();
    const end = envelope(amp.gain, t, a, hold, d, g);
    filterChain(src, { t, ...filter }).connect(amp);
    route(amp, send);
    src.start(t, rand() * 1.5);
    src.stop(end);
    return end;
  }

  // Additive struck tone. partials: [ratio, gain, decayScale].
  const PARTIALS = {
    marimba: [[1, 1, 1], [3.93, 0.22, 0.35], [9.2, 0.06, 0.15]],
    bell: [[1, 1, 1], [2.0, 0.45, 0.75], [3.0, 0.22, 0.55], [4.24, 0.18, 0.45], [5.43, 0.1, 0.3]],
    glass: [[1, 1, 1], [2.32, 0.35, 0.6], [4.25, 0.15, 0.4], [6.63, 0.07, 0.25]],
    vibes: [[1, 1, 1], [4.0, 0.12, 0.4], [10.0, 0.03, 0.2]],
    wood: [[1, 1, 1], [2.57, 0.4, 0.5], [4.4, 0.15, 0.3]],
  };
  function strike({ f, t = 0, d = 0.6, g = 0.3, kind = 'marimba', send = 0, a = 0.002, vib = null }) {
    let end = t;
    for (const [ratio, pg, ds] of PARTIALS[kind]) {
      if (f * ratio > ctx.sampleRate / 2.2) continue;
      end = Math.max(end, tone({ f: f * ratio, t, a, d: d * ds, g: g * pg, send, vib }));
    }
    return end;
  }

  // Two-operator FM voice for metallic and digital tones.
  function fm({ f, ratio = 2, index = 2, indexTo = 0.01, t = 0, a = 0.002, d = 0.4, g = 0.3, send = 0, type = 'sine' }) {
    const car = ctx.createOscillator();
    const mod = ctx.createOscillator();
    const modGain = ctx.createGain();
    car.type = type;
    car.frequency.value = f;
    mod.frequency.value = f * ratio;
    modGain.gain.setValueAtTime(f * index, t);
    modGain.gain.exponentialRampToValueAtTime(Math.max(f * indexTo, 0.01), t + a + d);
    mod.connect(modGain);
    modGain.connect(car.frequency);
    const amp = ctx.createGain();
    const end = envelope(amp.gain, t, a, 0, d, g);
    car.connect(amp);
    route(amp, send);
    car.start(t); mod.start(t);
    car.stop(end); mod.stop(end);
    return end;
  }

  return { ctx, tone, noise, strike, fm, space, rand };
}

// Note name to frequency, e.g. n('C5').
export function n(name) {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  const base = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 }[m[1]];
  const acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  const semis = base + acc + (Number(m[3]) - 4) * 12;
  return 440 * Math.pow(2, semis / 12);
}
