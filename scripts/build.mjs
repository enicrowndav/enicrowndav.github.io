import { cp, mkdir, readFile, writeFile, rm, lstat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(root, 'dist');
if (path.dirname(output) !== root || path.basename(output) !== 'dist') throw new Error('Unsafe output path.');
try {
  const info = await lstat(output);
  if (info.isSymbolicLink()) throw new Error('Refusing to replace a linked output directory.');
  await rm(output, { recursive: true });
} catch (error) { if (error.code !== 'ENOENT') throw error; }
await mkdir(output);
const config = JSON.parse(await readFile(path.join(root, 'site.config.json'), 'utf8'));
let siteUrl = config.siteUrl;
if (config.customDomain) {
  if (!/^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(config.customDomain)) throw new Error('customDomain must be a hostname, without https:// or a path.');
  siteUrl = `https://${config.customDomain}/`;
}
const url = new URL(siteUrl);
if (url.protocol !== 'https:') throw new Error('siteUrl must use HTTPS.');
siteUrl = siteUrl.replace(/\/?$/, '/');
if (!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(config.email)) throw new Error('Enter a valid public email.');
for (const item of ['assets', 'styles.css', 'app.js', '404.html']) {
  await cp(path.join(root, item), path.join(output, item), { recursive: true });
}
let html = await readFile(path.join(root, 'index.html'), 'utf8');
html = html.replaceAll('https://enicrowndav.github.io/', siteUrl);
const escapeHTML = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
html = html.replaceAll('eniadetreasure@gmail.com', escapeHTML(config.email));
// Only public settings are included; raw research source snapshots are never deployed.
const publicConfig = JSON.stringify({ email: config.email, cvPath: config.cvPath }).replaceAll('<', '\\u003c');
html = html.replace('<script src="app.js" defer></script>', `<script>window.PORTFOLIO_CONFIG=${publicConfig};</script>\n  <script src="app.js" defer></script>`);
if (config.cvPath) {
  const source = path.resolve(root, config.cvPath);
  if (!source.startsWith(root + path.sep) || !/^assets\/[a-zA-Z0-9_./-]+\.pdf$/.test(config.cvPath)) throw new Error('cvPath must point to a PDF inside assets/.');
  await lstat(source);
}
await writeFile(path.join(output, 'index.html'), html);
await writeFile(path.join(output, '.nojekyll'), '');
await writeFile(path.join(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}sitemap.xml\n`);
await writeFile(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escapeHTML(siteUrl)}</loc></url></urlset>\n`);
await writeFile(path.join(output, '404.html'), (await readFile(path.join(output, '404.html'), 'utf8')).replace('https://enicrowndav.github.io/', siteUrl));
if (config.customDomain) await writeFile(path.join(output, 'CNAME'), `${config.customDomain}\n`);
console.log(`Built portfolio in ${output}\nCanonical URL: ${siteUrl}`);
