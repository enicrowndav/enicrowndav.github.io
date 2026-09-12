import assert from 'node:assert/strict';
import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artifacts = path.join(root, '.artifacts');
await mkdir(artifacts, { recursive: true });
const results = [];
const errors = [];
const servers = [];
const record = (name, details = '') => { results.push({ name, status: 'passed', details }); console.log(`PASS ${name}${details ? ': ' + details : ''}`); };
async function startServer(port, basePath = '') {
  const server = spawn(process.execPath, ['scripts/serve.mjs', 'dist'], {
    cwd: root, env: { ...process.env, PORT: String(port), BASE_PATH: basePath }, stdio: 'pipe', windowsHide: true
  });
  servers.push(server);
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Preview server startup timed out')), 10000);
    server.stdout.once('data', () => { clearTimeout(timer); resolve(); });
    server.once('error', error => { clearTimeout(timer); reject(error); });
    server.once('exit', code => { if (code) { clearTimeout(timer); reject(new Error(`Server exited ${code}`)); } });
  });
}
let executablePath = process.env.CHROME_PATH;
if (!executablePath && process.platform === 'win32') {
  const candidate = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  try { await access(candidate); executablePath = candidate; } catch { /* Fall back to Playwright. */ }
}
let browser;
try {
  await startServer(4175);
  await startServer(4176, '/portfolio');
  browser = await chromium.launch({ executablePath, headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  const url = process.env.TEST_URL || 'http://127.0.0.1:4175/';
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('h1').innerText(), 'Turning data into\nbetter decisions.');
  assert.equal(await page.locator('.publication:visible').count(), 6);
  assert.equal(await page.locator('#enquiry-form').isVisible(), true);
  assert.equal(await page.locator('.cv-link').isVisible(), false);
  const academicFoundation = await page.locator('.education-card').innerText();
  assert.match(academicFoundation, /University of Portsmouth[\s\S]*PhD, Computing[\s\S]*Ongoing/i);
  assert.match(academicFoundation, /University of Ibadan[\s\S]*MSc, Biostatistics[\s\S]*BSc, Statistics/);
  assert.match(academicFoundation, /ALISON, Ireland[\s\S]*Diploma in Statistics/);
  assert(!/\b20\d{2}\b/.test(academicFoundation), 'Academic foundation must not display years');
  assert(await page.evaluate(() => [...document.images].every(image => image.complete && image.naturalWidth > 0)));
  assert(await page.evaluate(() => document.fonts.check('400 20px "Instrument Serif"') && document.fonts.check('400 20px "DM Sans"')));
  await page.screenshot({ path: path.join(artifacts, 'desktop-home.png'), fullPage: false });
  await page.screenshot({ path: path.join(artifacts, 'desktop-full.png'), fullPage: true });
  record('Desktop render and local assets');

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => ({ body: document.documentElement.scrollWidth, viewport: innerWidth }));
    assert(overflow.body <= overflow.viewport, `Horizontal overflow at ${width}: ${overflow.body}`);
    await page.screenshot({ path: path.join(artifacts, `width-${width}.png`), fullPage: width === 390 });
  }
  record('Responsive layouts', '320, 390, 768, 1024 and 1440 px; no horizontal overflow');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => scrollTo(0, 0));
  const menu = page.locator('.menu-toggle');
  await menu.click();
  assert.equal(await menu.getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  await menu.click();
  await page.locator('#main-nav').getByRole('link', { name: 'Research', exact: true }).click();
  assert(page.url().endsWith('#research'));
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  record('Mobile menu', 'open, Escape, anchor navigation and automatic close');

  for (const [filter, count] of [['methods', 4], ['infectious', 3], ['population', 4], ['all', 6]]) {
    await page.locator(`[data-filter="${filter}"]`).click();
    assert.equal(await page.locator('.publication:visible').count(), count);
    assert.equal(await page.locator(`[data-filter="${filter}"]`).getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('.filter[aria-pressed="true"]').count(), 1);
    assert((await page.locator('#publication-count').innerText()).includes(String(count)));
  }
  record('Publication filters', 'correct topic membership and accessible result counts');

  const thirdService = page.locator('.service').nth(2);
  await thirdService.locator('summary').click();
  await thirdService.locator('.service-cta').click();
  assert.equal(await page.locator('#enquiry-interest').inputValue(), 'Data systems & analytical tools');
  record('Service enquiry shortcuts');

  const submit = page.getByRole('button', { name: 'Prepare your enquiry' });
  await submit.click();
  assert.equal(await page.locator('#enquiry-dialog').isVisible(), false);
  await page.locator('#enquiry-name').fill('   ');
  await page.locator('#enquiry-email').fill('invalid-email');
  assert.equal(await page.locator('#enquiry-email').evaluate(input => input.validity.typeMismatch), true);
  await page.locator('#enquiry-email').fill('alex@example.org');
  await page.locator('#enquiry-message').fill('A meaningful project');
  await submit.click();
  assert.equal(await page.locator('#enquiry-dialog').isVisible(), false);
  await page.locator('#enquiry-name').fill('Alex & Research <Team>');
  await page.locator('#enquiry-timeline').selectOption('Within 1–3 months');
  const specialMessage = 'Please analyse our survey & report 95% CIs.\nQuestion: are A+B different? <script>example</script>';
  await page.locator('#enquiry-message').fill(specialMessage);
  await submit.click();
  assert.equal(await page.locator('#enquiry-dialog').isVisible(), true);
  assert((await page.locator('#enquiry-preview').inputValue()).includes(specialMessage));
  const href = await page.locator('#open-email').getAttribute('href');
  const mailto = new URL(href);
  assert.equal(mailto.protocol, 'mailto:');
  assert.equal(mailto.pathname, 'eniadetreasure@gmail.com');
  assert(mailto.searchParams.get('body').includes(specialMessage));
  assert(mailto.searchParams.get('subject').includes('Data systems & analytical tools'));
  assert.equal(await page.locator('#enquiry-dialog script').count(), 0);
  await page.screenshot({ path: path.join(artifacts, 'mobile-enquiry.png') });
  const modalAudit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  await writeFile(path.join(artifacts, 'accessibility-dialog.json'), JSON.stringify(modalAudit.violations, null, 2));
  assert.equal(modalAudit.violations.length, 0, `Dialog accessibility: ${JSON.stringify(modalAudit.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })))}`);
  await page.locator('#copy-enquiry').click();
  await page.waitForFunction(() => document.querySelector('#enquiry-status').textContent.trim().length > 0);
  assert.match(await page.locator('#enquiry-status').innerText(), /copied|Copy was unavailable/);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#enquiry-dialog').isVisible(), false);
  assert.equal(await page.locator('#enquiry-name').inputValue(), 'Alex & Research <Team>');
  record('Enquiry validation and preview', 'empty/whitespace rejection, safe text, encoded mailto, copy fallback, Escape and retained inputs');

  await page.locator('.copy-email').click();
  await page.waitForFunction(() => document.querySelector('.copy-status').textContent.trim().length > 0);
  assert.match(await page.locator('.copy-status').innerText(), /copied|select and copy/);
  record('Copy contact email');

  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    await writeFile(path.join(artifacts, `accessibility-${width}.json`), JSON.stringify(audit.violations, null, 2));
    assert.equal(audit.violations.length, 0, `Accessibility at ${width}: ${JSON.stringify(audit.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })))}`);
  }
  record('Automated accessibility', 'zero WCAG A/AA rule violations at desktop, mobile and enquiry dialog');

  const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const noJSPage = await noJS.newPage();
  await noJSPage.goto(url);
  assert.equal(await noJSPage.locator('.publication:visible').count(), 6);
  assert.equal(await noJSPage.locator('#main-nav').isVisible(), true);
  assert.equal(await noJSPage.locator('.no-script-contact').isVisible(), true);
  assert.equal(await noJSPage.locator('#enquiry-form').isVisible(), false);
  await noJS.close();
  record('No-JavaScript mobile fallback', 'navigation, content, publications and direct email remain available');

  await page.goto('http://127.0.0.1:4176/portfolio/', { waitUntil: 'networkidle' });
  assert.equal(await page.locator('h1').count(), 1);
  assert(await page.evaluate(() => [...document.images].every(image => image.complete && image.naturalWidth > 0)));
  await page.locator('[data-filter="infectious"]').click();
  assert.equal(await page.locator('.publication:visible').count(), 3);
  record('GitHub project-path compatibility', 'assets and interactions work under /portfolio/');

  await page.goto(pathToFileURL(path.join(root, 'index.html')).href, { waitUntil: 'load' });
  assert.equal(await page.locator('#enquiry-form').isVisible(), true);
  await page.locator('[data-filter="methods"]').click();
  assert.equal(await page.locator('.publication:visible').count(), 4);
  record('Double-click local-file launch');
  assert.equal(errors.length, 0, `Browser console or HTTP errors: ${errors.join('; ')}`);
  record('Browser errors', 'zero page errors or failed asset responses');
} catch (error) {
  results.push({ name: 'Failure', status: 'failed', details: error.stack });
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser?.close();
  for (const server of servers) server.kill();
  await writeFile(path.join(artifacts, 'browser-results.json'), JSON.stringify({ timestamp: new Date().toISOString(), results, errors }, null, 2));
}
