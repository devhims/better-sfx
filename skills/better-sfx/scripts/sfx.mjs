#!/usr/bin/env node
// Better SFX helper for agents. Node 18+, no dependencies.
// JSON goes to stdout, status messages to stderr.
//
//   node scripts/sfx.mjs search <words...> [--category c] [--set s] [--source code|recording] [--max-duration s] [--limit n]
//   node scripts/sfx.mjs sets
//   node scripts/sfx.mjs categories
//   node scripts/sfx.mjs check-words   (maintenance: WORD_MAP translations are all catalog tags)
//   node scripts/sfx.mjs get <id...> [--dir sounds] [--format m4a|wav|both] [--force]
//
// Every command accepts --catalog <url|path>, also read from BETTER_SFX_CATALOG.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

/** @typedef {import('./catalog.js').CatalogEntry} CatalogEntry */

const DEFAULT_CATALOG = 'https://sfx.video2ctx.dev/catalog.json';
const SITE = 'https://sfx.video2ctx.dev';
const LICENSE = 'Free for personal and commercial use. No credit required. Do not resell or redistribute the sounds on their own. https://sfx.video2ctx.dev/license/';

/** @param {...unknown} a */
const log = (...a) => console.error('[better-sfx]', ...a);
/** @param {string} message @param {object} [extra] @returns {never} */
function fail(message, extra = {}) {
  console.log(JSON.stringify({ ok: false, error: message, ...extra }, null, 2));
  process.exit(1);
}

// ---------- arguments ----------
const argv = process.argv.slice(2);
const command = argv.shift();
const usage = readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 11).join('\n').replace(/^\/\/ ?/gm, '');
if (!command || command === '--help' || command === 'help' || argv.includes('--help')) {
  console.log(JSON.stringify({ ok: true, usage }, null, 2));
  process.exit(0);
}
if (!['search', 'sets', 'categories', 'get', 'check-words'].includes(command)) fail(`Unknown command "${command}".`, { usage });
const allowed = new Set(['catalog', ...(command === 'search'
  ? ['category', 'set', 'source', 'max-duration', 'limit']
  : command === 'get' ? ['dir', 'format'] : [])]);
/** @type {Record<string, string>} */
const flags = {};
let force = false;
/** @type {string[]} */
const words = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--force' && command === 'get') force = true;
  else if (a.startsWith('--')) {
    if (!allowed.has(a.slice(2))) fail(`Unknown option ${a} for ${command}.`);
    const value = argv[++i];
    if (!value || value.startsWith('--')) fail(`Missing value for ${a}.`);
    flags[a.slice(2)] = value;
  }
  else words.push(a);
}
if (flags.source && !['code', 'recording'].includes(flags.source)) fail('--source must be code or recording');
if (flags.limit && (!Number.isInteger(Number(flags.limit)) || Number(flags.limit) < 1)) fail('--limit must be a positive integer');
if (flags['max-duration'] && (!Number.isFinite(Number(flags['max-duration'])) || Number(flags['max-duration']) <= 0)) fail('--max-duration must be a positive number');
if (flags.format && !['m4a', 'wav', 'both'].includes(flags.format)) fail('--format must be m4a, wav or both');
if (command === 'get' && !words.length) fail('Name at least one sound id, for example: get glass-click glass-success');

// ---------- catalog ----------
const source = flags.catalog || process.env.BETTER_SFX_CATALOG || DEFAULT_CATALOG;
const remote = /^https?:\/\//.test(source);

