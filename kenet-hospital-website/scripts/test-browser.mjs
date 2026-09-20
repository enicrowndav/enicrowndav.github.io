import { chromium } from '../../node_modules/playwright/index.mjs';
import AxeBuilder from '../../node_modules/@axe-core/playwright/dist/index.js';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const artifacts = path.resolve(root, '.artifacts');
await mkdir(artifacts, { recursive: true });
const server = spawn('python', ['-m', 'http.server', '4174'], { cwd: root, stdio: 'ignore' });
await new Promise((resolve) => setTimeout(resolve, 900));
const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
});

try {
  for (const viewport of [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto('http://127.0.0.1:4174', { waitUntil: 'networkidle' });
    if (!response?.ok()) throw new Error(`${viewport.name}: page returned ${response?.status()}`);
    await page.screenshot({ path: path.join(artifacts, `${viewport.name}.png`), fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    if (overflow) throw new Error(`${viewport.name}: horizontal overflow detected`);
    if (viewport.name === 'mobile') {
      await page.locator('[data-menu-toggle]').click();
      if (await page.locator('[data-menu-toggle]').getAttribute('aria-expanded') !== 'true') throw new Error('Mobile menu did not open');
      await page.locator('[data-menu] a[href="#services"]').click();
    }
    await page.locator('#appointment').scrollIntoViewIfNeeded();
    await page.locator('[data-appointment-form] button[type="submit"]').click();
    if (!(await page.locator('.field.has-error').count())) throw new Error(`${viewport.name}: form validation did not run`);
    const a11y = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    if (a11y.violations.length) {
      const detail = a11y.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(' | ')}`).join('; ');
      throw new Error(`${viewport.name}: accessibility violations: ${detail}`);
    }
    if (errors.length) throw new Error(`${viewport.name}: browser errors: ${errors.join(' | ')}`);
    console.log(`${viewport.name}: OK`);
    await context.close();
  }
} finally {
  await browser.close();
  server.kill();
}
