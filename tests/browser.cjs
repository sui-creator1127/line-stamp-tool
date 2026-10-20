const { chromium } = require('playwright');
const { createCanvas } = require('@napi-rs/canvas');
const JSZip = require('jszip');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs/promises');
const handler = require('../scripts/serve.cjs');

async function ready(page, count) {
  await page.waitForFunction(n => document.querySelectorAll('.card').length === n && !document.querySelector('#zip').disabled, count);
}

(async () => {
  const server = http.createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
      args: ['--no-sandbox'],
    });
    const origin = `http://127.0.0.1:${server.address().port}`;
    const fixture = createCanvas(1000, 1000);
    const ctx = fixture.getContext('2d');
    ctx.fillStyle = '#f8e7c6';
    ctx.fillRect(0, 0, 1000, 1000);
    ctx.fillStyle = '#275e48';
    ctx.fillRect(120, 120, 120, 120);
    for (const width of [1366, 393]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: width === 393, isMobile: width === 393, acceptDownloads: true });
      try {
        const page = await context.newPage();
        const errors = [], requests = [];
        page.on('pageerror', e => errors.push(e.message));
        page.on('request', r => { if (/^https?:/.test(r.url())) requests.push({ url: r.url(), method: r.method() }); });
        await page.goto(origin + '/line-stamp-tool/');
        await page.waitForLoadState('networkidle');
        assert(requests.every(r => r.url.startsWith(origin + '/') && r.method === 'GET'), 'Only same-origin static files may load');
        requests.length = 0;
        await page.locator('#file').setInputFiles({ name: 'test.png', mimeType: 'image/png', buffer: fixture.toBuffer('image/png') });
        await ready(page, 16);
        for (const format of ['2,4', '4,2']) {
          await page.selectOption('#preset', format);
          await ready(page, 8);
        }
        await page.locator('summary').click();
        await page.locator('#lines input').first().fill('260');
        await page.locator('#lines input').first().dispatchEvent('change');
        await ready(page, 8);
        assert.match(await page.locator('.cardbody span').first().textContent(), /300 × 540/);
        const line = page.locator('.line.v').first();
        await line.scrollIntoViewIfNeeded();
        const box = await line.boundingBox();
        const dragY = Math.max(60, Math.min(800, box.y + 50));
        await page.mouse.move(box.x + 1, dragY);
        await page.mouse.down();
        await page.mouse.move(box.x + 12, dragY, { steps: 5 });
        await page.mouse.up();
        await ready(page, 8);
        assert(+(await page.locator('#lines input').first().inputValue()) > 260, 'Dragging moves the boundary');
        await page.locator('.card button').first().click();
        await page.fill('#bw', '270');
        await page.click('#apply');
        await ready(page, 8);
        await page.fill('#pad', '35');
        await page.dispatchEvent('#pad', 'input');
        await ready(page, 8);
        assert.match(await page.locator('.cardbody span').first().textContent(), /340 × 570/);
        const [png] = await Promise.all([page.waitForEvent('download'), page.locator('.card button').nth(1).click()]);
        assert.equal(png.suggestedFilename(), 'stamp_01.png');
        const pngBytes = await fs.readFile(await png.path());
        assert.equal(pngBytes.subarray(1, 4).toString(), 'PNG');
        const [zip] = await Promise.all([page.waitForEvent('download'), page.click('#zip')]);
        const archive = await JSZip.loadAsync(await fs.readFile(await zip.path()));
        assert.equal(Object.keys(archive.files).length, 8);
        assert.deepEqual(await archive.file('stamp_01.png').async('nodebuffer'), pngBytes);
        await page.waitForLoadState('networkidle');
        assert.deepEqual(requests, [], 'Image selection, processing and downloads must not send network requests');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        assert.deepEqual(errors, []);
        console.log(`PASS ${width}px: upload, presets, numeric/drag adjustment, individual crop, padding, PNG/ZIP contents, layout, no image-operation network requests`);
      } finally { await context.close(); }
    }
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
