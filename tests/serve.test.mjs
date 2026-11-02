import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { request, createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

test('preview server contains paths and survives malformed URL encoding', async t => {
  const dir = mkdtempSync(join(tmpdir(), 'better-sfx-server-'));
  mkdirSync(join(dir, 'dist'));
  mkdirSync(join(dir, 'dist-private'));
  writeFileSync(join(dir, 'dist/index.html'), 'public');
  writeFileSync(join(dir, 'dist-private/private.txt'), 'private');
  // Reserve a free loopback port, then hand it to the child.
  const probe = createServer();
  await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = probe.address().port;
  await new Promise(resolve => probe.close(resolve));
  const child = spawn(process.execPath, [resolve('src/serve.mjs'), String(port)], { cwd: dir });
  t.after(() => { child.kill(); rmSync(dir, { recursive: true, force: true }); });
  await new Promise((resolve, reject) => {
    child.stdout.once('data', resolve);
    child.once('error', reject);
    child.once('exit', code => reject(new Error(`Server exited: ${code}`)));
  });
  const get = path => new Promise((resolve, reject) => {
    const req = request({ host: '127.0.0.1', port, path }, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.end();
  });
  assert.deepEqual(await get('/'), { status: 200, body: 'public' });
  assert.equal((await get('/..%2fdist-private/private.txt')).status, 403);
  assert.equal((await get('/%')).status, 400);
  assert.deepEqual(await get('/'), { status: 200, body: 'public' });
});
