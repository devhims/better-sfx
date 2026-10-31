// Finishes a downloaded audio file: node src/finish-file.mjs in.wav out.wav [all|single]
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { SR, trim, level, wav16 } from './finish.mjs';

const [inPath, outPath, mode = 'all'] = process.argv.slice(2);
const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', inPath, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
const y = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4).slice();
const out = level(trim(y, { mode }), { fadeOutMs: mode === 'single' ? 15 : 25 });
writeFileSync(outPath, wav16(out));
console.log(`${outPath}\t${(out.length / SR).toFixed(2)}s`);
