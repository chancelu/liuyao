import { chromium } from 'playwright';

async function ensureStyled(page) {
  await page.waitForFunction(() => {
    const el = document.querySelector('body');
    if (!el) return false;
    const bg = getComputedStyle(document.body).backgroundColor;
    const cls = document.querySelector('.bg-atmosphere');
    return !!cls && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent';
  }, { timeout: 15000 });
}

const pages = [
  { url: 'http://localhost:3100', name: 'home-v4' },
  { url: 'http://localhost:3100/cast', name: 'cast-v4' },
];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  for (const p of pages) {
    const page = await ctx.newPage();
    await page.goto(p.url, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await ensureStyled(page);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `D:/openclaw/workspace/liuyao-${p.name}.png`, fullPage: true });
    console.log(`✓ ${p.name}`);
    await page.close();
  }

  await browser.close();
  console.log('Done');
})();
