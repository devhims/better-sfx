// Matching sound sets: the same 10 app actions in 5 styles.
// A style defines how a note, a tap and a rush of air sound. An action is a
// pattern of those three, so every sound in a set shares one voice.

const semi = (f, x) => f * 2 ** (x / 12);

const STYLES = {
  glass: {
    label: 'Glass', root: 'C6', tags: ['glass', 'glassy', 'bright', 'airy', 'crystal'],
    setup: (k) => k.space({ decay: 0.8, mix: 0.25, tone: 9000 }),
    note: (k, f, t, d, g) => k.strike({ f, t, kind: 'glass', d, g, send: 0.4 }),
    tap: (k, t, g, p) => {
      k.strike({ f: 2600 * p, t, kind: 'glass', d: 0.07, g: g * 0.5 });
      k.noise({ t, d: 0.004, g: g * 0.3, filter: { type: 'highpass', f: 7000 } });
    },
    air: (k, t, up, dur, g) => k.noise({ t, a: dur * 0.4, d: dur * 0.6, g: g * 0.5, send: 0.3, filter: { type: 'bandpass', f: up ? 2500 : 8000, to: up ? 8000 : 2500, glide: dur, q: 2 } }),
  },
  wood: {
    label: 'Wood', root: 'G4', tags: ['wood', 'woody', 'marimba', 'warm', 'organic', 'dry'],
    setup: () => {},
    note: (k, f, t, d, g) => k.strike({ f, t, kind: 'marimba', d, g }),
    tap: (k, t, g, p) => {
      k.strike({ f: 1000 * p, t, kind: 'wood', d: 0.05, g: g * 0.6 });
      k.noise({ t, d: 0.005, g: g * 0.25, filter: { type: 'bandpass', f: 3000, q: 1 } });
    },
    air: (k, t, up, dur, g) => k.noise({ t, a: dur * 0.4, d: dur * 0.6, g: g * 0.45, filter: { type: 'bandpass', f: up ? 600 : 2500, to: up ? 2500 : 600, glide: dur, q: 1.2 } }),
  },
  soft: {
    label: 'Soft', root: 'E5', tags: ['soft', 'minimal', 'gentle', 'calm', 'sine', 'subtle'],
    setup: (k) => k.space({ decay: 1.0, mix: 0.2 }),
    note: (k, f, t, d, g) => k.tone({ f, t, a: 0.012, d, g: g * 0.8, send: 0.2 }),
    tap: (k, t, g, p) => k.tone({ f: 1100 * p, t, a: 0.004, d: 0.035, g: g * 0.6 }),
    air: (k, t, up, dur, g) => k.noise({ t, a: dur * 0.5, d: dur * 0.5, g: g * 0.35, filter: { type: 'lowpass', f: up ? 500 : 2000, to: up ? 2000 : 500, glide: dur, q: 0.7 } }),
  },
  retro: {
    label: 'Retro', root: 'C5', tags: ['retro', '8-bit', 'chiptune', 'game', 'square', 'pixel'],
    setup: () => {},
    note: (k, f, t, d, g) => k.tone({ f, t, hold: d * 0.25, d: d * 0.5, g: g * 0.35, type: 'square', filter: { type: 'lowpass', f: 5000 } }),
    tap: (k, t, g, p) => k.tone({ f: 1500 * p, t, d: 0.015, g: g * 0.3, type: 'square', filter: { type: 'lowpass', f: 6000 } }),
    air: (k, t, up, dur, g) => k.tone({ f: up ? 300 : 1200, to: up ? 1200 : 300, glide: dur, t, a: 0.005, d: dur, g: g * 0.25, type: 'square', filter: { type: 'lowpass', f: 4000 } }),
  },
  mechanical: {
    label: 'Mechanical', root: 'A4', tags: ['mechanical', 'metallic', 'industrial', 'switch', 'hardware'],
    setup: () => {},
    note: (k, f, t, d, g) => {
      k.fm({ f, t, ratio: 1.41, index: 1.4, d: d * 0.7, g: g * 0.8 });
      k.noise({ t, d: 0.006, g: g * 0.5, filter: { type: 'highpass', f: 3500 } });
    },
    tap: (k, t, g, p) => {
      k.noise({ t, d: 0.008, g, filter: { type: 'highpass', f: 3200 } });
      k.tone({ f: 200 * p, to: 90, glide: 0.02, t, d: 0.03, g: g * 0.6 });
    },
    air: (k, t, up, dur, g) => k.noise({ t, a: dur * 0.3, d: dur * 0.7, g: g * 0.45, filter: { type: 'bandpass', f: up ? 900 : 4000, to: up ? 4000 : 900, glide: dur, q: 5 } }),
  },
};

