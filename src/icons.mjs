// Writes the site icon and the social share image as SVG.
//   dist/favicon.svg     the icon: a sound hit drawn as five decaying bars
//   .github/icon.svg     the same icon, for the README and GitHub
//   out/og.svg           1200 x 630 share image, rasterised to dist/og.png
// Rasterise with: npm run icons   (needs Chrome and ffmpeg, run locally)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const INK = '#1c1917';
const ACCENT = '#fb923c';

// Five bars, tallest second, decaying like a struck sound. Sized to stay
// readable as a 16 px favicon.
/** @param {number} size @param {number} x0 @param {number} y0 */
function bars(size, x0, y0) {
  const heights = [0.5, 1, 0.68, 0.42, 0.22];
  const w = size * 0.1;
  const gap = size * 0.065;
  const total = heights.length * w + (heights.length - 1) * gap;
  const left = x0 + (size - total) / 2;
  const maxH = size * 0.62;
  return heights.map((h, i) => {
    const bh = Math.max(w, h * maxH);
    return `<rect x="${(left + i * (w + gap)).toFixed(1)}" y="${(y0 + size / 2 - bh / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${bh.toFixed(1)}" rx="${(w / 2).toFixed(1)}" fill="${ACCENT}"/>`;
  }).join('');
}

export const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Better SFX">
<rect width="512" height="512" rx="116" fill="${INK}"/>
${bars(512, 0, 0)}
</svg>
`;

/** @type {import('../types/sfx.js').CatalogEntry[]} */
const catalog = JSON.parse(readFileSync('dist/catalog.json', 'utf8'));
const peaks = [...(catalog.find((s) => s.id === 'glass-success')?.peaks ?? []), ...(catalog.find((s) => s.id === 'door-knock-c')?.peaks ?? [])];
const W = 1200, H = 630, X0 = 80, X1 = W - 80, BASE = 470;
const step = (X1 - X0) / peaks.length;
const lit = Math.round(peaks.length * 0.42);
const wave = peaks.map((p, i) => {
  const h = Math.max(6, p * 150);
  return `<rect x="${(X0 + i * step).toFixed(1)}" y="${(BASE - h / 2).toFixed(1)}" width="${(step * 0.55).toFixed(1)}" height="${h.toFixed(1)}" rx="${(step * 0.27).toFixed(1)}" fill="${i < lit ? ACCENT : '#44403c'}"/>`;
}).join('');

const OG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="#0c0a09"/>
<g transform="translate(80 80)"><svg width="88" height="88" viewBox="0 0 512 512"><rect width="512" height="512" rx="116" fill="#1c1917"/>${bars(512, 0, 0)}</svg></g>
<g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Helvetica, Arial, sans-serif">
<text x="190" y="138" font-size="54" font-weight="700" letter-spacing="-2" fill="#f5f5f4">Better SFX</text>
<text x="80" y="268" font-size="60" font-weight="700" letter-spacing="-2" fill="#f5f5f4">Free sound effects for</text>
<text x="80" y="338" font-size="60" font-weight="700" letter-spacing="-2" fill="#f5f5f4">apps, videos and AI agents</text>
<text x="80" y="590" font-size="26" fill="#a8a29e">sfx.video2ctx.dev · by video2ctx</text>
</g>
${wave}
</svg>
`;

mkdirSync('.github', { recursive: true });
mkdirSync('out', { recursive: true });
writeFileSync('dist/favicon.svg', ICON_SVG);
writeFileSync('.github/icon.svg', ICON_SVG);
writeFileSync('out/og.svg', OG_SVG);
console.log('icons: dist/favicon.svg, .github/icon.svg, out/og.svg');
