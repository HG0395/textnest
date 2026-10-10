import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = path.resolve('dist');
async function list(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? list(path.join(dir, e.name)) : path.join(dir, e.name)))).flat();
}
const files = await list(root);
let links = 0;
for (const file of files.filter(f => f.endsWith('.html'))) {
  const html = await fs.readFile(file, 'utf8');
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `One h1: ${file}`);
  const is404 = file.endsWith('404.html');
  assert.equal(html.includes('adsbygoogle.js?client=ca-pub-2685311477810917'), !is404);
  assert.equal(html.includes('name="google-adsense-account"'), !is404);
  for (const match of html.matchAll(/(?:href|src)="([^" ]+)"/g)) {
    const url = match[1];
    if (!url.startsWith('/') && !url.startsWith('#')) continue;
    const [pathname, anchor] = url.split('#');
    const target = pathname ? path.join(root, pathname, pathname.endsWith('/') ? 'index.html' : '') : file;
    const body = await fs.readFile(target, 'utf8');
    if (anchor) assert.ok(body.includes(`id="${anchor}"`), `Missing anchor ${url} in ${file}`);
    links++;
  }
}
assert.equal((await fs.readFile(path.join(root, 'ads.txt'), 'utf8')).trim(), 'google.com, pub-2685311477810917, DIRECT, f08c47fec0942fa0');
assert.equal(files.filter(f => f.endsWith('.html')).length, 9);
console.log(`PASS: 9 HTML pages, ${links} internal links/assets/anchors, AdSense tags, ad-free 404, and ads.txt.`);