// level: dB relative to the library's normal loudness, so a set keeps its
// own balance (hover quieter than a notification).
const ACTIONS = {
  click: { name: 'click', tags: ['click', 'button', 'press'], desc: 'A button press.', level: -3,
    play: (s, k) => s.tap(k, 0, 1, 1) },
  hover: { name: 'hover', tags: ['hover', 'focus', 'faint'], desc: 'A faint hover or focus cue.', level: -9,
    play: (s, k) => s.tap(k, 0, 0.5, 1.35) },
  toggle: { name: 'toggle', tags: ['toggle', 'switch', 'on'], desc: 'Two rising notes for a switch.', level: -4,
    play: (s, k, r) => { s.note(k, r, 0, 0.15, 0.3); s.note(k, semi(r, 7), 0.06, 0.2, 0.3); } },
  notify: { name: 'notify', tags: ['notification', 'alert', 'chime'], desc: 'A two-note notification.', level: 0,
    play: (s, k, r) => { s.note(k, semi(r, 7), 0, 0.7, 0.3); s.note(k, semi(r, 12), 0.13, 0.9, 0.3); } },
  success: { name: 'success', tags: ['success', 'done', 'complete'], desc: 'A major arpeggio up to the octave.', level: -1,
    play: (s, k, r) => [0, 4, 7, 12].forEach((x, i) => s.note(k, semi(r, x), i * 0.07, i === 3 ? 0.8 : 0.35, 0.28)) },
  error: { name: 'error', tags: ['error', 'fail', 'wrong'], desc: 'Two notes falling a tritone.', level: -2,
    play: (s, k, r) => { s.note(k, r, 0, 0.25, 0.3); s.note(k, semi(r, -6), 0.13, 0.4, 0.3); } },
  open: { name: 'open', tags: ['open', 'modal', 'appear'], desc: 'A rising pair with a lift of air.', level: -4,
    play: (s, k, r) => { s.air(k, 0, true, 0.18, 1); s.note(k, r, 0.03, 0.2, 0.22); s.note(k, semi(r, 7), 0.1, 0.3, 0.22); } },
  close: { name: 'close', tags: ['close', 'dismiss', 'disappear'], desc: 'A falling pair with air going down.', level: -4,
    play: (s, k, r) => { s.air(k, 0, false, 0.18, 1); s.note(k, semi(r, 7), 0.03, 0.2, 0.22); s.note(k, r, 0.1, 0.3, 0.22); } },
  send: { name: 'send', tags: ['send', 'sent', 'message', 'outgoing'], desc: 'A quick rush up that ends in a tap.', level: -3,
    play: (s, k) => { s.air(k, 0, true, 0.12, 1.2); s.tap(k, 0.1, 0.8, 1.5); } },
  delete: { name: 'delete', tags: ['delete', 'remove', 'trash'], desc: 'A tap that drops into two low notes.', level: -3,
    play: (s, k, r) => { s.tap(k, 0, 0.9, 0.7); s.note(k, semi(r, -12), 0.04, 0.2, 0.3); s.note(k, semi(r, -17), 0.11, 0.3, 0.3); } },
};

export const setRecipes = [];
for (const [styleId, style] of Object.entries(STYLES)) {
  for (const [actionId, action] of Object.entries(ACTIONS)) {
    setRecipes.push({
      id: `${styleId}-${actionId}`,
      name: `${style.label} ${action.name}`,
      category: `${styleId} set`,
      set: styleId,
      action: actionId,
      tags: [...new Set([...style.tags, ...action.tags, 'set'])],
      description: `${action.desc} Part of the ${style.label.toLowerCase()} set.`,
      source: 'synth',
      levelDb: action.level,
      generated: true,
      play: (k, n) => { style.setup(k); action.play(style, k, n(style.root)); },
    });
  }
}
