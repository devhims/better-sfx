// Generates every Seed Audio prompt that has no recording yet.
// Usage: node src/generate-seed.mjs [id ...]   (ids = make new takes of those)
//
// recordings/<id>.flac is the take the build uses, and it is committed.
// out/seed-raw/ keeps the downloaded WAV and the job record. It is not
// committed, because the job record holds account-specific URLs.
import { execFile, execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { promisify } from 'node:util';
import { seedPrompts } from './seed-prompts.mjs';

const run = promisify(execFile);
const RAW = 'out/seed-raw';
const KEEP = 'recordings';
mkdirSync(RAW, { recursive: true });
mkdirSync(KEEP, { recursive: true });

const ids = process.argv.slice(2);
const todo = seedPrompts.filter((p) => (ids.length ? ids.includes(p.id) : !existsSync(`${KEEP}/${p.id}.flac`)));

/** @param {import('../types/sfx.js').SeedPrompt} p */
async function one(p) {
  const { stdout } = await run('higgsfield', ['generate', 'create', 'seed_audio', '--prompt', p.prompt, '--sample_rate', '48000', '--format', 'wav', '--wait', '--json'], { maxBuffer: 1 << 24 });
  const job = JSON.parse(stdout)[0];
  if (job.status !== 'completed') throw new Error(`${p.id}: ${job.status}`);
  writeFileSync(`${RAW}/${p.id}.json`, JSON.stringify(job, null, 2));
  const res = await fetch(job.result_url);
  writeFileSync(`${RAW}/${p.id}.wav`, Buffer.from(await res.arrayBuffer()));
  // Lossless copy for the repo, a quarter of the WAV's size.
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', `${RAW}/${p.id}.wav`, '-c:a', 'flac', '-compression_level', '8', `${KEEP}/${p.id}.flac`]);
  console.log(`ok\t${p.id}`);
}

const queue = [...todo];
// Parallel submits get refused by Higgsfield, so the default is one at a time.
const workers = Number(process.env.CONCURRENCY || 1);
await Promise.all(Array.from({ length: workers }, async () => {
  while (queue.length) {
    const p = queue.shift();
    if (!p) break;
    try { await one(p); } catch (e) { console.log(`fail\t${p.id}\t${(e.stderr || e.message).trim().split('\n').slice(-1)[0]}`); }
  }
}));
