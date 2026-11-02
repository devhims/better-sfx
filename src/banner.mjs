// Writes the README banner in light and dark versions to .github/.
// The waveform is real: two sounds from the catalog, drawn the way the
// sound page draws its player, with the first part lit as if playing.
// Usage: node src/banner.mjs   (also run at the end of src/site.mjs)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

/** @type {import('../types/sfx.js').CatalogEntry[]} */
const catalog = JSON.parse(readFileSync('dist/catalog.json', 'utf8'));
const peaksOf = (/** @type {string} */ id) => catalog.find((s) => s.id === id)?.peaks ?? [];
const peaks = [...peaksOf('glass-success'), ...peaksOf('door-knock-c')];

const THEMES = {
  light: { bg: '#fafaf9', ink: '#1c1917', muted: '#78716c', bar: '#d6d3d1', accent: '#ea580c' },
  dark: { bg: '#0c0a09', ink: '#f5f5f4', muted: '#a8a29e', bar: '#44403c', accent: '#fb923c' },
};

const W = 1280;
const H = 360;
const X0 = 660;
const X1 = W - 72;
const step = (X1 - X0) / peaks.length;
const lit = Math.round(peaks.length * 0.42);

for (const [name, t] of Object.entries(THEMES)) {
  const bars = peaks.map((p, i) => {
    const h = Math.max(6, p * 200);
    const x = (X0 + i * step).toFixed(1);
    const y = (H / 2 - h / 2).toFixed(1);
    return `<rect x="${x}" y="${y}" width="${(step * 0.55).toFixed(1)}" height="${h.toFixed(1)}" rx="${(step * 0.27).toFixed(1)}" fill="${i < lit ? t.accent : t.bar}"/>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Better SFX: free sound effects for apps, videos and AI agents">
<rect width="${W}" height="${H}" rx="24" fill="${t.bg}"/>
<g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Helvetica, Arial, sans-serif">
<text x="72" y="168" font-size="76" font-weight="700" letter-spacing="-3" fill="${t.ink}">Better SFX</text>
<text x="74" y="222" font-size="26" fill="${t.muted}">Free sound effects for apps,</text>
<text x="74" y="258" font-size="26" fill="${t.muted}">videos and AI agents</text>
</g>
${bars}
</svg>
`;
  mkdirSync('.github', { recursive: true });
  writeFileSync(`.github/banner-${name}.svg`, svg);
}
console.log('banner: .github/banner-light.svg, .github/banner-dark.svg');
