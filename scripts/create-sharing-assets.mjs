import { chromium } from 'playwright';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let executablePath = process.env.CHROME_PATH;
if (!executablePath && process.platform === 'win32') {
  const candidate = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  try { await access(candidate); executablePath = candidate; } catch { /* Use Playwright Chromium. */ }
}
const browser = await chromium.launch({ executablePath, headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.join(root, 'scripts/social-card.html')).href);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(root, 'assets/social-preview.png') });
  await page.setViewportSize({ width: 180, height: 180 });
  await page.setContent('<html><body style="margin:0;background:#173e35"><svg width="180" height="180" xmlns="http://www.w3.org/2000/svg"><rect width="180" height="180" rx="36" fill="#173e35"/><text x="90" y="122" fill="#f8f7f2" text-anchor="middle" font-family="Georgia,serif" font-size="104">oe.</text></svg></body></html>');
  await page.screenshot({ path: path.join(root, 'assets/apple-touch-icon.png') });
  console.log('Created social preview and touch icon.');
} finally { await browser.close(); }
