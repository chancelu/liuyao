import { chromium } from 'playwright';

const pages = [
  { url: 'http://localhost:3100', name: 'home-v3' },
  { url: 'http://localhost:3100/cast', name: 'cast-v3' },
];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  for (const p of pages) {
    const page = await ctx.newPage();
    await page.goto(p.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `D:/openclaw/workspace/liuyao-${p.name}.png`, fullPage: true });
    console.log(`✓ ${p.name}`);
    await page.close();
  }

  await browser.close();
  console.log('Done');
})();
