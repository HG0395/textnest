import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('dist');
http.createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.resolve(root, '.' + pathname);
    if (!file.startsWith(root + path.sep) && file !== root) throw Error('path');
    if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
    const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.mjs': 'text/javascript', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(await fs.readFile(file));
  } catch { res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(await fs.readFile(path.join(root, '404.html'))); }
}).listen(4178, '127.0.0.1', () => console.log('Local: http://127.0.0.1:4178'));
