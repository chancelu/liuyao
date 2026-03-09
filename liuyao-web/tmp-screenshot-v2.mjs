import { chromium } from 'playwright';

const pages = [
  { url: 'http://localhost:3100', name: 'home' },
  { url: 'http://localhost:3100/cast', name: 'cast' },
];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  
  for (const p of pages) {
    const page = await ctx.newPage();
    await page.goto(p.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `D:/openclaw/workspace/liuyao-${p.name}-v2.png`, fullPage: true });
    console.log(`✓ ${p.name}`);
    await page.close();
  }
  
  await browser.close();
  console.log('Done');
})();
