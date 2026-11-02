// Local preview server for dist/. Loopback only, no dependencies.
// Usage: node src/serve.mjs [port]   (npm run dev regenerates the site first)
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const ROOT = resolve('dist');
const PORT = Number(process.argv[2] || process.env.PORT || 4321);
const HOST = '127.0.0.1';

/** @type {Record<string, string>} */
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml', '.wav': 'audio/wav', '.m4a': 'audio/mp4',
};

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? '/', `http://${HOST}`).pathname);
  // Resolve inside dist/ only, so ../ cannot reach other files.
  let file = normalize(join(ROOT, path));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end('Forbidden'); return; }
  try {
    if (statSync(file).isDirectory()) {
      // Match static hosts: /sound/x redirects to /sound/x/ so relative links work.
      if (!path.endsWith('/')) { res.writeHead(301, { Location: `${path}/` }).end(); return; }
      file = join(file, 'index.html');
    }
    const { size } = statSync(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', 'Content-Length': size, 'Cache-Control': 'no-store' });
    createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
  }
  console.log(`${req.method} ${path} ${res.statusCode}`);
}).listen(PORT, HOST, () => console.log(`Better SFX preview: http://${HOST}:${PORT}`));
