import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin = process.env.SITE_URL || 'https://textnest.pages.dev';
const routes = ['/', '/guide/', '/about/', '/privacy/', '/guides/character-count/', '/guides/spacing/', '/guides/replace/', '/guides/writing-checklist/', '/ads.txt', '/sitemap.xml', '/robots.txt', '/app.mjs', '/core.mjs', '/style.css', '/favicon.svg'];
for (const route of routes) {
  const res = await fetch(origin + route, { signal: AbortSignal.timeout(20000) });
  assert.equal(res.status, 200, route);
  const text = await res.text();
  const file = 'dist' + route + (route.endsWith('/') ? 'index.html' : '');
  assert.equal(text, await fs.readFile(file, 'utf8'), `Live content differs: ${route}`);
  if (route.endsWith('.mjs')) assert.match(res.headers.get('content-type'), /javascript/);
  console.log(`200 verified ${route}`);
}
const notFound = await fetch(origin + '/this-page-does-not-exist', { signal: AbortSignal.timeout(20000) });
assert.equal(notFound.status, 404);
assert.ok(!(await notFound.text()).includes('adsbygoogle.js'));
console.log('PASS: all 15 live routes match the built files; missing page returns 404 without ads.');
