#!/usr/bin/env node
// Better SFX helper for agents. Node 18+, no dependencies.
// JSON goes to stdout, status messages to stderr.
//
//   node scripts/sfx.mjs search <words...> [--category c] [--set s] [--source code|recording] [--max-duration s] [--limit n]
//   node scripts/sfx.mjs sets
//   node scripts/sfx.mjs categories
//   node scripts/sfx.mjs get <id...> [--dir sounds] [--format m4a|wav|both] [--force]
//
// Every command accepts --catalog <url|path>, also read from BETTER_SFX_CATALOG.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

/** @typedef {import('./catalog.js').CatalogEntry} CatalogEntry */

const DEFAULT_CATALOG = 'https://sfx.video2ctx.dev/catalog.json';
const SITE = 'https://sfx.video2ctx.dev';
const LICENSE = 'Free and royalty-free for personal and commercial use. No credit required. Do not resell or redistribute the sounds on their own. https://sfx.video2ctx.dev/license/';

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
/** @type {Record<string, string>} */
const flags = {};
let force = false;
/** @type {string[]} */
const words = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--force') force = true;
  else if (a.startsWith('--')) flags[a.slice(2)] = argv[++i];
  else words.push(a);
}

// ---------- catalog ----------
const source = flags.catalog || process.env.BETTER_SFX_CATALOG || DEFAULT_CATALOG;
const remote = /^https?:\/\//.test(source);

/** @returns {Promise<CatalogEntry[]>} */
async function loadCatalog() {
  try {
    if (!remote) return JSON.parse(readFileSync(source, 'utf8'));
    const res = await fetch(source);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    fail(`Could not load the Better SFX catalog from ${source}: ${e.message}`, { network: remote, retry: 'Check network access, or pass --catalog <path-or-url>.' });
  }
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
  const name = s.name.toLowerCase();
  const tags = s.tags.map((t) => t.toLowerCase());
  const cat = s.category.toLowerCase();
  const desc = s.description.toLowerCase();
  let total = 0;
  let hits = 0;
  for (const w of terms) {
    const stem = w.replace(/(es|s|y)$/, '');
    let best = 0;
    if (tags.includes(w)) best = Math.max(best, 4);
    if (name.split(/\s+/).includes(w)) best = Math.max(best, 4);
    if (tags.some((t) => t.startsWith(stem) && stem.length >= 3)) best = Math.max(best, 3);
    if (name.includes(stem) && stem.length >= 3) best = Math.max(best, 3);
    if (cat.includes(stem) && stem.length >= 3) best = Math.max(best, 2);
    if (desc.includes(stem) && stem.length >= 3) best = Math.max(best, 1);
    if (best) hits++;
    total += best;
  }
  return hits === terms.length ? total + 10 : total;
}

/** @param {CatalogEntry[]} catalog */
function filtered(catalog) {
  return catalog.filter((s) =>
    (!flags.category || s.category === flags.category) &&
    (!flags.set || s.set === flags.set) &&
    (!flags.source || (flags.source === 'code') === (s.source === 'synth')) &&
    (!flags['max-duration'] || s.duration <= Number(flags['max-duration'])));
}

// ---------- download ----------
/** @param {string} from URL or local path @param {string} to */
async function fetchTo(from, to) {
  if (!remote) return copyFileSync(from, to);
  const res = await fetch(from);
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
  log(`${results.length} of ${list.length} matching sounds`);
  console.log(JSON.stringify({ ok: true, query: terms.join(' '), count: list.length, results }, null, 2));
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
  if (!words.length) fail('Name at least one sound id, for example: get glass-click glass-success');
  const format = flags.format || 'm4a';
  const exts = format === 'both' ? ['m4a', 'wav'] : [format];
  if (!exts.every((e) => e === 'm4a' || e === 'wav')) fail('--format must be m4a, wav or both');
  const dir = resolve(flags.dir || 'sounds');
  mkdirSync(dir, { recursive: true });
  /** @type {{ id: string, name: string, path: string, page: string }[]} */
  const files = [];
  /** @type {string[]} */
  const skipped = [];
  for (const id of words) {
    const s = catalog.find((x) => x.id === id);
    if (!s) fail(`Unknown sound id "${id}". Run search to find ids.`);
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
} else {
  console.error(readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 11).join('\n').replace(/^\/\/ ?/gm, ''));
  process.exit(command ? 1 : 0);
}
