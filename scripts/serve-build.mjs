import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.pdf': 'application/pdf' };
export async function serve(root) {
  const server = createServer(async (req, res) => {
    try {
      let path = join(root, decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
      if ((await stat(path)).isDirectory()) path = join(path, 'index.html');
      res.setHeader('Content-Type', mime[extname(path)] || 'application/octet-stream');
      res.end(await readFile(path));
    } catch { res.statusCode = 404; res.end('Not found'); }
  });
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  return { server, url: `http://127.0.0.1:${server.address().port}` };
}
