// Synthesized sounds. Each play(k, n) schedules Web Audio nodes from time 0.
// k is the kit from kit.mjs, n converts note names to Hz.

const s = (id, name, category, tags, description, play) => ({ id, name, category, tags, description, source: 'synth', play });

export const synthRecipes = [
  // Clicks and taps
  s('click-soft', 'Soft click', 'clicks', ['click', 'soft', 'subtle', 'button', 'ui'], 'A quiet, rounded click for everyday buttons.', (k) => {
    k.noise({ d: 0.018, g: 0.35, filter: { type: 'bandpass', f: 2400, q: 1.4 } });
    k.tone({ f: 1700, to: 1300, glide: 0.015, d: 0.02, g: 0.12 });
  }),
  s('click-crisp', 'Crisp click', 'clicks', ['click', 'crisp', 'sharp', 'bright', 'button'], 'A short, bright click with a hard edge.', (k) => {
    k.noise({ d: 0.01, g: 0.6, filter: { type: 'highpass', f: 4200, q: 0.8 } });
    k.tone({ f: 3200, to: 2100, glide: 0.01, d: 0.012, g: 0.18 });
  }),
  s('click-deep', 'Deep click', 'clicks', ['click', 'deep', 'low', 'thock', 'heavy'], 'A low, weighty click with a soft thump underneath.', (k) => {
    k.tone({ f: 230, to: 90, glide: 0.03, d: 0.05, g: 0.55 });
    k.noise({ d: 0.02, g: 0.3, filter: { type: 'lowpass', f: 1400, q: 0.7 } });
  }),
  s('button-press', 'Button press', 'clicks', ['button', 'press', 'release', 'tactile', 'physical'], 'A tactile button that goes down, then springs back up.', (k) => {
    k.noise({ d: 0.015, g: 0.45, filter: { type: 'bandpass', f: 1800, q: 1.5 } });
    k.tone({ f: 170, to: 80, glide: 0.03, d: 0.04, g: 0.35 });
    k.noise({ t: 0.09, d: 0.01, g: 0.2, filter: { type: 'bandpass', f: 2800, q: 1.5 } });
  }),
  s('tap-wood', 'Wood tap', 'clicks', ['tap', 'wood', 'woody', 'knock', 'organic', 'warm'], 'A dry tap on a small wooden block.', (k) => {
    k.strike({ f: 820, kind: 'wood', d: 0.08, g: 0.4 });
    k.noise({ d: 0.006, g: 0.25, filter: { type: 'bandpass', f: 3000, q: 1 } });
  }),
  s('tap-glass', 'Glass tap', 'clicks', ['tap', 'glass', 'glassy', 'bright', 'ting', 'delicate'], 'A light fingernail tap on glass.', (k) => {
    k.strike({ f: 2300, kind: 'glass', d: 0.18, g: 0.22 });
  }),
  s('tick-tiny', 'Tiny tick', 'clicks', ['tick', 'tiny', 'micro', 'minimal', 'subtle'], 'The smallest possible tick, for selection and focus.', (k) => {
    k.tone({ f: 4000, d: 0.008, g: 0.22 });
    k.noise({ d: 0.005, g: 0.2, filter: { type: 'highpass', f: 6000 } });
  }),
  s('hover-blip', 'Hover blip', 'clicks', ['hover', 'blip', 'focus', 'soft', 'menu'], 'A faint blip for hover and focus states.', (k) => {
    k.tone({ f: 1400, a: 0.004, d: 0.03, g: 0.12 });
  }),

  // Toggles and switches
  s('toggle-on', 'Toggle on', 'toggles', ['toggle', 'on', 'enable', 'rising', 'switch'], 'Two rising notes for switching something on.', (k) => {
    k.tone({ f: 660, d: 0.06, g: 0.2, type: 'triangle' });
    k.tone({ f: 990, t: 0.055, d: 0.09, g: 0.2, type: 'triangle' });
  }),
  s('toggle-off', 'Toggle off', 'toggles', ['toggle', 'off', 'disable', 'falling', 'switch'], 'Two falling notes for switching something off.', (k) => {
    k.tone({ f: 990, d: 0.06, g: 0.2, type: 'triangle' });
    k.tone({ f: 660, t: 0.055, d: 0.09, g: 0.2, type: 'triangle' });
  }),
  s('switch-flick', 'Switch flick', 'toggles', ['switch', 'flick', 'snap', 'light', 'quick'], 'A light snap, like a small rocker switch.', (k) => {
    k.noise({ d: 0.01, g: 0.5, filter: { type: 'highpass', f: 3000 } });
    k.strike({ f: 1250, kind: 'wood', t: 0.004, d: 0.05, g: 0.2 });
  }),
  s('switch-heavy', 'Heavy switch', 'toggles', ['switch', 'heavy', 'industrial', 'thunk', 'lever'], 'A solid industrial switch thrown into place.', (k) => {
    k.tone({ f: 125, to: 60, glide: 0.05, d: 0.09, g: 0.6 });
    k.noise({ d: 0.04, g: 0.4, filter: { type: 'bandpass', f: 900, q: 2 } });
    k.noise({ t: 0.012, d: 0.012, g: 0.3, filter: { type: 'highpass', f: 3500 } });
  }),
  s('check', 'Check', 'toggles', ['checkbox', 'check', 'select', 'tick', 'rising'], 'A quick upward chirp for checking a box.', (k) => {
    k.tone({ f: 1150, to: 1800, glide: 0.03, d: 0.06, g: 0.24 });
  }),
  s('uncheck', 'Uncheck', 'toggles', ['checkbox', 'uncheck', 'deselect', 'falling'], 'A quick downward chirp for clearing a box.', (k) => {
    k.tone({ f: 1800, to: 1150, glide: 0.03, d: 0.06, g: 0.24 });
  }),
  s('slider-detents', 'Slider detents', 'toggles', ['slider', 'detent', 'ticks', 'scroll', 'ratchet', 'picker'], 'A run of small ticks, like dragging a stepped slider.', (k) => {
    for (let i = 0; i < 7; i++) k.tone({ f: 2200 + i * 120, t: i * 0.04, d: 0.007, g: 0.16 });
  }),
  s('lock', 'Lock', 'toggles', ['lock', 'secure', 'close', 'latch', 'privacy'], 'A two-part latch closing.', (k) => {
    k.noise({ d: 0.02, g: 0.4, filter: { type: 'bandpass', f: 2000, q: 3 } });
    k.tone({ f: 420, to: 300, glide: 0.04, d: 0.05, g: 0.2, type: 'square', filter: { type: 'lowpass', f: 1500 } });
    k.noise({ t: 0.07, d: 0.015, g: 0.5, filter: { type: 'bandpass', f: 1500, q: 3 } });
    k.tone({ f: 200, t: 0.07, to: 120, glide: 0.03, d: 0.05, g: 0.35 });
  }),
  s('unlock', 'Unlock', 'toggles', ['unlock', 'open', 'latch', 'release', 'access'], 'A latch springing open.', (k) => {
    k.noise({ d: 0.015, g: 0.45, filter: { type: 'bandpass', f: 1500, q: 3 } });
    k.tone({ f: 120, to: 200, glide: 0.03, d: 0.04, g: 0.3 });
    k.noise({ t: 0.08, d: 0.02, g: 0.35, filter: { type: 'bandpass', f: 2600, q: 3 } });
    k.tone({ f: 300, t: 0.08, to: 460, glide: 0.04, d: 0.06, g: 0.18, type: 'square', filter: { type: 'lowpass', f: 1800 } });
  }),

  // Notifications and alerts
  s('notify-ding', 'Ding', 'notifications', ['notification', 'ding', 'bell', 'single', 'classic'], 'A single clear bell note.', (k, n) => {
    k.space({ decay: 1.4, mix: 0.25 });
    k.strike({ f: n('A5'), kind: 'bell', d: 1.3, g: 0.3, send: 0.4 });
  }),
  s('notify-chime-up', 'Chime up', 'notifications', ['notification', 'chime', 'rising', 'two-note', 'friendly'], 'Two rising vibraphone notes.', (k, n) => {
    k.space({ decay: 1.2, mix: 0.2 });
    k.strike({ f: n('E5'), kind: 'vibes', d: 0.9, g: 0.3, send: 0.3 });
    k.strike({ f: n('B5'), kind: 'vibes', t: 0.12, d: 1.0, g: 0.3, send: 0.3 });
  }),
  s('notify-chime-down', 'Chime down', 'notifications', ['notification', 'chime', 'falling', 'two-note', 'calm'], 'Two falling vibraphone notes.', (k, n) => {
    k.space({ decay: 1.2, mix: 0.2 });
    k.strike({ f: n('B5'), kind: 'vibes', d: 0.9, g: 0.3, send: 0.3 });
    k.strike({ f: n('E5'), kind: 'vibes', t: 0.12, d: 1.0, g: 0.3, send: 0.3 });
  }),
  s('notify-glass', 'Glass notice', 'notifications', ['notification', 'glass', 'glassy', 'airy', 'clean'], 'Two glassy notes a fifth apart.', (k, n) => {
    k.space({ decay: 1.6, mix: 0.3, tone: 8000 });
    k.strike({ f: n('C6'), kind: 'glass', d: 1.0, g: 0.22, send: 0.4 });
    k.strike({ f: n('G6'), kind: 'glass', t: 0.09, d: 1.1, g: 0.18, send: 0.4 });
  }),
  s('notify-pluck', 'Pluck', 'notifications', ['notification', 'pluck', 'string', 'warm', 'soft'], 'A warm plucked note with its octave.', (k, n) => {
    k.tone({ f: n('D5'), d: 0.45, g: 0.28, type: 'sawtooth', filter: { type: 'lowpass', f: 3500, to: 350, glide: 0.25, q: 2 } });
    k.tone({ f: n('D6'), d: 0.3, g: 0.08, type: 'triangle' });
  }),
  s('notify-soft-bell', 'Soft bell', 'notifications', ['notification', 'bell', 'fm', 'soft', 'mellow', 'electric piano'], 'A mellow electric-piano bell.', (k) => {
    k.space({ decay: 1.8, mix: 0.25 });
    k.fm({ f: 880, ratio: 3.5, index: 2.5, d: 1.4, g: 0.2, send: 0.4 });
    k.fm({ f: 440, ratio: 1, index: 1, d: 1.0, g: 0.12 });
  }),
  s('notify-triad', 'Triad', 'notifications', ['notification', 'marimba', 'triad', 'arpeggio', 'cheerful'], 'Three quick marimba notes up a major chord.', (k, n) => {
    ['C5', 'E5', 'G5'].forEach((x, i) => k.strike({ f: n(x), t: i * 0.08, kind: 'marimba', d: 0.5, g: 0.28 }));
  }),
  s('notify-ping', 'Mention ping', 'notifications', ['notification', 'ping', 'mention', 'metallic', 'sharp'], 'A bright metallic ping that cuts through.', (k) => {
    k.space({ decay: 1.0, mix: 0.2 });
    k.fm({ f: 1760, ratio: 1.41, index: 1.5, d: 0.5, g: 0.16, send: 0.3 });
    k.tone({ f: 1760, d: 0.35, g: 0.1 });
  }),
  s('reminder-tingle', 'Tingle', 'notifications', ['reminder', 'tingle', 'sparkle', 'high', 'magic'], 'A quick high glass run upward.', (k, n) => {
    k.space({ decay: 1.5, mix: 0.3, tone: 9000 });
    ['C7', 'E7', 'G7', 'C8'].forEach((x, i) => k.strike({ f: n(x), t: i * 0.05, kind: 'glass', d: 0.6, g: 0.1, send: 0.5 }));
  }),
  s('alert-gentle', 'Gentle alert', 'notifications', ['alert', 'gentle', 'calm', 'soft', 'reminder'], 'Two soft sine notes with slight vibrato.', (k, n) => {
    k.tone({ f: n('C5'), a: 0.02, hold: 0.1, d: 0.25, g: 0.2, vib: { rate: 5, depth: 3 } });
    k.tone({ f: n('E5'), t: 0.22, a: 0.02, hold: 0.12, d: 0.4, g: 0.2, vib: { rate: 5, depth: 3 } });
  }),
  s('alert-urgent', 'Urgent alert', 'notifications', ['alert', 'urgent', 'beep', 'alarm', 'attention'], 'Three firm square-wave beeps.', (k) => {
    for (let i = 0; i < 3; i++) k.tone({ f: 880, t: i * 0.16, a: 0.003, hold: 0.08, d: 0.02, g: 0.12, type: 'square', filter: { type: 'lowpass', f: 3000 } });
  }),

  // Success
  s('success-chime', 'Success chime', 'success', ['success', 'complete', 'done', 'marimba', 'arpeggio', 'positive'], 'Four marimba notes up to the octave.', (k, n) => {
    ['C5', 'E5', 'G5', 'C6'].forEach((x, i) => k.strike({ f: n(x), t: i * 0.07, kind: 'marimba', d: i === 3 ? 0.8 : 0.4, g: 0.26 }));
  }),
  s('success-sparkle', 'Sparkle', 'success', ['success', 'sparkle', 'shimmer', 'magic', 'glass', 'delight'], 'A glass run with a shimmering tail.', (k, n) => {
    k.space({ decay: 1.8, mix: 0.35, tone: 10000 });
    ['G6', 'B6', 'D7', 'G7'].forEach((x, i) => k.strike({ f: n(x), t: i * 0.06, kind: 'glass', d: 0.7, g: 0.12, send: 0.5 }));
    k.noise({ t: 0.05, a: 0.1, d: 0.4, g: 0.04, filter: { type: 'highpass', f: 9000 }, send: 0.4 });
  }),
  s('success-pop-up', 'Pop up', 'success', ['success', 'pop', 'rising', 'playful', 'bubbly'], 'A rising pop that lands on a bright note.', (k, n) => {
    k.tone({ f: 480, to: 1500, glide: 0.08, d: 0.09, g: 0.3 });
    k.strike({ f: n('G6'), t: 0.08, kind: 'vibes', d: 0.5, g: 0.2 });
  }),
  s('task-complete', 'Task complete', 'success', ['success', 'complete', 'done', 'two-note', 'resolve'], 'Two marimba notes that resolve upward.', (k, n) => {
    k.strike({ f: n('G5'), kind: 'marimba', d: 0.35, g: 0.28 });
    k.strike({ f: n('C6'), t: 0.1, kind: 'marimba', d: 0.7, g: 0.3 });
  }),
  s('confirm', 'Confirm', 'success', ['confirm', 'ok', 'accept', 'tick', 'quick'], 'A short two-step chirp that says yes.', (k) => {
    k.tone({ f: 1000, d: 0.035, g: 0.2 });
    k.tone({ f: 1500, t: 0.06, d: 0.07, g: 0.22 });
  }),
  s('payment-success', 'Payment done', 'success', ['payment', 'success', 'purchase', 'checkout', 'bright'], 'A bright chime over a soft low note.', (k, n) => {
    k.space({ decay: 1.4, mix: 0.25 });
    k.strike({ f: n('C5'), kind: 'vibes', d: 0.8, g: 0.12, send: 0.2 });
    k.strike({ f: n('E6'), kind: 'bell', d: 0.6, g: 0.18, send: 0.3 });
    k.strike({ f: n('B6'), t: 0.09, kind: 'bell', d: 0.9, g: 0.16, send: 0.4 });
  }),
  s('level-up', 'Level up', 'success', ['level up', 'game', 'retro', 'arpeggio', 'reward', '8-bit'], 'A fast square-wave run up two octaves.', (k, n) => {
    ['C5', 'E5', 'G5', 'C6', 'E6', 'G6', 'C7'].forEach((x, i) => k.tone({ f: n(x), t: i * 0.045, d: i === 6 ? 0.3 : 0.05, g: 0.08, type: 'square', filter: { type: 'lowpass', f: 6000 } }));
  }),
  s('achievement', 'Achievement', 'success', ['achievement', 'fanfare', 'brass', 'reward', 'big'], 'A short brassy chord with a bell on top.', (k, n) => {
    k.space({ decay: 1.6, mix: 0.25 });
    ['C4', 'G4', 'C5', 'E5', 'G5'].forEach((x) => k.tone({ f: n(x), a: 0.03, hold: 0.25, d: 0.6, g: 0.06, type: 'sawtooth', send: 0.3, filter: { type: 'lowpass', f: 800, to: 3500, glide: 0.15 } }));
    k.strike({ f: n('C7'), t: 0.02, kind: 'bell', d: 1.0, g: 0.1, send: 0.4 });
  }),
  s('coin', 'Coin', 'success', ['coin', 'game', 'retro', 'collect', '8-bit', 'reward'], 'A classic two-note pickup sound.', (k, n) => {
    k.tone({ f: n('B5'), d: 0.06, g: 0.1, type: 'square', filter: { type: 'lowpass', f: 7000 } });
    k.tone({ f: n('E6'), t: 0.06, hold: 0.18, d: 0.15, g: 0.1, type: 'square', filter: { type: 'lowpass', f: 7000 } });
  }),

  // Errors and warnings
  s('error-buzz', 'Error buzz', 'errors', ['error', 'buzz', 'wrong', 'harsh', 'denied'], 'A low buzzer for something that failed.', (k) => {
    k.tone({ f: 110, hold: 0.18, d: 0.05, g: 0.22, type: 'square', filter: { type: 'lowpass', f: 1200 } });
    k.tone({ f: 116, hold: 0.18, d: 0.05, g: 0.15, type: 'sawtooth', filter: { type: 'lowpass', f: 900 } });
  }),
  s('error-double', 'Error', 'errors', ['error', 'two-note', 'falling', 'fail', 'invalid'], 'Two falling notes that sound like no.', (k) => {
    k.tone({ f: 330, d: 0.12, hold: 0.04, g: 0.18, type: 'sawtooth', filter: { type: 'lowpass', f: 1800 } });
    k.tone({ f: 247, t: 0.14, d: 0.2, hold: 0.04, g: 0.18, type: 'sawtooth', filter: { type: 'lowpass', f: 1500 } });
  }),
  s('error-thud', 'Thud', 'errors', ['error', 'thud', 'blocked', 'heavy', 'dull', 'bump'], 'A dull thud for a blocked action.', (k) => {
    k.tone({ f: 150, to: 55, glide: 0.12, d: 0.2, g: 0.6 });
    k.noise({ d: 0.08, g: 0.3, filter: { type: 'lowpass', f: 600 } });
  }),
  s('warning-beep', 'Warning', 'errors', ['warning', 'beep', 'caution', 'double', 'attention'], 'Two plain 1 kHz beeps.', (k) => {
    for (const t of [0, 0.2]) k.tone({ f: 1000, t, a: 0.005, hold: 0.11, d: 0.03, g: 0.18 });
  }),
  s('denied-wobble', 'Denied', 'errors', ['denied', 'wobble', 'no', 'invalid', 'cartoon'], 'A wobbly low note that shakes its head.', (k) => {
    k.tone({ f: 300, to: 220, glide: 0.25, hold: 0.18, d: 0.1, g: 0.25, type: 'triangle', vib: { rate: 16, depth: 30 } });
  }),
  s('invalid-input', 'Invalid input', 'errors', ['invalid', 'input', 'form', 'shake', 'error', 'soft'], 'A soft two-tap shake for a bad form field.', (k) => {
    k.tone({ f: 420, d: 0.05, g: 0.22, type: 'triangle', filter: { type: 'lowpass', f: 2000 } });
    k.tone({ f: 320, t: 0.07, d: 0.08, g: 0.22, type: 'triangle', filter: { type: 'lowpass', f: 2000 } });
  }),
  // Transitions
  s('swoosh-fast', 'Fast swoosh', 'transitions', ['swoosh', 'whoosh', 'fast', 'transition', 'air'], 'A quick rush of air.', (k) => {
    k.noise({ a: 0.05, d: 0.12, g: 0.4, filter: { type: 'bandpass', f: 800, to: 5000, glide: 0.15, q: 2 } });
  }),
  s('swoosh-slow', 'Slow swoosh', 'transitions', ['swoosh', 'whoosh', 'slow', 'transition', 'air', 'soft'], 'A slow, soft sweep of air.', (k) => {
    k.noise({ a: 0.22, d: 0.3, g: 0.35, filter: { type: 'bandpass', f: 400, to: 3000, glide: 0.45, q: 1.5 } });
  }),
  s('swipe', 'Swipe', 'transitions', ['swipe', 'dismiss', 'gesture', 'falling', 'card'], 'A downward swipe for dismissing a card.', (k) => {
    k.noise({ a: 0.02, d: 0.12, g: 0.35, filter: { type: 'bandpass', f: 4000, to: 1200, glide: 0.12, q: 2 } });
  }),
  s('whoosh-deep', 'Deep whoosh', 'transitions', ['whoosh', 'deep', 'low', 'cinematic', 'transition', 'big'], 'A big, low pass-by.', (k) => {
    k.noise({ a: 0.18, d: 0.35, g: 0.5, filter: { type: 'lowpass', f: 250, to: 1800, glide: 0.3, q: 1.2 } });
    k.tone({ f: 55, to: 90, glide: 0.25, a: 0.15, d: 0.3, g: 0.25 });
  }),
  s('modal-open', 'Open', 'transitions', ['open', 'modal', 'sheet', 'rising', 'appear'], 'A soft rising tone for something appearing.', (k) => {
    k.tone({ f: 300, to: 620, glide: 0.1, a: 0.01, d: 0.13, g: 0.2 });
    k.noise({ a: 0.05, d: 0.08, g: 0.05, filter: { type: 'bandpass', f: 2000, to: 4000, glide: 0.1 } });
  }),
  s('modal-close', 'Close', 'transitions', ['close', 'modal', 'sheet', 'falling', 'disappear'], 'A soft falling tone for something leaving.', (k) => {
    k.tone({ f: 620, to: 300, glide: 0.1, a: 0.01, d: 0.13, g: 0.2 });
    k.noise({ a: 0.05, d: 0.08, g: 0.05, filter: { type: 'bandpass', f: 4000, to: 2000, glide: 0.1 } });
  }),
  s('drawer-slide', 'Drawer slide', 'transitions', ['drawer', 'slide', 'panel', 'sidebar', 'open'], 'A short slide that clicks into place.', (k) => {
    k.noise({ a: 0.06, hold: 0.06, d: 0.08, g: 0.15, filter: { type: 'bandpass', f: 1200, to: 1800, glide: 0.15, q: 0.8 } });
    k.strike({ f: 900, t: 0.18, kind: 'wood', d: 0.05, g: 0.25 });
  }),
  s('zoom-in', 'Zoom in', 'transitions', ['zoom', 'in', 'rising', 'expand', 'focus'], 'A rising sweep for zooming in.', (k) => {
    k.tone({ f: 200, to: 1600, glide: 0.28, a: 0.03, hold: 0.15, d: 0.1, g: 0.12 });
    k.noise({ a: 0.15, d: 0.15, g: 0.12, filter: { type: 'bandpass', f: 1000, to: 6000, glide: 0.28 } });
  }),
  s('riser', 'Riser', 'transitions', ['riser', 'build', 'tension', 'sweep', 'cinematic'], 'A half-second build that opens up.', (k) => {
    k.tone({ f: 200, to: 800, glide: 0.6, a: 0.5, d: 0.12, g: 0.1, type: 'sawtooth', filter: { type: 'lowpass', f: 800, to: 6000, glide: 0.6 } });
    k.noise({ a: 0.5, d: 0.12, g: 0.15, filter: { type: 'highpass', f: 1000, to: 6000, glide: 0.6 } });
  }),
  s('tab-switch', 'Tab switch', 'transitions', ['tab', 'switch', 'segment', 'navigate', 'quick'], 'A quick sideways step between tabs.', (k) => {
    k.tone({ f: 900, d: 0.03, g: 0.15, type: 'triangle' });
    k.tone({ f: 1200, t: 0.03, d: 0.05, g: 0.15, type: 'triangle' });
  }),

  // Pops and bubbles
  s('pop', 'Pop', 'pops', ['pop', 'bubble', 'appear', 'playful', 'round'], 'A round, satisfying pop.', (k) => {
    k.tone({ f: 300, to: 900, glide: 0.015, d: 0.045, g: 0.5 });
    k.noise({ d: 0.01, g: 0.2, filter: { type: 'bandpass', f: 2000, q: 1 } });
  }),
  s('bubble', 'Bubble', 'pops', ['bubble', 'water', 'blip', 'rising', 'liquid'], 'A single bubble rising.', (k) => {
    k.tone({ f: 500, to: 1250, glide: 0.06, d: 0.07, g: 0.3 });
  }),
  s('droplet', 'Droplet', 'pops', ['drop', 'water', 'droplet', 'liquid', 'plink'], 'A water droplet with a little space around it.', (k) => {
    k.space({ decay: 0.8, mix: 0.25 });
    k.tone({ f: 700, to: 1800, glide: 0.05, d: 0.08, g: 0.3, send: 0.4 });
  }),
  s('like', 'Like', 'pops', ['like', 'heart', 'favorite', 'pop', 'social'], 'A bouncy pop for liking something.', (k, n) => {
    k.tone({ f: 600, to: 1100, glide: 0.03, d: 0.05, g: 0.35 });
    k.strike({ f: n('E6'), t: 0.05, kind: 'vibes', d: 0.3, g: 0.15 });
  }),

  // Messages
  s('message-send', 'Send', 'messages', ['send', 'message', 'sent', 'whoosh', 'outgoing'], 'A short upward whoosh for a sent message.', (k) => {
    k.noise({ a: 0.03, d: 0.1, g: 0.25, filter: { type: 'bandpass', f: 1000, to: 4500, glide: 0.12, q: 1.5 } });
    k.tone({ f: 600, to: 1150, glide: 0.08, d: 0.08, g: 0.15 });
  }),
  s('message-receive', 'Receive', 'messages', ['receive', 'message', 'incoming', 'marimba', 'friendly'], 'Two marimba notes for an incoming message.', (k, n) => {
    k.strike({ f: n('G5'), kind: 'marimba', d: 0.3, g: 0.26 });
    k.strike({ f: n('D6'), t: 0.09, kind: 'marimba', d: 0.5, g: 0.26 });
  }),
  s('message-pop', 'Message pop', 'messages', ['message', 'pop', 'chat', 'bubble', 'incoming'], 'A chat-bubble pop with a small chime.', (k, n) => {
    k.tone({ f: 350, to: 1000, glide: 0.015, d: 0.04, g: 0.4 });
    k.strike({ f: n('C6'), t: 0.03, kind: 'vibes', d: 0.4, g: 0.15 });
  }),

  // Progress and timers
  s('progress-tick', 'Progress tick', 'progress', ['tick', 'progress', 'step', 'wood', 'clock'], 'A small wooden tick for each step.', (k) => {
    k.strike({ f: 2000, kind: 'wood', d: 0.025, g: 0.22 });
  }),
  s('processing', 'Processing', 'progress', ['processing', 'computing', 'digital', 'blips', 'loading'], 'A burst of computer-like blips.', (k) => {
    for (let i = 0; i < 8; i++) k.tone({ f: 800 + Math.floor(k.rand() * 8) * 220, t: i * 0.045, d: 0.025, g: 0.07, type: 'square', filter: { type: 'lowpass', f: 5000 } });
  }),
  s('countdown', 'Countdown', 'progress', ['countdown', 'timer', 'start', 'race', 'beep'], 'Three beeps and a higher go.', (k) => {
    for (let i = 0; i < 3; i++) k.tone({ f: 660, t: i * 0.35, hold: 0.08, d: 0.03, g: 0.15 });
    k.tone({ f: 1320, t: 1.05, hold: 0.3, d: 0.08, g: 0.15 });
  }),
  s('timer-done', 'Timer done', 'progress', ['timer', 'done', 'alarm', 'bell', 'ring'], 'Two pairs of bright bell strikes.', (k, n) => {
    k.space({ decay: 1.0, mix: 0.2 });
    for (const t of [0, 0.12, 0.5, 0.62]) k.strike({ f: n('A6'), t, kind: 'bell', d: 0.4, g: 0.14, send: 0.3 });
  }),
  // Power and system
  s('power-on', 'Power on', 'system', ['power', 'on', 'boot', 'start', 'rising', 'sweep'], 'Three voices sweeping up an octave.', (k) => {
    k.space({ decay: 1.5, mix: 0.3 });
    [220, 330, 440].forEach((f) => k.tone({ f, to: f * 2, glide: 0.45, a: 0.3, d: 0.6, g: 0.1, send: 0.3 }));
  }),
  s('power-off', 'Power off', 'system', ['power', 'off', 'shutdown', 'falling', 'sweep'], 'A tone dropping away into nothing.', (k) => {
    k.tone({ f: 880, to: 110, glide: 0.5, a: 0.01, hold: 0.3, d: 0.3, g: 0.18, type: 'triangle' });
  }),
  s('startup-chord', 'Startup chord', 'system', ['startup', 'chord', 'boot', 'big', 'warm', 'welcome'], 'A wide, warm major chord that blooms.', (k, n) => {
    k.space({ decay: 2.5, mix: 0.35 });
    ['F3', 'C4', 'F4', 'A4', 'C5', 'F5'].forEach((x, i) => k.tone({ f: n(x), detune: (i % 2 ? 1 : -1) * 4, a: 0.04, hold: 0.6, d: 1.6, g: 0.06, type: 'sawtooth', send: 0.4, filter: { type: 'lowpass', f: 900, to: 4200, glide: 0.5, q: 0.5 } }));
  }),
  s('connect', 'Connect', 'system', ['connect', 'device', 'plug in', 'pair', 'rising'], 'Two rising tones for a device connecting.', (k, n) => {
    k.fm({ f: n('C5'), ratio: 2, index: 1.2, d: 0.2, g: 0.18 });
    k.fm({ f: n('G5'), t: 0.12, ratio: 2, index: 1.2, d: 0.35, g: 0.18 });
  }),
  s('disconnect', 'Disconnect', 'system', ['disconnect', 'device', 'unplug', 'unpair', 'falling'], 'Two falling tones for a device leaving.', (k, n) => {
    k.fm({ f: n('G5'), ratio: 2, index: 1.2, d: 0.2, g: 0.18 });
    k.fm({ f: n('C5'), t: 0.12, ratio: 2, index: 1.2, d: 0.35, g: 0.18 });
  }),
  s('magic-sparkle', 'Magic dust', 'system', ['magic', 'sparkle', 'fairy', 'twinkle', 'ai', 'generate'], 'A scatter of tiny twinkles, good for AI actions.', (k) => {
    k.space({ decay: 1.5, mix: 0.4, tone: 10000 });
    for (let i = 0; i < 14; i++) k.strike({ f: 2500 + k.rand() * 4000, t: k.rand() * 0.6, kind: 'glass', d: 0.25, g: 0.05, send: 0.6 });
  }),
];


