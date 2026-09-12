import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(path.join(root, 'dist/index.html'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(new Set(ids).size, ids.length, 'HTML IDs must be unique');
for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(id), `Missing anchor #${id}`);
for (const [, asset] of html.matchAll(/(?:src|href)="((?:assets\/|app\.js|styles\.css)[^"]*)"/g)) await stat(path.join(root, 'dist', asset));
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'One page title is required');
assert.equal((html.match(/class="publication"/g) || []).length, 6, 'Expected six selected publications');
assert(!/TODO|Lorem ipsum|YOUR_DOMAIN|example\.com/.test(html), 'No placeholder copy in the live page');
assert(html.includes('Nothing has been sent yet.'), 'Enquiry flow must disclose send status');
assert(!html.includes('PhD'), 'Unconfirmed doctoral status must not be published');
assert(!(await readFile(path.join(root, 'dist/sitemap.xml'), 'utf8')).includes('undefined'));
console.log('Content, local assets, anchors, publication count and build checks passed.');