/** @returns {Promise<CatalogEntry[]>} */
async function loadCatalog() {
  let data;
  try {
    if (!remote) data = JSON.parse(readFileSync(source, 'utf8'));
    else {
      const res = await fetch(source, { signal: AbortSignal.timeout(30_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = await res.json();
    }
  } catch (e) {
    fail(`Could not load the Better SFX catalog from ${source}: ${e.message}`, { network: remote, retry: 'Check network access, or pass --catalog <path-or-url>.' });
  }
  if (!Array.isArray(data)) fail('Invalid catalog: expected an array of sounds.');
  const ids = new Set();
  for (const s of data) {
    if (!s || typeof s.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s.id) || ids.has(s.id)
      || !['name', 'category', 'description'].every(k => typeof s[k] === 'string')
      || !Array.isArray(s.tags) || !s.tags.every((/** @type {unknown} */ t) => typeof t === 'string')
      || !Number.isFinite(s.duration) || s.duration <= 0
      || !['synth', 'seed-audio'].includes(s.source)
      || (s.set !== undefined && (typeof s.set !== 'string' || typeof s.action !== 'string'))
      || !['wav', 'm4a'].every(ext => typeof s.files?.[ext] === 'string'
        && /^[a-zA-Z0-9_/-]+\.(wav|m4a)$/.test(s.files[ext]) && !s.files[ext].startsWith('/'))) {
      fail('Invalid catalog: malformed, duplicate, or unsafe sound entry.');
    }
    ids.add(s.id);
  }
  return data;
}

// File paths in the catalog are relative to the catalog itself.
/** @param {string} rel */
const fileRef = (rel) => (remote ? new URL(rel, source).href : resolve(dirname(source), rel));

/** @param {CatalogEntry} s */
function view(s) {
  return {
    id: s.id,
    name: s.name,
    category: s.category,
    ...(s.set ? { set: s.set, action: s.action } : {}),
    source: s.source === 'synth' ? 'code' : 'recording',
    duration: s.duration,
    description: s.description,
    tags: s.tags,
    page: `${SITE}/sound/${s.id}/`,
    wav: fileRef(s.files.wav),
    m4a: fileRef(s.files.m4a),
  };
}

// ---------- search ----------
// Each query word scores against the name, tags, category and description.
// Results that match every word rank above results that match some.
/** @param {CatalogEntry} s @param {string[]} terms @returns {number} */
function score(s, terms) {
  let total = 0;
  let hits = 0;
  for (const w of terms) {
    // A word the catalog uses scores in full. A feeling word from WORD_MAP
    // scores through its best translation, at three quarters weight, so a
    // literal match still ranks first.
    // Each further translation the sound also matches adds a little, so a
    // sound that is airy and shimmering outranks one that is only soft.
    // The cap keeps it below a literal tag match (4).
    let best = wordScore(s, w);
    const alts = translations(w).map((alt) => wordScore(s, alt)).filter(Boolean);
    if (alts.length) best = Math.max(best, Math.min(3.5, Math.max(...alts) * 0.75 + 0.25 * (alts.length - 1)));
    if (best) hits++;
    total += best;
  }
  return hits === terms.length ? total + 10 : total;
}

/** @param {CatalogEntry} s @param {string} w one lower-case word @returns {number} */
function wordScore(s, w) {
  const name = s.name.toLowerCase();
  const tags = s.tags.map((t) => t.toLowerCase());
  const cat = s.category.toLowerCase();
  const desc = s.description.toLowerCase();
  const stem = w.replace(/(es|s|y)$/, '');
  let best = 0;
  if (tags.includes(w)) best = Math.max(best, 4);
  if (name.split(/\s+/).includes(w)) best = Math.max(best, 4);
  if (tags.some((t) => t.startsWith(stem) && stem.length >= 3)) best = Math.max(best, 3);
  if (name.includes(stem) && stem.length >= 3) best = Math.max(best, 3);
  if (cat.includes(stem) && stem.length >= 3) best = Math.max(best, 2);
  if (desc.includes(stem) && stem.length >= 3) best = Math.max(best, 1);
  return best;
}

/** @param {CatalogEntry[]} catalog */
function filtered(catalog) {
  return catalog.filter((s) =>
    (!flags.category || s.category === flags.category) &&
    (!flags.set || s.set === flags.set) &&
    (!flags.source || (flags.source === 'code') === (s.source === 'synth')) &&
    (!flags['max-duration'] || s.duration <= Number(flags['max-duration'])));
}

// ---------- word map ----------
// Words people use for how a sound should feel, translated into the words
// the catalog's tags use. Every word on the right must be a catalog tag;
// `node scripts/sfx.mjs check-words` lists any that are not.
/** @type {Record<string, string[]>} */
const WORD_MAP = {
  // light and airy
  dreamy: ['airy', 'shimmer', 'sparkle', 'twinkle', 'glass', 'soft'],
  ethereal: ['airy', 'shimmer', 'glass', 'sparkle'],
  magical: ['magic', 'sparkle', 'twinkle', 'shimmer', 'fairy'],
  sparkly: ['sparkle', 'shimmer', 'twinkle'],
  glittery: ['sparkle', 'shimmer', 'twinkle'],
  // crisp and tactile
  punchy: ['crisp', 'sharp', 'thock', 'snap', 'deep', 'heavy'],
  snappy: ['snap', 'crisp', 'quick', 'sharp'],
  clicky: ['click', 'tick', 'crisp', 'tap'],
  thocky: ['thock', 'deep', 'mechanical'],
  tactile: ['tactile', 'press', 'physical', 'mechanical'],
  analog: ['mechanical', 'physical', 'tactile'],
  // soft and calm
  cozy: ['warm', 'soft', 'wood', 'mellow', 'gentle'],
  relaxing: ['calm', 'soft', 'gentle', 'mellow'],
  chill: ['calm', 'soft', 'mellow', 'gentle'],
  smooth: ['soft', 'gentle', 'airy', 'sweep'],
  unobtrusive: ['subtle', 'faint', 'minimal', 'soft'],
  tiny: ['tiny', 'micro', 'subtle', 'faint'],
  // bright and happy
  happy: ['cheerful', 'positive', 'playful', 'bright', 'rising'],
  joyful: ['cheerful', 'positive', 'bright', 'rising'],
  fun: ['playful', 'cartoon', 'bubbly', 'game'],
  cute: ['playful', 'bubbly', 'cartoon', 'pop'],
  silly: ['cartoon', 'wobble', 'playful'],
  bouncy: ['bounce', 'bubbly', 'playful', 'pop'],
  // big moments
  celebratory: ['celebrate', 'fanfare', 'achievement', 'reward', 'sparkle'],
  triumphant: ['fanfare', 'achievement', 'brass', 'reward'],
  win: ['success', 'reward', 'achievement', 'coin'],
  epic: ['cinematic', 'big', 'riser', 'tension', 'fanfare'],
  dramatic: ['cinematic', 'big', 'riser', 'tension'],
  loud: ['big', 'alarm', 'urgent', 'cinematic'],
  // dark and tense
  dark: ['low', 'deep', 'tension', 'dull', 'falling'],
  eerie: ['low', 'tension', 'falling', 'deep'],
  ominous: ['low', 'deep', 'tension'],
  tense: ['tension', 'riser', 'urgent'],
  sad: ['falling', 'low', 'calm'],
  aggressive: ['harsh', 'buzz', 'alarm', 'urgent', 'heavy'],
  negative: ['error', 'fail', 'denied', 'wrong', 'falling'],
  oops: ['error', 'wrong', 'invalid'],
  // polished
  premium: ['glass', 'crystal', 'bell', 'chime', 'clean'],
  elegant: ['glass', 'crystal', 'bell', 'chime', 'clean'],
  modern: ['minimal', 'clean', 'soft', 'glass'],
  sleek: ['minimal', 'clean', 'glass'],
  // tech and retro
  futuristic: ['digital', 'computing', 'sweep', 'metallic'],
  techy: ['digital', 'computing', 'blips', 'metallic'],
  robotic: ['digital', 'metallic', 'blips', 'computing'],
  nostalgic: ['retro', '8-bit', 'chiptune', 'vintage'],
  arcade: ['game', '8-bit', 'chiptune', 'retro'],
  // real-world
  natural: ['organic', 'wood', 'physical'],
  realistic: ['organic', 'physical', 'wood', 'paper'],
  wet: ['water', 'liquid', 'drip', 'droplet', 'bubble'],
  watery: ['water', 'liquid', 'drip', 'droplet'],
  weighty: ['heavy', 'deep', 'thud', 'thunk'],
  impact: ['thud', 'thump', 'knock', 'heavy'],
  typewriter: ['typing', 'keyboard', 'key', 'mechanical'],
  // sound words
  swish: ['swoosh', 'whoosh', 'swipe', 'air'],
  woosh: ['whoosh', 'swoosh'],
  boop: ['blip', 'pop', 'beep'],
  buzzer: ['buzz', 'error', 'alarm'],
  finish: ['complete', 'done'],
};

/** @param {string} word */
function translations(word) {
  return Object.hasOwn(WORD_MAP, word) ? WORD_MAP[word] : [];
}

// ---------- download ----------
/** @param {string} from URL or local path @param {string} to */
async function fetchTo(from, to) {
  if (!remote) return copyFileSync(from, to);
  const res = await fetch(from, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${from}`);
  writeFileSync(to, Buffer.from(await res.arrayBuffer()));
}

// ---------- commands ----------
const catalog = await loadCatalog();

if (command === 'search') {
  const terms = words.join(' ').toLowerCase().split(/[\s,]+/).filter(Boolean);
  const limit = Number(flags.limit || 8);
  let list = filtered(catalog);
  if (terms.length) {
    list = list.map((s) => ({ s, n: score(s, terms) })).filter((r) => r.n > 0).sort((a, b) => b.n - a.n).map((r) => r.s);
  }
  const results = list.slice(0, limit).map(view);
  // Show which feeling words were translated, so the agent can see why a
  // result matched.
  /** @type {Record<string, string[]>} */
  const expanded = {};
  for (const w of terms) {
    const alternatives = translations(w);
    if (alternatives.length) expanded[w] = alternatives;
  }
  log(`${results.length} of ${list.length} matching sounds`);
  console.log(JSON.stringify({ ok: true, query: terms.join(' '), ...(Object.keys(expanded).length ? { expanded } : {}), count: list.length, results }, null, 2));
} else if (command === 'check-words') {
  // Maintenance: every translation in WORD_MAP should be a catalog tag.
  const tags = new Set(catalog.flatMap((s) => s.tags.map((t) => t.toLowerCase())));
  const missing = Object.entries(WORD_MAP).flatMap(([k, v]) => v.filter((t) => !tags.has(t)).map((t) => `${k} -> ${t}`));
  console.log(JSON.stringify({ ok: missing.length === 0, words: Object.keys(WORD_MAP).length, missing }, null, 2));
  if (missing.length) process.exit(1);
} else if (command === 'sets') {
  /** @type {Record<string, { action?: string, id: string, duration: number }[]>} */
  const sets = {};
  for (const s of catalog) if (s.set) (sets[s.set] ??= []).push({ action: s.action, id: s.id, duration: s.duration });
  console.log(JSON.stringify({ ok: true, note: 'Each set covers the same actions in one voice. Use one set for a whole app.', sets }, null, 2));
} else if (command === 'categories') {
  /** @type {Record<string, number>} */
  const cats = {};
  for (const s of catalog) cats[s.category] = (cats[s.category] || 0) + 1;
  console.log(JSON.stringify({ ok: true, total: catalog.length, categories: cats }, null, 2));
} else if (command === 'get') {
  const format = /** @type {'m4a' | 'wav' | 'both'} */ (flags.format || 'm4a');
  /** @type {('m4a' | 'wav')[]} */
  const exts = format === 'both' ? ['m4a', 'wav'] : [format];
  const selected = words.map(id => {
    const s = catalog.find(x => x.id === id);
    if (!s) fail(`Unknown sound id "${id}". Run search to find ids.`);
    return s;
  });
  const dir = resolve(flags.dir || 'sounds');
  try { mkdirSync(dir, { recursive: true }); }
  catch (e) { fail(`Could not create download directory ${dir}: ${e.message}`); }
  /** @type {{ id: string, name: string, path: string, page: string }[]} */
  const files = [];
  /** @type {string[]} */
  const skipped = [];
  for (const s of selected) {
    const { id } = s;
    for (const ext of exts) {
      const to = join(dir, `${id}.${ext}`);
      if (existsSync(to) && !force) { skipped.push(to); continue; }
      log(`downloading ${id}.${ext}`);
      try { await fetchTo(fileRef(s.files[ext]), to); } catch (e) { fail(`Download failed for ${id}.${ext}: ${e.message}`, { network: remote }); }
      files.push({ id, name: s.name, path: to, page: `${SITE}/sound/${id}/` });
    }
  }
  if (skipped.length) log(`kept ${skipped.length} existing file(s); pass --force to replace them`);
  console.log(JSON.stringify({ ok: true, dir, files, skipped, license: LICENSE }, null, 2));
}
