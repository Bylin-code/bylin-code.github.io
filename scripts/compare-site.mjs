// Compare two Jekyll build directories without modifying either build.
// Usage: npm run test:visual -- /tmp/site-before /tmp/site-after
import { chromium } from 'playwright';
import { serve } from './serve-build.mjs';
import { readdir, mkdir } from 'node:fs/promises';
import { resolve, join, relative } from 'node:path';
import assert from 'node:assert/strict';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
function sameScreenshot(left, right) {
  if (left.equals(right)) return true;
  const a = PNG.sync.read(left), b = PNG.sync.read(right);
  if (a.width !== b.width || a.height !== b.height) return false;
  // Ignore minor browser JPEG resampling noise; require zero pixels above this
  // perceptual threshold (stricter than pixelmatch's default of 0.1).
  return pixelmatch(a.data, b.data, null, a.width, a.height, { threshold: 0.05 }) === 0;
}
const [before, after] = process.argv.slice(2).map((p) => resolve(p));
if (!before || !after) throw new Error('Pass the before and after build directories.');
async function pages(dir) {
  const paths = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (['assets', 'admin'].includes(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) paths.push(...await pages(path));
    else if (entry.name.endsWith('.html')) paths.push(path);
  }
  return paths;
}
const servers = await Promise.all([serve(before), serve(after)]);
const browser = await chromium.launch();
const output = process.env.VISUAL_OUTPUT || '/tmp/bylin-visual-comparison';
await mkdir(output, { recursive: true });
let count = 0;
const failures = [];
try {
  for (const width of [390, 1440]) {
    const tabs = await Promise.all(servers.map(async ({ url }) => {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: 1 });
      // Third-party embeds are outside this source refactor; keep both runs deterministic.
      await page.route('**/*', (route) => route.request().url().startsWith(url) || route.request().url().startsWith('data:') ? route.continue() : route.abort());
      return page;
    }));
    for (const file of await pages(before)) {
      const route = '/' + relative(before, file);
      if (process.env.VISUAL_FILTER && !new RegExp(process.env.VISUAL_FILTER).test(route)) continue;
      const shots = await Promise.all(tabs.map(async (page, i) => {
        await page.goto(servers[i].url + route, { waitUntil: 'networkidle' });
        await page.evaluate(async () => {
          document.querySelectorAll('img').forEach((img) => img.loading = 'eager');
          await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
          await document.fonts.ready;
          await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
        });
        const options = { fullPage: true, animations: 'disabled', mask: [page.locator('iframe, object')] };
        // Warm the full-page raster before comparing; off-screen JPEGs may initially
        // be painted with a lower-quality resize even after image.decode() resolves.
        await page.screenshot(options);
        return page.screenshot(options);
      }));
      if (!sameScreenshot(shots[0], shots[1])) {
        const name = `${width}-${route.replace(/\//g, '_')}`;
        const { writeFile } = await import('node:fs/promises');
        await Promise.all(shots.map((shot, i) => writeFile(join(output, `${name}-${i ? 'after' : 'before'}.png`), shot)));
        failures.push(`${width}px ${route}`);
      }
      count++;
      console.log(`Checked ${width}px ${route}`);
    }
    // Verify the mobile overlay, contact hover, and home action hover as well.
    for (const [route, selector, action] of width === 390
      ? [['/', '#toggle-menu-main-mobile', 'click']]
      : [['/contact/', '.contact-icon.github', 'hover'], ['/', '.action-link', 'hover']]) {
      const shots = await Promise.all(tabs.map(async (page, i) => {
        await page.goto(servers[i].url + route, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await page.locator(selector).first()[action]();
        await page.waitForTimeout(400);
        return page.screenshot({ animations: 'disabled' });
      }));
      if (!sameScreenshot(shots[0], shots[1])) failures.push(`${width}px ${route} ${action}`);
      count++;
    }
    await Promise.all(tabs.map((page) => page.close()));
  }
  console.log(`${count} visual comparisons; ${failures.length} differences.`);
  assert.deepEqual(failures, [], `Inspect screenshots in ${output}: ${failures.join(', ')}`);
} finally {
  await browser.close();
  servers.forEach(({ server }) => server.close());
}
