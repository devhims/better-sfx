# Wiring Better SFX into web and app code

Files sit in the project's static folder, so `public/sounds/glass-click.m4a` is served at `/sounds/glass-click.m4a`.

## Rules

- Play a sound only in response to something the user did. Browsers block audio until the first click or key press, so a sound on page load fails silently.
- Respect a mute setting. If the app has none and adds more than two or three sounds, add a sound on/off toggle and store the choice.
- Set volume by role: hovers and clicks at 0.2 to 0.35, toggles and sends at 0.35 to 0.5, notifications, success and errors at 0.5 to 0.7.
- Reuse the project's patterns. If it already has an audio helper or a sound library such as Howler or use-sound, add the files there.

## Helper

Put this in the project's utilities folder when it has no audio helper yet. It preloads each file once and clones the element on every play, so fast repeats overlap instead of cutting each other off.

```js
const cache = new Map();
let mutedFallback = false;

export function isSfxMuted() {
  if (typeof window === 'undefined') return true;
  try { return localStorage.getItem('sfx-muted') === '1'; }
  catch { return mutedFallback; }
}

export function playSfx(src, { volume = 0.4 } = {}) {
  if (isSfxMuted()) return;
  let base = cache.get(src);
  if (!base) {
    base = new Audio(src);
    base.preload = 'auto';
    cache.set(src, base);
  }
  const audio = base.cloneNode();
  audio.volume = volume;
  audio.play().catch(() => {});
}

export function setSfxMuted(muted) {
  if (typeof window === 'undefined') return;
  mutedFallback = Boolean(muted);
  try { localStorage.setItem('sfx-muted', muted ? '1' : '0'); } catch {}
}
```

Call it in the event handler, before the work the click starts:

```jsx
<button onClick={() => { playSfx('/sounds/glass-click.m4a', { volume: 0.3 }); save(); }}>Save</button>
```

## Rapid repeats

For sounds that fire many times a second, such as typing on every key press, decode once into a Web Audio buffer. Add this to the same module as `isSfxMuted` above (or import that function). Create the audio context on the first interaction so importing the module during server rendering is safe.

```js
let ctx;
const buffers = new Map();

export async function playFast(src, volume = 0.3) {
  if (isSfxMuted()) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') await ctx.resume();
    if (!buffers.has(src)) {
      const pending = fetch(src).then(res => {
        if (!res.ok) throw new Error(`Audio request failed: ${res.status}`);
        return res.arrayBuffer();
      }).then(data => ctx.decodeAudioData(data));
      buffers.set(src, pending);
    }
    const buf = await buffers.get(src);
    if (isSfxMuted()) return;
    const node = ctx.createBufferSource();
    const gain = ctx.createGain();
    node.buffer = buf;
    gain.gain.value = volume;
    node.connect(gain).connect(ctx.destination);
    node.onended = () => { node.disconnect(); gain.disconnect(); };
    node.start();
  } catch {
    buffers.delete(src); // A later interaction can retry a failed request.
  }
}
```

## Done when

Each moment plays its sound in the running app, the volumes follow the roles above, and the mute setting silences every sound.