// Web Audio versions of real-world sounds. The build lists these with the
// Seed Audio foley, so they sit in the same categories.
export const foleySynth = [
  // Each rap: a 4 ms knuckle click, a short wooden "tok" around 800 Hz, and
  // four low door-panel tones (95 to 405 Hz) that fade in about 0.1 s.
  s('door-knock-c', 'Door knock C', 'objects', ['knock', 'door', 'wood', 'visitor', 'attention', 'code'], 'Three knuckle raps on a door, made in Web Audio.', (k) => {
    k.space({ decay: 0.35, mix: 0.12, tone: 3000 });
    for (const [t0, g] of [[0.01, 1], [0.18, 0.92], [0.355, 0.8]]) {
      const t = t0 + (k.rand() - 0.5) * 0.008;
      k.noise({ t, d: 0.004, g: 0.35 * g, filter: { type: 'bandpass', f: 3000, q: 0.8 } });
      k.noise({ t, d: 0.03, g: 0.5 * g, filter: { type: 'bandpass', f: 800, q: 3 } });
      for (const [f, gg, d] of [[95, 0.55, 0.14], [168, 0.45, 0.11], [262, 0.3, 0.08], [405, 0.18, 0.05]]) {
        k.tone({ f: f * 1.04, to: f, glide: 0.02, t, a: 0.001, d, g: gg * g });
      }
    }
  }),
];
