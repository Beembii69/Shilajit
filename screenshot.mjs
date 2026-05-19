import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const url    = process.argv[2] || 'http://localhost:3000';
const mode   = process.argv[3] || 'desktop'; // 'desktop' | 'mobile'
const label  = process.argv[4] ? `-${process.argv[4]}` : '';

const viewports = {
  desktop: { width: 1440, height: 900 },
  mobile:  { width: 390,  height: 844, isMobile: true, hasTouch: true }, // iPhone 14 size
};

const vp = viewports[mode] || viewports.desktop;

const existing = fs.readdirSync(dir).filter(f => f.startsWith('screenshot-') && f.endsWith('.png'));
const nums = existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] || '0')).filter(Boolean);
const n = nums.length ? Math.max(...nums) + 1 : 1;
const file = path.join(dir, `screenshot-${n}-${mode}${label}.png`);

const browser = await puppeteer.launch({
  executablePath: 'C:/Users/Enkht/.cache/puppeteer/chrome/win64-131.0.6778.204/chrome-win64/chrome.exe',
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport(vp);
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await page.screenshot({ path: file, fullPage: true });
await browser.close();

console.log(`Saved: ${file}`);
