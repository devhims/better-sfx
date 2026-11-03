import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, readdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

const script = resolve('skills/better-sfx/scripts/sfx.mjs');
const catalog = resolve('dist/catalog.json');
const entries = JSON.parse(readFileSync(catalog, 'utf8'));

function run(args, source = catalog) {
  const result = spawnSync(process.execPath, [script, ...args, '--catalog', source], { encoding: 'utf8' });
  return { status: result.status, data: JSON.parse(result.stdout) };
}

function temporary(t) {
  const dir = mkdtempSync(join(tmpdir(), 'better-sfx-test-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test('search finds the documented example and combines filters', () => {
  const result = run(['search', 'soft', 'glassy', 'success', '--limit', '3']);
  assert.equal(result.status, 0);
  assert.equal(result.data.results[0].id, 'glass-success');
  const filtered = run(['search', '--set', 'wood', '--source', 'code', '--max-duration', '0.5', '--limit', '100']);
  assert.ok(filtered.data.results.length > 0);
  assert.ok(filtered.data.results.every(s => s.set === 'wood' && s.source === 'code' && s.duration <= 0.5));
  assert.equal(run(['search', 'zzznomatchzzz']).data.count, 0);
  const literal = run(['search', 'constructor']);
  assert.equal(literal.status, 0);
  assert.equal(literal.data.expanded, undefined);
});

test('the skill index leads to scoped guides that agree with the catalog', () => {
  const skill = resolve('skills/better-sfx');
  const index = readFileSync(join(skill, 'SKILL.md'), 'utf8');
  const guides = [...index.matchAll(/\]\(references\/categories\/([^()]+\.md)\)/g)].map(match => match[1]);
  const directory = join(skill, 'references/categories');
  const categories = [...new Set(entries.map(s => s.category))];
  assert.deepEqual(guides.sort(), categories.map(c => c.replaceAll(' ', '-') + '.md').sort());
  assert.deepEqual(readdirSync(directory).sort(), guides);
  const byId = new Map(entries.map(s => [s.id, s]));
  for (const category of categories) {
    const guide = readFileSync(join(directory, category.replaceAll(' ', '-') + '.md'), 'utf8');
    const rows = [...guide.matchAll(/^- `([^`]+)` \(([^)]+)s\)\. (.+)$/gm)];
    const ids = rows.map(row => row[1]);
    assert.equal(new Set(ids).size, ids.length);
    assert.deepEqual(ids.filter(id => byId.get(id)?.category === category),
      entries.filter(s => s.category === category).map(s => s.id));
    for (const [, id, seconds, description] of rows) {
      const sound = byId.get(id);
      assert.equal(sound.duration, Number(seconds));
      assert.equal(sound.description, description);
      assert.ok(!index.includes(description));
    }
    if (category === 'toggles') {
      assert.deepEqual(ids, entries.filter(s => s.category === 'toggles' || s.action === 'toggle').map(s => s.id));
    }
  }
});

test('all five sets contain the same ten actions and categories cover the library', () => {
  const sets = Object.values(run(['sets']).data.sets);
  assert.equal(sets.length, 5);
  const actions = sets[0].map(s => s.action).sort();
  assert.equal(new Set(actions).size, 10);
  for (const set of sets) assert.deepEqual(set.map(s => s.action).sort(), actions);
  const result = run(['categories']).data;
  assert.equal(result.total, entries.length);
  assert.equal(Object.values(result.categories).reduce((a, b) => a + b, 0), entries.length);
});

test('downloads both formats, preserves existing files, and replaces only with force', t => {
  const dir = temporary(t);
  const args = ['get', 'glass-success', 'swoosh-fast', '--format', 'both', '--dir', dir];
  const first = run(args);
  assert.equal(first.status, 0);
  assert.equal(first.data.files.length, 4);
  for (const file of first.data.files) {
    assert.deepEqual(readFileSync(file.path), readFileSync(resolve('dist/sounds', file.path.split(/[\\/]/).at(-1))));
  }
  const target = join(dir, 'glass-success.m4a');
  writeFileSync(target, 'user edit');
  assert.equal(run(args).data.skipped.length, 4);
  assert.equal(readFileSync(target, 'utf8'), 'user edit');
  assert.equal(run([...args, '--force']).data.files.length, 4);
  assert.deepEqual(readFileSync(target), readFileSync('dist/sounds/glass-success.m4a'));
});

test('invalid arguments fail before trying the network', () => {
  for (const args of [
    ['search', '--source', 'typo'], ['search', '--limit', '-1'],
    ['search', '--limit', 'nope'], ['search', '--limit', '1.5'],
    ['search', '--max-duration', 'NaN'], ['search', '--set'],
    ['search', '--unknown', 'x'], ['get', 'glass-click', '--format', 'mp3'],
    ['nonsense'],
  ]) {
    const result = run(args, 'http://127.0.0.1:1/catalog.json');
    assert.equal(result.status, 1, JSON.stringify(args));
    assert.equal(result.data.ok, false);
    assert.notEqual(result.data.network, true, JSON.stringify(args));
  }
});

test('help works without fetching a catalog', () => {
  const result = run(['--help'], 'http://127.0.0.1:1/catalog.json');
  assert.equal(result.status, 0);
  assert.equal(result.data.ok, true);
  assert.match(result.data.usage, /search/);
});

test('unknown ids are checked before any files are written', t => {
  const dir = join(temporary(t), 'sounds');
  const result = run(['get', 'glass-click', 'missing-sound', '--dir', dir]);
  assert.equal(result.status, 1);
  assert.equal(existsSync(join(dir, 'glass-click.m4a')), false);
});

test('malformed and unsafe catalogs return JSON errors', t => {
  const dir = temporary(t);
  const source = join(dir, 'catalog.json');
  for (const value of [{}, [null], [{ ...entries[0], id: '../outside' }], [{ ...entries[0], tags: null }]]) {
    writeFileSync(source, JSON.stringify(value));
    const result = run(['search'], source);
    assert.equal(result.status, 1);
    assert.equal(result.data.ok, false);
  }
});

test('filesystem errors are reported as JSON', t => {
  const dir = join(temporary(t), 'not-a-directory');
  writeFileSync(dir, 'keep me');
  const result = run(['get', 'glass-click', '--dir', dir]);
  assert.equal(result.status, 1);
  assert.equal(result.data.ok, false);
  assert.equal(readFileSync(dir, 'utf8'), 'keep me');
});

const reference = readFileSync('skills/better-sfx/references/web.md', 'utf8');
const snippets = [...reference.matchAll(/```js\n([\s\S]*?)```/g)].map(m => m[1].replaceAll('export ', ''));

test('web helpers can be imported and called during server rendering', async () => {
  const context = vm.createContext({});
  for (const snippet of snippets) vm.runInContext(snippet, context);
  vm.runInContext("playSfx('/sounds/click.m4a'); setSfxMuted(true);", context);
  await vm.runInContext("playFast('/sounds/click.m4a')", context);
});

test('both web helpers respect mute before creating or loading audio', async () => {
  const context = vm.createContext({ window: {}, localStorage: { getItem: () => '1', setItem() {} } });
  for (const snippet of snippets) vm.runInContext(snippet, context);
  vm.runInContext("playSfx('/sounds/click.m4a')", context);
  await vm.runInContext("playFast('/sounds/click.m4a')", context);
});

test('unavailable browser storage does not break the action handler', () => {
  const context = vm.createContext({ window: {}, Audio: class {
    cloneNode() { return { play: () => Promise.resolve() }; }
  } });
  Object.defineProperty(context, 'localStorage', { get() { throw new Error('SecurityError'); } });
  vm.runInContext(snippets[0], context);
  vm.runInContext("playSfx('/sounds/click.m4a'); setSfxMuted(true); playSfx('/sounds/click.m4a');", context);
});
